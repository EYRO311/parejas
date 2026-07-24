import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { HttpError } from '../utils/httpError';
import { verificarPertenenciaGrupo } from '../utils/verificarPertenencia';
import * as SalidasModel from '../models/salidas.model';

// --- Montadas bajo /grupos/:grupoId/salidas (requireMiembroGrupo ya corrió) ---

export const listarDeGrupo = asyncHandler(async (req: Request, res: Response) => {
  const { desde, hasta, categoriaId } = req.query;
  const salidas = await SalidasModel.listarSalidas(req.supabase, req.params.grupoId, {
    desde: typeof desde === 'string' ? desde : undefined,
    hasta: typeof hasta === 'string' ? hasta : undefined,
    categoriaId: typeof categoriaId === 'string' ? categoriaId : undefined,
  });
  res.json(salidas);
});

export const crearEnGrupo = asyncHandler(async (req: Request, res: Response) => {
  const { titulo, descripcion, fecha, categoria_id, moneda } = req.body ?? {};
  if (typeof titulo !== 'string' || titulo.trim() === '') {
    throw new HttpError(422, 'titulo es requerido');
  }
  if (typeof fecha !== 'string') {
    throw new HttpError(422, 'fecha es requerida (YYYY-MM-DD)');
  }

  const salida = await SalidasModel.crearSalida(req.supabase, req.params.grupoId, req.usuario.id, {
    titulo: titulo.trim(),
    descripcion: descripcion ?? null,
    fecha,
    categoria_id: categoria_id ?? null,
    moneda: moneda ?? 'MXN',
  });
  res.status(201).json(salida);
});

// --- Montadas bajo /salidas/:salidaId (la pertenencia se valida resolviendo grupo_id) ---

export const obtener = asyncHandler(async (req: Request, res: Response) => {
  const salida = await SalidasModel.obtenerSalida(req.supabase, req.params.salidaId);
  await verificarPertenenciaGrupo(req.supabase, req.usuario.id, salida.grupo_id);
  res.json(salida);
});

export const actualizar = asyncHandler(async (req: Request, res: Response) => {
  const salida = await SalidasModel.obtenerSalida(req.supabase, req.params.salidaId);
  const rol = await verificarPertenenciaGrupo(req.supabase, req.usuario.id, salida.grupo_id);
  if (salida.creado_por !== req.usuario.id && rol !== 'admin') {
    throw new HttpError(403, 'Solo quien creó la salida o un admin puede editarla');
  }

  const { titulo, descripcion, fecha, categoria_id } = req.body ?? {};
  const actualizada = await SalidasModel.actualizarSalida(req.supabase, req.params.salidaId, {
    titulo,
    descripcion,
    fecha,
    categoria_id,
  });
  res.json(actualizada);
});

export const eliminar = asyncHandler(async (req: Request, res: Response) => {
  const salida = await SalidasModel.obtenerSalida(req.supabase, req.params.salidaId);
  const rol = await verificarPertenenciaGrupo(req.supabase, req.usuario.id, salida.grupo_id);
  if (salida.creado_por !== req.usuario.id && rol !== 'admin') {
    throw new HttpError(403, 'Solo quien creó la salida o un admin puede borrarla');
  }

  await SalidasModel.eliminarSalida(req.supabase, req.params.salidaId);
  res.status(204).send();
});
