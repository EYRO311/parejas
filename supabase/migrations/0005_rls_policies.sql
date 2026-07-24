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
