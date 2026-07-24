import { Router } from 'express';
import * as RepartoController from '../controllers/reparto.controller';

// Montado en /salidas/:salidaId/reparto (mergeParams: true)
const router = Router({ mergeParams: true });

router.get('/', RepartoController.listar);
router.put('/', RepartoController.definir);
router.patch('/:usuarioId', RepartoController.marcarLiquidado);

export default router;
