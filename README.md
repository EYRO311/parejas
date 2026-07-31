# Finanzas en Pareja

Módulo de finanzas compartidas (pareja / familia / roommates) sobre Supabase,
con backend en capas ruta → controller → model y frontend en Next.js (App
Router). Sin deploy activo todavía.

## ⚠️ Supuesto importante sobre la app base "Finanzas"

No se encontró en disco un proyecto "Finanzas" ya existente. Las tablas
`usuarios`, `categorias` y `gastos` en
[`supabase/migrations/0002_tablas_base_asumidas.sql`](supabase/migrations/0002_tablas_base_asumidas.sql)
se crearon como **supuesto razonable** de lo que esa app base tendría, solo
para que este proyecto tenga algo real sobre lo cual extender
(`grupo_id`, categorías de grupo, etc).

Si el proyecto "Finanzas" real ya existe en otro lugar:
1. Reemplaza `0002_tablas_base_asumidas.sql` por un no-op (o bórralo).
2. Revisa que los nombres/tipos de columna en `0003_finanzas_pareja_tablas.sql`
   (los `alter table categorias/gastos add column grupo_id ...`) calcen con
   el schema real.
3. Ajusta `backend/src/types/index.ts` si los tipos de `usuarios`/`categorias`/`gastos` difieren.

## Estructura

```
supabase/
  migrations/
    0001_extensiones_y_tipos.sql            -- pgcrypto + enums
    0002_tablas_base_asumidas.sql           -- usuarios, categorias, gastos (ver supuesto arriba)
    0003_finanzas_pareja_tablas.sql         -- grupos, salidas, presupuestos, etc.
    0004_funciones_y_triggers.sql           -- helpers RLS, campos derivados, invitaciones
    0005_rls_policies.sql                   -- políticas RLS
    0006_usuarios_trigger_alta.sql          -- alta automática en public.usuarios al registrarse
    0007_quincena_automatica.sql            -- quincenas MX (1-15 / 16-fin) auto-creadas
    0008_fix_proteccion_campos_derivados.sql -- corrige candado de costo_total/monto_objetivo_total
backend/
  api/index.ts          -- entrypoint serverless para Vercel
  src/
    app.ts / server.ts
    config/              -- env, clientes de Supabase (usuario vs. service role)
    middlewares/          -- auth, pertenencia a grupo, manejo de errores
    routes/                -- una por recurso, capas anidadas con mergeParams
    controllers/            -- validación de input + orquestación
    models/                  -- acceso a datos (supabase-js)
    types/                    -- tipos de fila + augmentación de Express.Request
frontend/
  app/                  -- App Router: /login, /grupos, /grupos/[grupoId]/{salidas,presupuesto,categorias,miembros}
  components/
    atoms/ molecules/ organisms/   -- atomic design
    layout/               -- AppShell + navPresets
  services/               -- un *.service.ts por recurso, llama al backend con el JWT de Supabase
  lib/
    supabase/             -- clientes @supabase/ssr (client, server, middleware)
    useSession.ts          -- hook de sesión en cliente
    types.ts                -- tipos espejo de las tablas
```

## Modelo de datos

Ver diagrama de relaciones implícito en las migraciones. Resumen de reglas
de negocio implementadas a nivel de base de datos (no solo backend):

- **`salidas.costo_total`** y **`presupuestos_quincenales.monto_objetivo_total`**
  son campos derivados: se recalculan por trigger cada vez que cambian sus
  tablas hijas (`pagos_salida`, `aportes_presupuesto`) y están protegidos
  contra escritura directa de un cliente normal (solo `service_role`).
- **`aportes_presupuesto.monto_aportado`** (el "gastado real") depende de un
  rango de fechas dinámico cruzando `pagos_salida` + `gastos`, así que no se
  puede mantener con un trigger simple. Se recalcula con la función SQL
  `recalcular_gastado_real(usuario_id, grupo_id, fecha)`, invocada por el
  backend (con la *service role key*) después de crear/editar/borrar un pago
  de salida o un gasto compartido. También está protegido contra escritura
  directa del cliente.
- **Unirse a un grupo por código** pasa por la función `unirse_a_grupo(codigo)`
  (SECURITY DEFINER), que valida que el código esté `activo` y no expirado
  antes de insertar la membresía y marcar el código como `usado`.
- **Categorías**: `categorias_dueno_exclusivo` garantiza que una categoría
  sea personal (`usuario_id`), de grupo (`grupo_id`) o del sistema (ambos
  `null`), nunca combinaciones inválidas.
