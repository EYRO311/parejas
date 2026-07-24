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
