import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { HttpError } from '../utils/httpError';
import { verificarPertenenciaGrupo } from '../utils/verificarPertenencia';
import * as PresupuestosModel from '../models/presupuestos.model';
import * as AportesModel from '../models/aportes.model';

export const listar = asyncHandler(async (req: Request, res: Response) => {
  const presupuesto = await PresupuestosModel.obtenerPresupuesto(req.supabase, req.params.presupuestoId);
  await verificarPertenenciaGrupo(req.supabase, req.usuario.id, presupuesto.grupo_id);

  const aportes = await AportesModel.listarAportes(req.supabase, req.params.presupuestoId);
  res.json(aportes);
});

// Cada quien define/actualiza únicamente su propio límite quincenal.
export const definirPropio = asyncHandler(async (req: Request, res: Response) => {
  const presupuesto = await PresupuestosModel.obtenerPresupuesto(req.supabase, req.params.presupuestoId);
  await verificarPertenenciaGrupo(req.supabase, req.usuario.id, presupuesto.grupo_id);

  const { monto_comprometido } = req.body ?? {};
  const monto = Number(monto_comprometido);
  if (!Number.isFinite(monto) || monto < 0) {
    throw new HttpError(422, 'monto_comprometido debe ser un número >= 0');
  }

  const aporte = await AportesModel.definirAporte(
    req.supabase,
    req.params.presupuestoId,
    req.usuario.id,
    monto
  );
  res.status(201).json(aporte);
});
