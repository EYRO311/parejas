import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { HttpError } from '../utils/httpError';
import { verificarPertenenciaGrupo } from '../utils/verificarPertenencia';
import * as GastosModel from '../models/gastos.model';
import * as AportesModel from '../models/aportes.model';

/** PATCH /api/gastos/:gastoId/compartir — body: { grupo_id: string | null } */
export const compartir = asyncHandler(async (req: Request, res: Response) => {
  const gasto = await GastosModel.obtenerGasto(req.supabase, req.params.gastoId);
  if (gasto.usuario_id !== req.usuario.id) {
    throw new HttpError(403, 'Solo el dueño del gasto puede compartirlo');
  }

  const { grupo_id: grupoId } = req.body ?? {};
  if (grupoId !== null && typeof grupoId !== 'string') {
    throw new HttpError(422, 'grupo_id debe ser un uuid o null para dejar de compartir');
  }
  if (grupoId) {
    await verificarPertenenciaGrupo(req.supabase, req.usuario.id, grupoId);
  }

  const actualizado = await GastosModel.compartirGastoConGrupo(req.supabase, req.params.gastoId, grupoId);

  // Se comparte o se deja de compartir: en ambos casos cambia el gasto
  // real de la quincena para este usuario/grupo.
  if (grupoId) {
    await AportesModel.recalcularGastadoReal(req.usuario.id, grupoId, actualizado.fecha);
  } else if (gasto.grupo_id) {
    await AportesModel.recalcularGastadoReal(req.usuario.id, gasto.grupo_id, gasto.fecha);
  }

  res.json(actualizado);
});
