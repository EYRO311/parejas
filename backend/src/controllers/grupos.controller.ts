import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { HttpError } from '../utils/httpError';
import * as GruposModel from '../models/grupos.model';
import type { GrupoTipo } from '../types';

const TIPOS_VALIDOS: GrupoTipo[] = ['pareja', 'familia', 'roommates'];

export const listar = asyncHandler(async (req: Request, res: Response) => {
  const grupos = await GruposModel.listarGruposDeUsuario(req.supabase);
  res.json(grupos);
});

export const obtener = asyncHandler(async (req: Request, res: Response) => {
  const grupo = await GruposModel.obtenerGrupo(req.supabase, req.params.grupoId);
  res.json(grupo);
});

export const crear = asyncHandler(async (req: Request, res: Response) => {
  const { nombre, tipo } = req.body ?? {};
  if (typeof nombre !== 'string' || nombre.trim() === '') {
    throw new HttpError(422, 'nombre es requerido');
  }
  const tipoFinal: GrupoTipo = TIPOS_VALIDOS.includes(tipo) ? tipo : 'pareja';

  const grupoId = await GruposModel.crearGrupo(req.supabase, nombre.trim(), tipoFinal);
  const grupo = await GruposModel.obtenerGrupo(req.supabase, grupoId);
  res.status(201).json(grupo);
});

export const actualizar = asyncHandler(async (req: Request, res: Response) => {
  const { nombre, tipo } = req.body ?? {};
  if (tipo !== undefined && !TIPOS_VALIDOS.includes(tipo)) {
    throw new HttpError(422, 'tipo inválido');
  }
  const grupo = await GruposModel.actualizarGrupo(req.supabase, req.params.grupoId, { nombre, tipo });
  res.json(grupo);
});

export const eliminar = asyncHandler(async (req: Request, res: Response) => {
  await GruposModel.eliminarGrupo(req.supabase, req.params.grupoId);
  res.status(204).send();
});