- **RLS**: cada tabla tiene políticas basadas en `es_miembro_grupo()` /
  `es_admin_grupo()` (funciones SECURITY DEFINER para evitar recursión de
  RLS). El backend además valida pertenencia explícitamente en el
  controller (`verificarPertenenciaGrupo`) antes de escribir, como pide el
  enunciado — RLS es la autoridad final, el controller da mensajes de error
  claros.
- **Quincenas automáticas** (`0007`): `obtener_o_crear_presupuesto_actual(grupo_id)`
  calcula la quincena estándar mexicana (1-15 y 16-fin de mes) de la fecha
  actual y crea el presupuesto la primera vez que alguien del grupo la
  consulta. Nadie captura fechas a mano.
- **Alta automática de usuario** (`0006`): trigger `on_auth_user_created_finanzas`
  → `handle_new_user_finanzas()` puebla `public.usuarios` al registrarse en
  Supabase Auth. Nombrado distinto de `handle_new_user()` a propósito porque
  este proyecto de Supabase es compartido con otra app (`asistente`), que ya
  tiene su propio trigger poblando `public.profiles`; ambos conviven sin
  pisarse.

## Endurecimiento aplicado antes del primer deploy a Supabase

Revisión de lógica sobre las migraciones (todavía no aplicadas a un
proyecto real) que encontró y corrigió 5 problemas, todos ya reflejados en
`0003`, `0004`, `0005` y `0008` — no hay una migración `0009` separada
porque nada se había subido aún:

- **`recalcular_gastado_real()` sin autorización interna** — al ser
  `SECURITY DEFINER` quedaba expuesta por defecto como RPC de PostgREST a
  cualquier usuario autenticado, que podía pasar el `usuario_id`/`grupo_id`
  de otra persona. Ahora exige `auth.role() = 'service_role'` (como la
  llama el backend) o, si se llama con JWT de usuario, que
  `auth.uid() = p_usuario_id` y que sea miembro de `p_grupo_id`.
- **`generar_codigo_invitacion()` podía devolver un código ya usado** —
  no era `SECURITY DEFINER` (su `select` corría bajo el RLS del llamador,
  sin ver invitaciones de otros grupos) y solo revisaba códigos
  `estado = 'activo'`, aunque `codigo` es `unique` a nivel de toda la
  tabla. Ahora es `SECURITY DEFINER` y el chequeo de colisión ignora el
  estado.
- **`pagos_salida_update` / `aportes_update` no revalidaban el padre** —
  solo exigían ser el dueño del registro; ahora, si se reasigna
  `salida_id`/`presupuesto_id`, el `with check` exige que el nuevo destino
  también pertenezca a un grupo del que el usuario es miembro (mismo
  criterio que ya aplicaban las policies de `insert`).
- **Los triggers de recálculo no cubrían la reasignación de FK** —
  `fn_recalcular_costo_salida`/`fn_recalcular_objetivo_presupuesto` solo
  reaccionaban a cambios de monto; ahora también reaccionan a
  `update of salida_id` / `presupuesto_id` y recalculan tanto el registro
  viejo como el nuevo.
- **FKs hacia `usuarios` sin `on delete`** — `grupos.creado_por`,
  `salidas.creado_por`, `pagos_salida.usuario_id`,
  `reparto_salida.usuario_id`, `aportes_presupuesto.usuario_id` e
  `invitaciones_grupo.creado_por` no tenían acción de borrado (default
  `NO ACTION`), así que borrar un `auth.users` con actividad rompía el
  cascade desde `usuarios`. Ahora son nullable con `on delete set null`:
  se preserva el historial financiero, solo se pierde la identidad del
  creador/pagador. (Pendiente aparte: los tipos TS en
  `backend/src/types/index.ts` / `frontend/lib/types.ts` siguen marcando
  esos campos como no-nulos; ajustar si algún día se implementa borrar
  cuenta.)

## Frontend

Next.js 15 (App Router) + React 19 + Tailwind 4, organizado con atomic
design (`components/atoms|molecules|organisms`) y una capa `services/*.ts`
por recurso que llama al backend con el JWT de la sesión de Supabase
(`lib/useSession.ts`). El middleware de Next (`lib/supabase/middleware.ts`)
protege las rutas privadas y redirige a `/login` si no hay sesión.

Rutas: `/login`, `/grupos`, `/grupos/[grupoId]`, y anidadas por grupo:
`salidas` (+ `nueva`, `[salidaId]`), `presupuesto` (+ `[presupuestoId]`),
`categorias`, `miembros`.

## Multi-moneda (preparado, no implementado)

