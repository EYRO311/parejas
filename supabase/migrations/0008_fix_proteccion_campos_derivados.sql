-- ============================================================
-- 0008: Corrige el candado de costo_total / monto_objetivo_total
-- ============================================================
-- Bug: la protección comparaba auth.role() = 'service_role', pero el
-- trigger de recálculo (fn_recalcular_costo_salida /
-- fn_recalcular_objetivo_presupuesto) corre en la MISMA sesión/
-- transacción que el usuario autenticado que originó el cambio (p. ej.
-- registrar un pago o definir un aporte), así que auth.role() seguía
-- siendo 'authenticated' y el candado se disparaba también contra su
-- propio recálculo legítimo: "campo derivado; no puede modificarse
-- directamente".
--
-- Fix: una bandera local a la transacción (set_config(..., true), se
-- resetea sola al terminar la transacción) que el trigger de recálculo
-- prende justo antes de escribir, y que el trigger de protección exige
-- para dejar pasar el cambio. Un PATCH directo a PostgREST con el anon
-- key (sin pasar por el recálculo) sigue bloqueado igual que antes.

create or replace function public.fn_recalcular_costo_salida()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_salida_id uuid := coalesce(new.salida_id, old.salida_id);
begin
  perform set_config('finanzas.recalculo_costo_total', 'on', true);

  update public.salidas
  set costo_total = coalesce(
    (select sum(monto) from public.pagos_salida where salida_id = v_salida_id),
    0
  )
  where id = v_salida_id;

  return null;
end;
$$;

create or replace function public.fn_proteger_costo_total()
returns trigger
language plpgsql
as $$
begin
  if new.costo_total is distinct from old.costo_total
     and coalesce(current_setting('finanzas.recalculo_costo_total', true), '') <> 'on' then
    raise exception 'costo_total es un campo derivado; no puede modificarse directamente';
  end if;
  return new;
end;
$$;

create or replace function public.fn_recalcular_objetivo_presupuesto()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_presupuesto_id uuid := coalesce(new.presupuesto_id, old.presupuesto_id);
begin
  perform set_config('finanzas.recalculo_objetivo_total', 'on', true);

  update public.presupuestos_quincenales
  set monto_objetivo_total = coalesce(
    (select sum(monto_comprometido) from public.aportes_presupuesto where presupuesto_id = v_presupuesto_id),
    0
  )
  where id = v_presupuesto_id;

  return null;
end;
$$;

create or replace function public.fn_proteger_objetivo_total()
returns trigger
language plpgsql
as $$
begin
  if new.monto_objetivo_total is distinct from old.monto_objetivo_total
     and coalesce(current_setting('finanzas.recalculo_objetivo_total', true), '') <> 'on' then
    raise exception 'monto_objetivo_total es un campo derivado; no puede modificarse directamente';
  end if;
  return new;
end;
$$;
