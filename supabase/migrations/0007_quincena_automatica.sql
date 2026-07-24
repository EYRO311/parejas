-- ============================================================
-- 0007: Quincenas automáticas (convención MX: 1-15 y 16-fin de mes)
-- ============================================================
-- Antes el presupuesto quincenal se creaba a mano eligiendo fechas.
-- Ahora se calcula la quincena estándar de la fecha actual y se
-- garantiza que exista (se crea sola la primera vez que alguien del
-- grupo la consulta) — nadie tiene que capturar fechas.

create or replace function public.limites_quincena(p_fecha date, out inicio date, out fin date)
language sql
immutable
as $$
  select
    case when extract(day from p_fecha) <= 15
      then date_trunc('month', p_fecha)::date
      else (date_trunc('month', p_fecha) + interval '15 days')::date
    end,
    case when extract(day from p_fecha) <= 15
      then (date_trunc('month', p_fecha) + interval '14 days')::date
      else (date_trunc('month', p_fecha) + interval '1 month' - interval '1 day')::date
    end;
$$;

create or replace function public.obtener_o_crear_presupuesto_actual(p_grupo_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inicio date;
  v_fin date;
  v_id uuid;
begin
  if not public.es_miembro_grupo(p_grupo_id) then
    raise exception 'No perteneces a este grupo' using errcode = 'P0003';
  end if;

  select l.inicio, l.fin into v_inicio, v_fin from public.limites_quincena(current_date) l;

  select id into v_id
  from public.presupuestos_quincenales
  where grupo_id = p_grupo_id
    and quincena_inicio = v_inicio
    and quincena_fin = v_fin;

  if v_id is null then
    insert into public.presupuestos_quincenales (grupo_id, quincena_inicio, quincena_fin)
    values (p_grupo_id, v_inicio, v_fin)
    returning id into v_id;
  end if;

  return v_id;
end;
$$;
