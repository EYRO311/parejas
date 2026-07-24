import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { HttpError } from '../utils/httpError';
import { verificarPertenenciaGrupo } from '../utils/verificarPertenencia';
import * as PresupuestosModel from '../models/presupuestos.model';

// --- Montadas bajo /grupos/:grupoId/presupuestos ---

export const listarDeGrupo = asyncHandler(async (req: Request, res: Response) => {
  const presupuestos = await PresupuestosModel.listarPresupuestos(req.supabase, req.params.grupoId);
  res.json(presupuestos);
});

/** GET /grupos/:grupoId/presupuestos/actual — se crea sola si no existe todavía. */
export const obtenerActual = asyncHandler(async (req: Request, res: Response) => {
  const presupuestoId = await PresupuestosModel.obtenerOCrearPresupuestoActual(req.supabase, req.params.grupoId);
  const presupuesto = await PresupuestosModel.obtenerPresupuesto(req.supabase, presupuestoId);
  res.json(presupuesto);
});

// --- Montadas bajo /presupuestos/:presupuestoId ---

export const obtener = asyncHandler(async (req: Request, res: Response) => {
  const presupuesto = await PresupuestosModel.obtenerPresupuesto(req.supabase, req.params.presupuestoId);
  res.json(presupuesto);
});

export const cerrar = asyncHandler(async (req: Request, res: Response) => {
  const presupuesto = await PresupuestosModel.obtenerPresupuesto(req.supabase, req.params.presupuestoId);
  const rol = await verificarPertenenciaGrupo(req.supabase, req.usuario.id, presupuesto.grupo_id);
  if (rol !== 'admin') {
    throw new HttpError(403, 'Solo un admin puede cerrar la quincena');
  }

  const actualizado = await PresupuestosModel.cerrarPresupuesto(req.supabase, req.params.presupuestoId);
  res.json(actualizado);
});
