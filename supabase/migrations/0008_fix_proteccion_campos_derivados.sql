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
--
-- De paso, fn_recalcular_costo_salida / fn_recalcular_objetivo_presupuesto
-- ahora recalculan tanto el registro viejo como el nuevo si salida_id /
-- presupuesto_id llegan a reasignarse (antes solo recalculaban uno de los
-- dos lados, dejando al otro con un total stale).

-- Combina el fix de la bandera de protección (abajo) con el de recalcular
-- ambos lados cuando pagos_salida.salida_id cambia de valor (ver 0004).
create or replace function public.fn_recalcular_costo_salida()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform set_config('finanzas.recalculo_costo_total', 'on', true);

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

-- Mismo criterio: recalcula ambos presupuestos si presupuesto_id cambia.
create or replace function public.fn_recalcular_objetivo_presupuesto()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform set_config('finanzas.recalculo_objetivo_total', 'on', true);

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
