-- ============================================================
-- 0001: Extensiones y tipos enumerados
-- ============================================================

create extension if not exists pgcrypto;

create type grupo_tipo as enum ('pareja', 'familia', 'roommates');
create type miembro_rol as enum ('admin', 'miembro');
create type invitacion_estado as enum ('activo', 'usado', 'expirado');
create type presupuesto_estado as enum ('activo', 'cerrado');


-- ============================================================
-- 0002: Tablas base ASUMIDAS de la app "Finanzas"
-- ============================================================
-- No se encontró un proyecto "Finanzas" existente en disco al generar
-- este schema. Estas tablas se crean aquí como SUPUESTO razonable de lo
-- que la app base ya tendría, únicamente para que "Finanzas en Pareja"
-- tenga algo real sobre lo cual extender (grupo_id, categorías a nivel
-- grupo, etc). Si el proyecto "Finanzas" real ya existe, reemplaza este
-- archivo por las migraciones reales y conserva solo 0003 en adelante,
-- ajustando los tipos de columna si difieren (p. ej. nombres, longitudes).
--
-- Supuestos:
--   - Autenticación vía Supabase Auth (auth.users).
--   - public.usuarios es un perfil 1:1 con auth.users.
--   - public.categorias ya soporta categorías personalizadas por usuario.
--   - public.gastos ya registra gastos personales por usuario.
-- ============================================================

create table public.usuarios (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null,
  email text not null unique,
  created_at timestamptz not null default now()
);

create table public.categorias (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references public.usuarios (id) on delete cascade,
  nombre text not null,
  icono text,
  color text,
  created_at timestamptz not null default now(),
  constraint categorias_nombre_no_vacio check (btrim(nombre) <> '')
);

create table public.gastos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.usuarios (id) on delete cascade,
  categoria_id uuid references public.categorias (id) on delete set null,
  monto numeric(12, 2) not null check (monto > 0),
  -- Preparado para multi-moneda a futuro (ver comentario en 0003). Por ahora
  -- todo se asume en una sola moneda operativa y no hay conversión.
  moneda char(3) not null default 'MXN',
  descripcion text,
  fecha date not null,
  created_at timestamptz not null default now()
);

create index gastos_usuario_fecha_idx on public.gastos (usuario_id, fecha);

comment on table public.usuarios is 'ASUMIDA: perfil 1:1 con auth.users. Reemplazar si la app Finanzas real difiere.';
comment on table public.categorias is 'ASUMIDA: sistema de categorías personalizables ya existente en Finanzas.';
comment on table public.gastos is 'ASUMIDA: gastos personales ya existentes en Finanzas.';


-- ============================================================
-- 0003: Tablas de "Finanzas en Pareja" + extensión de tablas base
-- ============================================================

-- ---------------------------------------------------------
-- Grupos
-- ---------------------------------------------------------

create table public.grupos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  tipo grupo_tipo not null default 'pareja',
  creado_por uuid not null references public.usuarios (id),
  created_at timestamptz not null default now(),
  constraint grupos_nombre_no_vacio check (btrim(nombre) <> '')
);

create table public.miembros_grupo (
  id uuid primary key default gen_random_uuid(),
  grupo_id uuid not null references public.grupos (id) on delete cascade,
  usuario_id uuid not null references public.usuarios (id) on delete cascade,
  rol miembro_rol not null default 'miembro',
  fecha_union timestamptz not null default now(),
  activo boolean not null default true,
  unique (grupo_id, usuario_id)
);

create index miembros_grupo_usuario_idx on public.miembros_grupo (usuario_id) where activo;

create table public.invitaciones_grupo (
  id uuid primary key default gen_random_uuid(),
  grupo_id uuid not null references public.grupos (id) on delete cascade,
  codigo text not null unique,
  creado_por uuid not null references public.usuarios (id),
  estado invitacion_estado not null default 'activo',
  expira_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now(),
  constraint invitaciones_codigo_formato check (codigo ~ '^[A-Z0-9]{6}$')
);

create index invitaciones_grupo_codigo_activo_idx
  on public.invitaciones_grupo (codigo)
  where estado = 'activo';

-- ---------------------------------------------------------
-- Extensión de tablas base: categorías y gastos a nivel grupo
-- ---------------------------------------------------------

