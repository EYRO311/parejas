import { Router } from 'express';
import * as PagosController from '../controllers/pagos.controller';

// Montado en /salidas/:salidaId/pagos (mergeParams: true)
const router = Router({ mergeParams: true });

router.get('/', PagosController.listar);
router.post('/', PagosController.registrar);

export default router;
