-- ============================================================
-- 0004: Funciones auxiliares y triggers
-- ============================================================

-- ---------------------------------------------------------
-- Helpers de pertenencia a grupo (SECURITY DEFINER para evitar
-- recursión de RLS al usarlos dentro de policies de otras tablas).
-- ---------------------------------------------------------

create or replace function public.es_miembro_grupo(p_grupo_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.miembros_grupo mg
    where mg.grupo_id = p_grupo_id
      and mg.usuario_id = auth.uid()
      and mg.activo = true
  );
$$;

create or replace function public.es_admin_grupo(p_grupo_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.miembros_grupo mg
    where mg.grupo_id = p_grupo_id
      and mg.usuario_id = auth.uid()
      and mg.activo = true
      and mg.rol = 'admin'
  );
$$;

-- ---------------------------------------------------------
-- Crear grupo + alta del creador como admin, de forma atómica.
-- ---------------------------------------------------------

create or replace function public.crear_grupo(p_nombre text, p_tipo grupo_tipo default 'pareja')
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_grupo_id uuid;
begin
  insert into public.grupos (nombre, tipo, creado_por)
  values (p_nombre, p_tipo, auth.uid())
  returning id into v_grupo_id;

  insert into public.miembros_grupo (grupo_id, usuario_id, rol, activo)
  values (v_grupo_id, auth.uid(), 'admin', true);

  return v_grupo_id;
end;
$$;

-- ---------------------------------------------------------
-- Invitaciones: generar código único y unirse a un grupo por código.
-- ---------------------------------------------------------

-- SECURITY DEFINER: el chequeo de colisión debe ver TODOS los códigos
-- (cualquier grupo, cualquier estado), no solo los del grupo del llamador
-- bajo su propio RLS -- "codigo" es unique a nivel de toda la tabla, no
-- solo entre los códigos activos.
create or replace function public.generar_codigo_invitacion()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_codigo text;
  v_existe boolean;
begin
  loop
    v_codigo := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    select exists(
      select 1 from public.invitaciones_grupo
      where codigo = v_codigo
    ) into v_existe;
    exit when not v_existe;
  end loop;
  return v_codigo;
end;
$$;

