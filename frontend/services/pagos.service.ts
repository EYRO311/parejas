import { apiDelete, apiGet, apiPatch, apiPost } from './api';
import type { PagoSalida } from '@/lib/types';

export function listarPagos(token: string, salidaId: string) {
  return apiGet<PagoSalida[]>(`/salidas/${salidaId}/pagos`, token);
}

export function registrarPago(
  token: string,
  salidaId: string,
  datos: { monto: number; banco?: string; captura_url?: string }
) {
  return apiPost<PagoSalida>(`/salidas/${salidaId}/pagos`, token, datos);
}

export function actualizarPago(
  token: string,
  pagoId: string,
  cambios: Partial<{ monto: number; banco: string; captura_url: string }>
) {
  return apiPatch<PagoSalida>(`/pagos/${pagoId}`, token, cambios);
}

export function eliminarPago(token: string, pagoId: string) {
  return apiDelete<void>(`/pagos/${pagoId}`, token);
}
