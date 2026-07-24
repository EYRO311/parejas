import { Router } from 'express';
import * as CategoriasController from '../controllers/categorias.controller';

// Montado en /grupos/:grupoId/categorias (mergeParams: true)
const router = Router({ mergeParams: true });

router.get('/', CategoriasController.listar);
router.post('/', CategoriasController.crear);
router.patch('/:categoriaId', CategoriasController.actualizar);
router.delete('/:categoriaId', CategoriasController.eliminar);

export default router;