alter table public.categorias
  add column grupo_id uuid references public.grupos (id) on delete cascade;

alter table public.categorias
  add constraint categorias_dueno_exclusivo check (
    (usuario_id is not null and grupo_id is null)   -- categoría personal
    or (usuario_id is null and grupo_id is not null) -- categoría de grupo (ej. "citas")
    or (usuario_id is null and grupo_id is null)      -- categoría global del sistema
  );

alter table public.gastos
  add column grupo_id uuid references public.grupos (id) on delete set null;

comment on column public.gastos.grupo_id is
  'NULL = gasto personal privado. No NULL = el usuario lo marcó como compartido con ese grupo, sin duplicar el registro.';

create index gastos_grupo_fecha_idx on public.gastos (grupo_id, fecha) where grupo_id is not null;

-- ---------------------------------------------------------
-- Salidas
-- ---------------------------------------------------------

create table public.salidas (
  id uuid primary key default gen_random_uuid(),
  grupo_id uuid not null references public.grupos (id) on delete cascade,
  titulo text not null,
  descripcion text,
  fecha date not null,
  categoria_id uuid references public.categorias (id) on delete set null,
  costo_total numeric(12, 2) not null default 0,
  -- Preparado para multi-moneda a futuro: por ahora un solo código de moneda
  -- por salida, sin conversión ni tabla de tasas de cambio.
  moneda char(3) not null default 'MXN',
  creado_por uuid not null references public.usuarios (id),
  created_at timestamptz not null default now(),
  constraint salidas_titulo_no_vacio check (btrim(titulo) <> ''),
  constraint salidas_costo_total_no_negativo check (costo_total >= 0)
);

create index salidas_grupo_fecha_idx on public.salidas (grupo_id, fecha desc);

comment on column public.salidas.costo_total is
  'Derivado: mantenido por trigger trg_pagos_salida_recalcular_costo a partir de SUM(pagos_salida.monto). No editar directamente (protegido también por trigger).';

create table public.pagos_salida (
  id uuid primary key default gen_random_uuid(),
  salida_id uuid not null references public.salidas (id) on delete cascade,
  usuario_id uuid not null references public.usuarios (id),
  monto numeric(12, 2) not null check (monto > 0),
  banco text,
  captura_url text,
  created_at timestamptz not null default now()
);

create index pagos_salida_salida_idx on public.pagos_salida (salida_id);
create index pagos_salida_usuario_idx on public.pagos_salida (usuario_id);

create table public.reparto_salida (
  id uuid primary key default gen_random_uuid(),
  salida_id uuid not null references public.salidas (id) on delete cascade,
  usuario_id uuid not null references public.usuarios (id),
  monto_le_corresponde numeric(12, 2) not null check (monto_le_corresponde >= 0),
  liquidado boolean not null default false,
  unique (salida_id, usuario_id)
);

create index reparto_salida_salida_idx on public.reparto_salida (salida_id);

-- ---------------------------------------------------------
-- Presupuesto quincenal
-- ---------------------------------------------------------

create table public.presupuestos_quincenales (
  id uuid primary key default gen_random_uuid(),
  grupo_id uuid not null references public.grupos (id) on delete cascade,
  quincena_inicio date not null,
  quincena_fin date not null,
  monto_objetivo_total numeric(12, 2) not null default 0,
  estado presupuesto_estado not null default 'activo',
  created_at timestamptz not null default now(),
  constraint presupuestos_rango_valido check (quincena_fin > quincena_inicio),
  constraint presupuestos_objetivo_no_negativo check (monto_objetivo_total >= 0),
  unique (grupo_id, quincena_inicio, quincena_fin)
);

create index presupuestos_grupo_idx on public.presupuestos_quincenales (grupo_id, quincena_inicio desc);

comment on column public.presupuestos_quincenales.monto_objetivo_total is
  'Derivado: mantenido por trigger trg_aportes_recalcular_objetivo a partir de SUM(aportes_presupuesto.monto_comprometido). Nunca se captura a mano.';

