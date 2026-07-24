import { Router } from 'express';
import * as SalidasController from '../controllers/salidas.controller';
import pagosRouter from './pagos.routes';
import repartoRouter from './reparto.routes';

// Montado en /grupos/:grupoId/salidas (mergeParams: true)
export const salidasDeGrupoRouter = Router({ mergeParams: true });
salidasDeGrupoRouter.get('/', SalidasController.listarDeGrupo);
salidasDeGrupoRouter.post('/', SalidasController.crearEnGrupo);

// Montado en /salidas (top-level, por salidaId)
export const salidasRouter = Router();
salidasRouter.get('/:salidaId', SalidasController.obtener);
salidasRouter.patch('/:salidaId', SalidasController.actualizar);
salidasRouter.delete('/:salidaId', SalidasController.eliminar);
salidasRouter.use('/:salidaId/pagos', pagosRouter);
salidasRouter.use('/:salidaId/reparto', repartoRouter);
