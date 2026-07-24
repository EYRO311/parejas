import { apiDelete, apiGet, apiPatch, apiPost } from './api';
import type { Salida } from '@/lib/types';

export interface FiltrosSalidas {
  desde?: string;
  hasta?: string;
  categoriaId?: string;
}

export function listarSalidas(token: string, grupoId: string, filtros: FiltrosSalidas = {}) {
  const params = new URLSearchParams();
  if (filtros.desde) params.set('desde', filtros.desde);
  if (filtros.hasta) params.set('hasta', filtros.hasta);
  if (filtros.categoriaId) params.set('categoriaId', filtros.categoriaId);
  const query = params.toString();
  return apiGet<Salida[]>(`/grupos/${grupoId}/salidas${query ? `?${query}` : ''}`, token);
}

export function crearSalida(
  token: string,
  grupoId: string,
  datos: { titulo: string; descripcion?: string; fecha: string; categoria_id?: string | null; moneda?: string }
) {
  return apiPost<Salida>(`/grupos/${grupoId}/salidas`, token, datos);
}

export function obtenerSalida(token: string, salidaId: string) {
  return apiGet<Salida>(`/salidas/${salidaId}`, token);
}

export function actualizarSalida(
  token: string,
  salidaId: string,
  cambios: Partial<Pick<Salida, 'titulo' | 'descripcion' | 'fecha' | 'categoria_id'>>
) {
  return apiPatch<Salida>(`/salidas/${salidaId}`, token, cambios);
}

export function eliminarSalida(token: string, salidaId: string) {
  return apiDelete<void>(`/salidas/${salidaId}`, token);
}
