import { Router } from 'express';
import * as MiembrosController from '../controllers/miembros.controller';

// Montado en /grupos/:grupoId/miembros (mergeParams: true)
const router = Router({ mergeParams: true });

router.get('/', MiembrosController.listar);
router.patch('/:usuarioId', MiembrosController.actualizar);
router.delete('/:usuarioId', MiembrosController.eliminar);

export default router;
