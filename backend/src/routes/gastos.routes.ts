import { Router } from 'express';
import * as GastosController from '../controllers/gastos.controller';

// Punto de extensión sobre las rutas ya existentes de /gastos en la app
// base Finanzas: no reimplementa el CRUD de gastos (fuera de alcance de
// este proyecto), solo agrega la acción de compartir con un grupo.
const router = Router();

router.patch('/:gastoId/compartir', GastosController.compartir);

export default router;
