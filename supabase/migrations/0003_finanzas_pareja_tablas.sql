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
