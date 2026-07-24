import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { HttpError } from '../utils/httpError';
import { verificarPertenenciaGrupo } from '../utils/verificarPertenencia';
import * as SalidasModel from '../models/salidas.model';
import * as PagosModel from '../models/pagos.model';
import * as AportesModel from '../models/aportes.model';

export const listar = asyncHandler(async (req: Request, res: Response) => {
  const salida = await SalidasModel.obtenerSalida(req.supabase, req.params.salidaId);
  await verificarPertenenciaGrupo(req.supabase, req.usuario.id, salida.grupo_id);

  const pagos = await PagosModel.listarPagos(req.supabase, req.params.salidaId);
  res.json(pagos);
});

export const registrar = asyncHandler(async (req: Request, res: Response) => {
  const salida = await SalidasModel.obtenerSalida(req.supabase, req.params.salidaId);
  await verificarPertenenciaGrupo(req.supabase, req.usuario.id, salida.grupo_id);

  const { monto, banco, captura_url } = req.body ?? {};
  const montoNum = Number(monto);
  if (!Number.isFinite(montoNum) || montoNum <= 0) {
    throw new HttpError(422, 'monto debe ser un número mayor a 0');
  }

  // Un usuario solo puede registrar el pago que él mismo aportó, nunca a
  // nombre de otro (usuario_id siempre viene del token, no del body).
  const pago = await PagosModel.registrarPago(req.supabase, req.params.salidaId, req.usuario.id, {
    monto: montoNum,
    banco: banco ?? null,
    captura_url: captura_url ?? null,
  });

  await AportesModel.recalcularGastadoReal(req.usuario.id, salida.grupo_id, salida.fecha);
  res.status(201).json(pago);
});

export const actualizar = asyncHandler(async (req: Request, res: Response) => {
  const pago = await PagosModel.obtenerPago(req.supabase, req.params.pagoId);
  if (pago.usuario_id !== req.usuario.id) {
    throw new HttpError(403, 'Solo puedes editar tus propios pagos');
  }

  const { monto, banco, captura_url } = req.body ?? {};
  if (monto !== undefined && (!Number.isFinite(Number(monto)) || Number(monto) <= 0)) {
    throw new HttpError(422, 'monto debe ser un número mayor a 0');
  }

  const actualizado = await PagosModel.actualizarPago(req.supabase, req.params.pagoId, {
    monto: monto !== undefined ? Number(monto) : undefined,
    banco,
    captura_url,
  });

  const salida = await SalidasModel.obtenerSalida(req.supabase, actualizado.salida_id);
  await AportesModel.recalcularGastadoReal(req.usuario.id, salida.grupo_id, salida.fecha);
  res.json(actualizado);
});

export const eliminar = asyncHandler(async (req: Request, res: Response) => {
  const pago = await PagosModel.obtenerPago(req.supabase, req.params.pagoId);
  if (pago.usuario_id !== req.usuario.id) {
    throw new HttpError(403, 'Solo puedes borrar tus propios pagos');
  }

  const salida = await SalidasModel.obtenerSalida(req.supabase, pago.salida_id);
  await PagosModel.eliminarPago(req.supabase, req.params.pagoId);
  await AportesModel.recalcularGastadoReal(req.usuario.id, salida.grupo_id, salida.fecha);
  res.status(204).send();
});
