import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { HttpError } from '../utils/httpError';
import * as MiembrosModel from '../models/miembros.model';

export const listar = asyncHandler(async (req: Request, res: Response) => {
  const miembros = await MiembrosModel.listarMiembros(req.supabase, req.params.grupoId);
  res.json(miembros);
});

export const actualizar = asyncHandler(async (req: Request, res: Response) => {
  const { usuarioId } = req.params;
  const esUnoMismo = usuarioId === req.usuario.id;
  const esAdmin = req.rolEnGrupo === 'admin';

  if (!esUnoMismo && !esAdmin) {
    throw new HttpError(403, 'Solo un admin puede modificar a otros miembros');
  }

  const { rol, activo } = req.body ?? {};
  if (rol !== undefined && !esAdmin) {
    throw new HttpError(403, 'Solo un admin puede cambiar roles');
  }

  const miembro = await MiembrosModel.actualizarMiembro(req.supabase, req.params.grupoId, usuarioId, {
    rol,
    activo,
  });
  res.json(miembro);
});

export const eliminar = asyncHandler(async (req: Request, res: Response) => {
  const { usuarioId } = req.params;
  const esUnoMismo = usuarioId === req.usuario.id;
  const esAdmin = req.rolEnGrupo === 'admin';

  if (!esUnoMismo && !esAdmin) {
    throw new HttpError(403, 'Solo un admin puede remover a otros miembros');
  }

  await MiembrosModel.eliminarMiembro(req.supabase, req.params.grupoId, usuarioId);
  res.status(204).send();
});
