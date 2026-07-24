import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import * as InvitacionesController from '../controllers/invitaciones.controller';
import gruposRouter from './grupos.routes';
import { salidasRouter } from './salidas.routes';
import pagosDetalleRouter from './pagosDetalle.routes';
import { presupuestosRouter } from './presupuestos.routes';
import gastosRouter from './gastos.routes';

const router = Router();

router.use(authMiddleware);

router.post('/invitaciones/unirse', InvitacionesController.unirse);

router.use('/grupos', gruposRouter);
router.use('/salidas', salidasRouter);
router.use('/pagos', pagosDetalleRouter);
router.use('/presupuestos', presupuestosRouter);
router.use('/gastos', gastosRouter);

export default router;
