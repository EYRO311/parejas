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
