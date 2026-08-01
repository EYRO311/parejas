import { apiGet } from './api';
import type { GastoPorUsuario } from '@/lib/types';

export function obtenerGastosPorUsuario(token: string, grupoId: string) {
  return apiGet<GastoPorUsuario[]>(`/grupos/${grupoId}/dashboard/gastos`, token);
}
