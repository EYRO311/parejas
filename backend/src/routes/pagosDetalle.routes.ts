import { Router } from 'express';
import * as PagosController from '../controllers/pagos.controller';

// Montado en /pagos/:pagoId — la pertenencia se resuelve dentro del
// controller (el pago pertenece a la salida, la salida al grupo).
const router = Router();

router.patch('/:pagoId', PagosController.actualizar);
router.delete('/:pagoId', PagosController.eliminar);

export default router;
