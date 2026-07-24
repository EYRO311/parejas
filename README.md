# Finanzas en Pareja

Módulo de finanzas compartidas (pareja / familia / roommates) sobre Supabase,
con backend en capas ruta → controller → model. **Esta etapa solo cubre
schema de base de datos y backend**; el frontend no está implementado
todavía a propósito.

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
    0001_extensiones_y_tipos.sql       -- pgcrypto + enums
    0002_tablas_base_asumidas.sql      -- usuarios, categorias, gastos (ver supuesto arriba)
    0003_finanzas_pareja_tablas.sql    -- grupos, salidas, presupuestos, etc.
    0004_funciones_y_triggers.sql      -- helpers RLS, campos derivados, invitaciones
    0005_rls_policies.sql              -- políticas RLS
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
```

Aplicar las migraciones en Supabase (SQL editor o `supabase db push`) en
orden: `0001` → `0005`.

## Pendiente para la siguiente etapa

- Frontend (dos layouts responsivos: >500px y <500px), a propósito no
  incluido en esta entrega.
- Conciliar `0002_tablas_base_asumidas.sql` con el schema real de Finanzas
  si difiere del supuesto.
- Trigger en `auth.users` para poblar `public.usuarios` al registrarse
  (no incluido: depende de cómo la app base maneje el signup).
