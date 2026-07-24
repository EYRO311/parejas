import { Router } from 'express';
import * as AportesController from '../controllers/aportes.controller';

// Montado en /presupuestos/:presupuestoId/aportes (mergeParams: true)
const router = Router({ mergeParams: true });

router.get('/', AportesController.listar);
router.post('/', AportesController.definirPropio);

export default router;