Las tablas con montos (`gastos`, `salidas`, en el futuro `pagos_salida` /
`aportes_presupuesto` si aplica) tienen una columna `moneda char(3)` con
default `'MXN'`. No hay tabla de tasas de cambio ni lógica de conversión;
todo se asume en una sola moneda operativa por ahora, igual que en la app
base.

## Endpoints

Todas las rutas van bajo `/api` y requieren `Authorization: Bearer <jwt de Supabase>`.

```
GET    /api/grupos
POST   /api/grupos                              { nombre, tipo }
GET    /api/grupos/:grupoId
PATCH  /api/grupos/:grupoId                      (admin)
DELETE /api/grupos/:grupoId                      (admin)

GET    /api/grupos/:grupoId/miembros
PATCH  /api/grupos/:grupoId/miembros/:usuarioId  (admin, o uno mismo)
DELETE /api/grupos/:grupoId/miembros/:usuarioId  (admin, o uno mismo)

GET    /api/grupos/:grupoId/invitaciones
POST   /api/grupos/:grupoId/invitaciones         genera código (cualquier miembro)
PATCH  /api/grupos/:grupoId/invitaciones/:id      expira manualmente
POST   /api/invitaciones/unirse                  { codigo } -- no requiere grupoId

GET    /api/grupos/:grupoId/categorias
POST   /api/grupos/:grupoId/categorias           { nombre, icono?, color? }
PATCH  /api/grupos/:grupoId/categorias/:id
DELETE /api/grupos/:grupoId/categorias/:id

PATCH  /api/gastos/:gastoId/compartir            { grupo_id: string|null } -- extensión sobre gasto base

GET    /api/grupos/:grupoId/salidas              ?desde&hasta&categoriaId
POST   /api/grupos/:grupoId/salidas              { titulo, descripcion?, fecha, categoria_id?, moneda? }
GET    /api/salidas/:salidaId
PATCH  /api/salidas/:salidaId                    (creador o admin)
DELETE /api/salidas/:salidaId                    (creador o admin)

GET    /api/salidas/:salidaId/pagos
POST   /api/salidas/:salidaId/pagos              { monto, banco?, captura_url? }
PATCH  /api/pagos/:pagoId                        (dueño del pago)
DELETE /api/pagos/:pagoId                        (dueño del pago)

GET    /api/salidas/:salidaId/reparto
PUT    /api/salidas/:salidaId/reparto            { reparto: [{ usuario_id, monto_le_corresponde }] }
PATCH  /api/salidas/:salidaId/reparto/:usuarioId  { liquidado }

GET    /api/grupos/:grupoId/presupuestos
POST   /api/grupos/:grupoId/presupuestos          { quincena_inicio, quincena_fin }
GET    /api/presupuestos/:presupuestoId           incluye aportes_presupuesto
PATCH  /api/presupuestos/:presupuestoId/cerrar    (admin)

GET    /api/presupuestos/:presupuestoId/aportes
POST   /api/presupuestos/:presupuestoId/aportes   { monto_comprometido } -- siempre el propio
```

## Correr localmente

```bash
cd backend
cp .env.example .env   # llenar SUPABASE_URL / ANON_KEY / SERVICE_ROLE_KEY
npm install
npm run dev             # http://localhost:4000

cd ../frontend
cp .env.local.example .env.local   # llenar NEXT_PUBLIC_SUPABASE_URL / ANON_KEY
npm install
npm run dev             # http://localhost:3000
```

Aplicar las migraciones en Supabase (SQL editor o `supabase db push`) en
orden: `0001` → `0008`.

> ⚠️ Verificar qué proyecto de Supabase usar antes de configurar las claves:
> el comentario en `0006_usuarios_trigger_alta.sql` dice que este proyecto
> es **compartido** con la app "asistente", pero `frontend/.env.local.example`
> dice que es un proyecto **dedicado** ("no el compartido con
> asistente/quiniela"). Contradicción sin resolver — confirmar antes de
> apuntar frontend y backend a proyectos distintos por error.

## Pendiente para la siguiente etapa

- Deploy real a Vercel (backend y frontend están preparados — `api/index.ts`,
  `vercel.json` — pero sin evidencia de deploy activo).
- Conciliar `0002_tablas_base_asumidas.sql` con el schema real de Finanzas
  si difiere del supuesto.
- Resolver la contradicción de qué proyecto de Supabase usar (ver aviso
  arriba).
- Verificar si los dos layouts responsivos (`>500px` y `<500px`) quedaron
  cubiertos por `AppShell` o siguen pendientes.
- Multi-moneda: decidir dónde vive la conversión si se activa (los campos
  derivados actuales suman montos crudos sin normalizar moneda).
