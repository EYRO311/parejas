import { Router } from 'express';
import * as PresupuestosController from '../controllers/presupuestos.controller';
import aportesRouter from './aportes.routes';

// Montado en /grupos/:grupoId/presupuestos (mergeParams: true)
export const presupuestosDeGrupoRouter = Router({ mergeParams: true });
presupuestosDeGrupoRouter.get('/', PresupuestosController.listarDeGrupo);
presupuestosDeGrupoRouter.get('/actual', PresupuestosController.obtenerActual);

// Montado en /presupuestos (top-level, por presupuestoId)
export const presupuestosRouter = Router();
presupuestosRouter.get('/:presupuestoId', PresupuestosController.obtener);
presupuestosRouter.patch('/:presupuestoId/cerrar', PresupuestosController.cerrar);
presupuestosRouter.use('/:presupuestoId/aportes', aportesRouter);
