import { apiGet, apiPost } from './api';
import type { AportePresupuesto } from '@/lib/types';

export function listarAportes(token: string, presupuestoId: string) {
  return apiGet<AportePresupuesto[]>(`/presupuestos/${presupuestoId}/aportes`, token);
}

export function definirAportePropio(token: string, presupuestoId: string, montoComprometido: number) {
  return apiPost<AportePresupuesto>(`/presupuestos/${presupuestoId}/aportes`, token, {
    monto_comprometido: montoComprometido,
  });
}