create table public.aportes_presupuesto (
  id uuid primary key default gen_random_uuid(),
  presupuesto_id uuid not null references public.presupuestos_quincenales (id) on delete cascade,
  usuario_id uuid not null references public.usuarios (id),
  monto_comprometido numeric(12, 2) not null check (monto_comprometido >= 0),
  monto_aportado numeric(12, 2) not null default 0 check (monto_aportado >= 0),
  unique (presupuesto_id, usuario_id)
);

create index aportes_presupuesto_presupuesto_idx on public.aportes_presupuesto (presupuesto_id);

comment on column public.aportes_presupuesto.monto_aportado is
  'Cache del gasto real (salidas vía pagos_salida + gastos individuales del grupo, filtrado por fecha de la quincena). Recalculado por public.recalcular_gastado_real(), invocado por el backend tras cambios en pagos_salida o gastos. Solo escribible por service_role (protegido por trigger).';


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

create or replace function public.generar_codigo_invitacion()
returns text
language plpgsql
as $$
declare
  v_codigo text;
  v_existe boolean;
begin
  loop
    v_codigo := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    select exists(
      select 1 from public.invitaciones_grupo
      where codigo = v_codigo and estado = 'activo'
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

create or replace function public.fn_recalcular_costo_salida()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_salida_id uuid := coalesce(new.salida_id, old.salida_id);
begin
  update public.salidas
  set costo_total = coalesce(
    (select sum(monto) from public.pagos_salida where salida_id = v_salida_id),
    0
  )
  where id = v_salida_id;
  return null;
end;
$$;

create trigger trg_pagos_salida_recalcular_costo
after insert or update of monto or delete on public.pagos_salida
for each row execute function public.fn_recalcular_costo_salida();

create or replace function public.fn_recalcular_objetivo_presupuesto()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_presupuesto_id uuid := coalesce(new.presupuesto_id, old.presupuesto_id);
begin
  update public.presupuestos_quincenales
  set monto_objetivo_total = coalesce(
    (select sum(monto_comprometido) from public.aportes_presupuesto where presupuesto_id = v_presupuesto_id),
    0
  )
  where id = v_presupuesto_id;
  return null;
end;
$$;

create trigger trg_aportes_recalcular_objetivo
after insert or update of monto_comprometido or delete on public.aportes_presupuesto
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


-- ============================================================
-- 0005: Row Level Security
-- ============================================================

alter table public.usuarios enable row level security;
alter table public.categorias enable row level security;
alter table public.gastos enable row level security;
alter table public.grupos enable row level security;
alter table public.miembros_grupo enable row level security;
alter table public.invitaciones_grupo enable row level security;
alter table public.salidas enable row level security;
alter table public.pagos_salida enable row level security;
alter table public.reparto_salida enable row level security;
alter table public.presupuestos_quincenales enable row level security;
alter table public.aportes_presupuesto enable row level security;

-- ---------------------------------------------------------
-- usuarios
-- ---------------------------------------------------------

create policy usuarios_select_propio on public.usuarios
  for select using (id = auth.uid());

-- Necesario para poder mostrar nombre/email de tus compañeros de grupo.
create policy usuarios_select_companeros_grupo on public.usuarios
  for select using (
    exists (
      select 1
      from public.miembros_grupo mg1
      join public.miembros_grupo mg2 on mg1.grupo_id = mg2.grupo_id
      where mg1.usuario_id = auth.uid() and mg1.activo
        and mg2.usuario_id = usuarios.id and mg2.activo
    )
  );

create policy usuarios_update_propio on public.usuarios
  for update using (id = auth.uid()) with check (id = auth.uid());

-- ---------------------------------------------------------
-- categorias
-- ---------------------------------------------------------

create policy categorias_select on public.categorias
  for select using (
    (usuario_id is null and grupo_id is null) -- categorías del sistema
    or usuario_id = auth.uid()
    or (grupo_id is not null and public.es_miembro_grupo(grupo_id))
  );

create policy categorias_insert on public.categorias
  for insert with check (
    (usuario_id = auth.uid() and grupo_id is null)
    or (usuario_id is null and grupo_id is not null and public.es_miembro_grupo(grupo_id))
  );

create policy categorias_update on public.categorias
  for update using (
    usuario_id = auth.uid()
    or (grupo_id is not null and public.es_miembro_grupo(grupo_id))
  );

create policy categorias_delete on public.categorias
  for delete using (
    usuario_id = auth.uid()
    or (grupo_id is not null and public.es_admin_grupo(grupo_id))
  );

-- ---------------------------------------------------------
-- gastos
-- ---------------------------------------------------------

create policy gastos_select on public.gastos
  for select using (
    usuario_id = auth.uid()
    or (grupo_id is not null and public.es_miembro_grupo(grupo_id))
  );

create policy gastos_insert on public.gastos
  for insert with check (
    usuario_id = auth.uid()
    and (grupo_id is null or public.es_miembro_grupo(grupo_id))
  );

create policy gastos_update on public.gastos
  for update using (usuario_id = auth.uid())
  with check (usuario_id = auth.uid() and (grupo_id is null or public.es_miembro_grupo(grupo_id)));

create policy gastos_delete on public.gastos
  for delete using (usuario_id = auth.uid());

-- ---------------------------------------------------------
-- grupos
-- ---------------------------------------------------------

create policy grupos_select on public.grupos
  for select using (public.es_miembro_grupo(id));

-- El alta real se hace vía public.crear_grupo() (atómica con la
-- membresía admin), pero se deja también la policy de insert directa
-- por si el backend necesita insertar en dos pasos dentro de una
-- transacción propia.
create policy grupos_insert on public.grupos
  for insert with check (creado_por = auth.uid());

create policy grupos_update on public.grupos
  for update using (public.es_admin_grupo(id));

create policy grupos_delete on public.grupos
  for delete using (public.es_admin_grupo(id));

-- ---------------------------------------------------------
-- miembros_grupo
-- ---------------------------------------------------------

create policy miembros_grupo_select on public.miembros_grupo
  for select using (public.es_miembro_grupo(grupo_id));

-- Alta por invitación pasa por public.unirse_a_grupo() (SECURITY
-- DEFINER); esta policy solo cubre altas manuales hechas por un admin.
create policy miembros_grupo_insert_admin on public.miembros_grupo
  for insert with check (public.es_admin_grupo(grupo_id));

-- Admin puede gestionar a cualquiera; cualquier miembro puede
-- modificarse a sí mismo (ej. salir del grupo poniendo activo = false).
create policy miembros_grupo_update on public.miembros_grupo
  for update using (public.es_admin_grupo(grupo_id) or usuario_id = auth.uid())
  with check (public.es_admin_grupo(grupo_id) or usuario_id = auth.uid());

create policy miembros_grupo_delete on public.miembros_grupo
  for delete using (public.es_admin_grupo(grupo_id) or usuario_id = auth.uid());

-- ---------------------------------------------------------
-- invitaciones_grupo
-- ---------------------------------------------------------

create policy invitaciones_select on public.invitaciones_grupo
  for select using (public.es_miembro_grupo(grupo_id));

-- Cualquier integrante del grupo puede generar un código.
create policy invitaciones_insert on public.invitaciones_grupo
  for insert with check (
    public.es_miembro_grupo(grupo_id) and creado_por = auth.uid()
  );

-- Permite expirar manualmente un código propio o de otro miembro.
create policy invitaciones_update on public.invitaciones_grupo
  for update using (public.es_miembro_grupo(grupo_id));

-- ---------------------------------------------------------
-- salidas
-- ---------------------------------------------------------

create policy salidas_select on public.salidas
  for select using (public.es_miembro_grupo(grupo_id));

create policy salidas_insert on public.salidas
  for insert with check (public.es_miembro_grupo(grupo_id) and creado_por = auth.uid());

create policy salidas_update on public.salidas
  for update using (
    public.es_miembro_grupo(grupo_id)
    and (creado_por = auth.uid() or public.es_admin_grupo(grupo_id))
  );

create policy salidas_delete on public.salidas
  for delete using (creado_por = auth.uid() or public.es_admin_grupo(grupo_id));

-- ---------------------------------------------------------
-- pagos_salida
-- ---------------------------------------------------------

create policy pagos_salida_select on public.pagos_salida
  for select using (
    exists (select 1 from public.salidas s where s.id = salida_id and public.es_miembro_grupo(s.grupo_id))
  );

create policy pagos_salida_insert on public.pagos_salida
  for insert with check (
    usuario_id = auth.uid()
    and exists (select 1 from public.salidas s where s.id = salida_id and public.es_miembro_grupo(s.grupo_id))
  );

create policy pagos_salida_update on public.pagos_salida
  for update using (usuario_id = auth.uid());

create policy pagos_salida_delete on public.pagos_salida
  for delete using (usuario_id = auth.uid());

-- ---------------------------------------------------------
-- reparto_salida (reparto manual, cualquier miembro del grupo puede
-- proponerlo/editarlo; borrar queda reservado al creador de la salida
-- o a un admin, para evitar que se borre un acuerdo unilateralmente).
-- ---------------------------------------------------------

create policy reparto_salida_select on public.reparto_salida
  for select using (
    exists (select 1 from public.salidas s where s.id = salida_id and public.es_miembro_grupo(s.grupo_id))
  );

create policy reparto_salida_insert on public.reparto_salida
  for insert with check (
    exists (select 1 from public.salidas s where s.id = salida_id and public.es_miembro_grupo(s.grupo_id))
  );

create policy reparto_salida_update on public.reparto_salida
  for update using (
    exists (select 1 from public.salidas s where s.id = salida_id and public.es_miembro_grupo(s.grupo_id))
  );

create policy reparto_salida_delete on public.reparto_salida
  for delete using (
    exists (
      select 1 from public.salidas s
      where s.id = salida_id
        and (s.creado_por = auth.uid() or public.es_admin_grupo(s.grupo_id))
    )
  );

-- ---------------------------------------------------------
-- presupuestos_quincenales
-- ---------------------------------------------------------

create policy presupuestos_select on public.presupuestos_quincenales
  for select using (public.es_miembro_grupo(grupo_id));

create policy presupuestos_insert on public.presupuestos_quincenales
  for insert with check (public.es_miembro_grupo(grupo_id));

-- Cerrar/reabrir la quincena queda reservado a un admin del grupo.
create policy presupuestos_update on public.presupuestos_quincenales
  for update using (public.es_admin_grupo(grupo_id));

-- ---------------------------------------------------------
-- aportes_presupuesto
-- ---------------------------------------------------------

create policy aportes_select on public.aportes_presupuesto
  for select using (
    exists (
      select 1 from public.presupuestos_quincenales p
      where p.id = presupuesto_id and public.es_miembro_grupo(p.grupo_id)
    )
  );

-- Cada quien define su propio límite (monto_comprometido); nadie
-- puede definir el aporte de otro usuario.
create policy aportes_insert on public.aportes_presupuesto
  for insert with check (
    usuario_id = auth.uid()
    and exists (
      select 1 from public.presupuestos_quincenales p
      where p.id = presupuesto_id and public.es_miembro_grupo(p.grupo_id)
    )
  );

create policy aportes_update on public.aportes_presupuesto
  for update using (usuario_id = auth.uid())
  with check (usuario_id = auth.uid());


-- ============================================================
-- 0006: Alta automática en public.usuarios al registrarse
-- ============================================================
-- Este proyecto Supabase es compartido con "asistente", que ya tiene su
-- propio trigger `on_auth_user_created` -> `public.handle_new_user()`
-- rellenando `public.profiles`. NO tocamos esos objetos: se agregan aquí
-- una función y un trigger con nombres distintos, exclusivos de
-- "Finanzas en Pareja", para no pisar ni romper el alta de asistente.
-- Ambos triggers conviven sobre auth.users sin conflicto (cada uno
-- inserta en su propia tabla).

create or replace function public.handle_new_user_finanzas()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.usuarios (id, nombre, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_finanzas on auth.users;
create trigger on_auth_user_created_finanzas
  after insert on auth.users
  for each row execute function public.handle_new_user_finanzas();

-- Backfill: cubre cuentas que ya existían en este proyecto (creadas vía
-- asistente/quiniela) antes de que este trigger existiera, para que
-- puedan usar Finanzas en Pareja sin re-registrarse.
insert into public.usuarios (id, nombre, email)
select
  u.id,
  coalesce(u.raw_user_meta_data ->> 'full_name', split_part(u.email, '@', 1)),
  u.email
from auth.users u
where u.email is not null
on conflict (id) do nothing;


