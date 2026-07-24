import { apiGet, apiPatch, apiPut } from './api';
import type { RepartoSalida } from '@/lib/types';

export function listarReparto(token: string, salidaId: string) {
  return apiGet<RepartoSalida[]>(`/salidas/${salidaId}/reparto`, token);
}

export function definirReparto(
  token: string,
  salidaId: string,
  reparto: Array<{ usuario_id: string; monto_le_corresponde: number }>
) {
  return apiPut<RepartoSalida[]>(`/salidas/${salidaId}/reparto`, token, { reparto });
}

export function marcarLiquidado(token: string, salidaId: string, usuarioId: string, liquidado: boolean) {
  return apiPatch<RepartoSalida>(`/salidas/${salidaId}/reparto/${usuarioId}`, token, { liquidado });
}