-- Se ejecuta con el JWT del usuario que se une (auth.uid() = ese usuario).
-- SECURITY DEFINER solo eleva privilegios de tabla, no cambia la identidad.
create or replace function public.unirse_a_grupo(p_codigo text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invitacion record;
begin
  select * into v_invitacion
  from public.invitaciones_grupo
  where codigo = upper(p_codigo)
  for update;

  if v_invitacion.id is null then
    raise exception 'Código de invitación inválido' using errcode = 'P0001';
  end if;

  if v_invitacion.estado <> 'activo' then
    raise exception 'Código de invitación ya usado o expirado' using errcode = 'P0002';
  end if;

  if v_invitacion.expira_at < now() then
    update public.invitaciones_grupo set estado = 'expirado' where id = v_invitacion.id;
    raise exception 'Código de invitación expirado' using errcode = 'P0002';
  end if;

  insert into public.miembros_grupo (grupo_id, usuario_id, rol, activo)
  values (v_invitacion.grupo_id, auth.uid(), 'miembro', true)
  on conflict (grupo_id, usuario_id) do update set activo = true;

  update public.invitaciones_grupo set estado = 'usado' where id = v_invitacion.id;

  return v_invitacion.grupo_id;
end;
$$;

-- ---------------------------------------------------------
-- Campos derivados: costo_total de salidas y monto_objetivo_total
-- de presupuestos_quincenales se recalculan siempre desde sus tablas
-- hijas, nunca se confía en un valor enviado por el cliente.
-- ---------------------------------------------------------

-- Recalcula tanto la salida vieja como la nueva cuando pagos_salida.salida_id
-- cambia de valor (reasignar un pago a otra salida), no solo cuando cambia
-- el monto.
create or replace function public.fn_recalcular_costo_salida()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.salida_id is not null then
    update public.salidas
    set costo_total = coalesce(
      (select sum(monto) from public.pagos_salida where salida_id = old.salida_id),
      0
    )
    where id = old.salida_id;
  end if;

  if new.salida_id is not null and new.salida_id is distinct from old.salida_id then
    update public.salidas
    set costo_total = coalesce(
      (select sum(monto) from public.pagos_salida where salida_id = new.salida_id),
      0
    )
    where id = new.salida_id;
  end if;

  return null;
end;
$$;

create trigger trg_pagos_salida_recalcular_costo
after insert or update of monto, salida_id or delete on public.pagos_salida
for each row execute function public.fn_recalcular_costo_salida();

-- Igual que fn_recalcular_costo_salida: recalcula ambos presupuestos si
-- aportes_presupuesto.presupuesto_id llega a cambiar de valor.
create or replace function public.fn_recalcular_objetivo_presupuesto()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.presupuesto_id is not null then
    update public.presupuestos_quincenales
    set monto_objetivo_total = coalesce(
      (select sum(monto_comprometido) from public.aportes_presupuesto where presupuesto_id = old.presupuesto_id),
      0
    )
    where id = old.presupuesto_id;
  end if;

  if new.presupuesto_id is not null and new.presupuesto_id is distinct from old.presupuesto_id then
    update public.presupuestos_quincenales
    set monto_objetivo_total = coalesce(
      (select sum(monto_comprometido) from public.aportes_presupuesto where presupuesto_id = new.presupuesto_id),
      0
    )
    where id = new.presupuesto_id;
  end if;

  return null;
end;
$$;

create trigger trg_aportes_recalcular_objetivo
after insert or update of monto_comprometido, presupuesto_id or delete on public.aportes_presupuesto
for each row execute function public.fn_recalcular_objetivo_presupuesto();

-- Protección: costo_total y monto_objetivo_total solo pueden cambiar
-- vía los triggers anteriores (que corren como su función SECURITY
-- DEFINER, con auth.role() = 'service_role' cuando el backend usa la
-- service key). Un cliente autenticado normal no puede pisarlos a mano.

create or replace function public.fn_proteger_costo_total()
returns trigger
language plpgsql
as $$
begin
  if new.costo_total is distinct from old.costo_total and auth.role() <> 'service_role' then
    raise exception 'costo_total es un campo derivado; no puede modificarse directamente';
  end if;
  return new;
end;
$$;

create trigger trg_proteger_costo_total
before update on public.salidas
for each row execute function public.fn_proteger_costo_total();

create or replace function public.fn_proteger_objetivo_total()
returns trigger
language plpgsql
as $$
begin
  if new.monto_objetivo_total is distinct from old.monto_objetivo_total and auth.role() <> 'service_role' then
    raise exception 'monto_objetivo_total es un campo derivado; no puede modificarse directamente';
  end if;
  return new;
end;
$$;

create trigger trg_proteger_objetivo_total
before update on public.presupuestos_quincenales
for each row execute function public.fn_proteger_objetivo_total();

create or replace function public.fn_proteger_monto_aportado()
returns trigger
language plpgsql
as $$
begin
  if new.monto_aportado is distinct from old.monto_aportado and auth.role() <> 'service_role' then
    raise exception 'monto_aportado es un campo derivado; no puede modificarse directamente';
  end if;
  return new;
end;
$$;

create trigger trg_proteger_monto_aportado
before update on public.aportes_presupuesto
for each row execute function public.fn_proteger_monto_aportado();

-- ---------------------------------------------------------
-- Gastado real de la quincena = SUM(pagos_salida del usuario en el
-- grupo, por fecha de la salida) + SUM(gastos individuales del
-- usuario marcados con ese grupo_id), acotado al rango de la quincena
-- vigente. Se expone como función porque depende de un rango de
-- fechas dinámico cruzando dos tablas; el backend la invoca (con la
-- service key) después de crear/editar/borrar un pago o un gasto
-- compartido, para refrescar el cache en aportes_presupuesto.
-- ---------------------------------------------------------

create or replace function public.recalcular_gastado_real(
  p_usuario_id uuid,
  p_grupo_id uuid,
  p_fecha date
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_presupuesto record;
  v_total numeric(12, 2);
begin
  -- El backend la invoca con la service key (auth.role() = 'service_role'),
  -- confiando en p_usuario_id/p_grupo_id. Si alguna vez se llama con el JWT
  -- de un usuario normal (p. ej. directo contra PostgREST), solo puede
  -- recalcular su propio aporte y solo en un grupo del que es miembro.
  if auth.role() <> 'service_role'
     and (auth.uid() is distinct from p_usuario_id or not public.es_miembro_grupo(p_grupo_id)) then
    raise exception 'No autorizado para recalcular este gasto' using errcode = 'P0003';
  end if;

  select id, quincena_inicio, quincena_fin
  into v_presupuesto
  from public.presupuestos_quincenales
  where grupo_id = p_grupo_id
    and p_fecha between quincena_inicio and quincena_fin
  limit 1;

  if v_presupuesto.id is null then
    return; -- no hay presupuesto definido para esa quincena, nada que actualizar
  end if;

  select coalesce(sum(ps.monto), 0)
  into v_total
  from public.pagos_salida ps
  join public.salidas s on s.id = ps.salida_id
  where ps.usuario_id = p_usuario_id
    and s.grupo_id = p_grupo_id
    and s.fecha between v_presupuesto.quincena_inicio and v_presupuesto.quincena_fin;

  v_total := v_total + coalesce((
    select sum(g.monto)
    from public.gastos g
    where g.usuario_id = p_usuario_id
      and g.grupo_id = p_grupo_id
      and g.fecha between v_presupuesto.quincena_inicio and v_presupuesto.quincena_fin
  ), 0);

  update public.aportes_presupuesto
  set monto_aportado = v_total
  where presupuesto_id = v_presupuesto.id
    and usuario_id = p_usuario_id;
end;
$$;
