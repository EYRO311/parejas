import type { NextFunction, Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { verificarPertenenciaGrupo } from '../utils/verificarPertenencia';

/** Para rutas con :grupoId directo en la URL (/grupos/:grupoId/...). */
export function requireMiembroGrupo(paramName = 'grupoId') {
  return asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    const grupoId = req.params[paramName];
    req.rolEnGrupo = await verificarPertenenciaGrupo(req.supabase, req.usuario.id, grupoId);
    next();
  });
}

/** Debe montarse después de requireMiembroGrupo. */
export function requireAdminGrupo(req: Request, res: Response, next: NextFunction) {
  if (req.rolEnGrupo !== 'admin') {
    return res.status(403).json({ error: 'Se requiere rol admin en el grupo' });
  }
  next();
}
