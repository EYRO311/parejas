import { Router } from 'express';
import * as InvitacionesController from '../controllers/invitaciones.controller';

// Montado en /grupos/:grupoId/invitaciones (mergeParams: true)
const router = Router({ mergeParams: true });

router.get('/', InvitacionesController.listar);
router.post('/', InvitacionesController.generar);
router.patch('/:invitacionId', InvitacionesController.expirar);

export default router;
