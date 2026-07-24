import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { HttpError } from '../utils/httpError';
import * as InvitacionesModel from '../models/invitaciones.model';
import * as GruposModel from '../models/grupos.model';

export const listar = asyncHandler(async (req: Request, res: Response) => {
  const invitaciones = await InvitacionesModel.listarInvitaciones(req.supabase, req.params.grupoId);
  res.json(invitaciones);
});

export const generar = asyncHandler(async (req: Request, res: Response) => {
  const invitacion = await InvitacionesModel.generarInvitacion(
    req.supabase,
    req.params.grupoId,
    req.usuario.id
  );
  res.status(201).json(invitacion);
});

export const expirar = asyncHandler(async (req: Request, res: Response) => {
  const invitacion = await InvitacionesModel.expirarInvitacion(req.supabase, req.params.invitacionId);
  res.json(invitacion);
});

/** POST /api/invitaciones/unirse — no depende de :grupoId, el código lo resuelve. */
export const unirse = asyncHandler(async (req: Request, res: Response) => {
  const { codigo } = req.body ?? {};
  if (typeof codigo !== 'string' || !/^[A-Za-z0-9]{6}$/.test(codigo)) {
    throw new HttpError(422, 'código inválido, debe tener 6 caracteres alfanuméricos');
  }

  const grupoId = await InvitacionesModel.unirseAGrupo(req.supabase, codigo);
  const grupo = await GruposModel.obtenerGrupo(req.supabase, grupoId);
  res.status(200).json(grupo);
});
