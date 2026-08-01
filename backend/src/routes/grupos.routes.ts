import { Router } from 'express';
import * as GruposController from '../controllers/grupos.controller';
import * as DashboardController from '../controllers/dashboard.controller';
import { requireAdminGrupo, requireMiembroGrupo } from '../middlewares/grupoMembership.middleware';
import miembrosRouter from './miembros.routes';
import invitacionesRouter from './invitaciones.routes';
import categoriasRouter from './categorias.routes';
import { salidasDeGrupoRouter } from './salidas.routes';
import { presupuestosDeGrupoRouter } from './presupuestos.routes';

const router = Router();

router.get('/', GruposController.listar);
router.post('/', GruposController.crear);

router.get('/:grupoId', requireMiembroGrupo(), GruposController.obtener);
router.patch('/:grupoId', requireMiembroGrupo(), requireAdminGrupo, GruposController.actualizar);
router.delete('/:grupoId', requireMiembroGrupo(), requireAdminGrupo, GruposController.eliminar);

router.use('/:grupoId/miembros', requireMiembroGrupo(), miembrosRouter);
router.use('/:grupoId/invitaciones', requireMiembroGrupo(), invitacionesRouter);
router.use('/:grupoId/categorias', requireMiembroGrupo(), categoriasRouter);
router.use('/:grupoId/salidas', requireMiembroGrupo(), salidasDeGrupoRouter);
router.use('/:grupoId/presupuestos', requireMiembroGrupo(), presupuestosDeGrupoRouter);
router.get('/:grupoId/dashboard/gastos', requireMiembroGrupo(), DashboardController.gastosPorUsuario);

export default router;
