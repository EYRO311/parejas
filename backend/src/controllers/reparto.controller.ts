import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { HttpError } from '../utils/httpError';
import { verificarPertenenciaGrupo } from '../utils/verificarPertenencia';
import * as SalidasModel from '../models/salidas.model';
import * as RepartoModel from '../models/reparto.model';

export const listar = asyncHandler(async (req: Request, res: Response) => {
  const salida = await SalidasModel.obtenerSalida(req.supabase, req.params.salidaId);
  await verificarPertenenciaGrupo(req.supabase, req.usuario.id, salida.grupo_id);

  const reparto = await RepartoModel.listarReparto(req.supabase, req.params.salidaId);
  res.json(reparto);
});

export const definir = asyncHandler(async (req: Request, res: Response) => {
  const salida = await SalidasModel.obtenerSalida(req.supabase, req.params.salidaId);
  await verificarPertenenciaGrupo(req.supabase, req.usuario.id, salida.grupo_id);

  const { reparto } = req.body ?? {};
  if (!Array.isArray(reparto) || reparto.length === 0) {
    throw new HttpError(422, 'reparto debe ser un arreglo no vacío de { usuario_id, monto_le_corresponde }');
  }

  for (const fila of reparto) {
    if (typeof fila.usuario_id !== 'string' || !Number.isFinite(Number(fila.monto_le_corresponde))) {
      throw new HttpError(422, 'cada fila requiere usuario_id y monto_le_corresponde numérico');
    }
    if (Number(fila.monto_le_corresponde) < 0) {
      throw new HttpError(422, 'monto_le_corresponde no puede ser negativo');
    }
  }

  const actualizado = await RepartoModel.definirReparto(
    req.supabase,
    req.params.salidaId,
    reparto.map((f: any) => ({
      usuario_id: f.usuario_id,
      monto_le_corresponde: Number(f.monto_le_corresponde),
    }))
  );
  res.json(actualizado);
});

export const marcarLiquidado = asyncHandler(async (req: Request, res: Response) => {
  const salida = await SalidasModel.obtenerSalida(req.supabase, req.params.salidaId);
  await verificarPertenenciaGrupo(req.supabase, req.usuario.id, salida.grupo_id);

  const { liquidado } = req.body ?? {};
  if (typeof liquidado !== 'boolean') {
    throw new HttpError(422, 'liquidado debe ser boolean');
  }

  const fila = await RepartoModel.marcarLiquidado(
    req.supabase,
    req.params.salidaId,
    req.params.usuarioId,
    liquidado
  );
  res.json(fila);
});
