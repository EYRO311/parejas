import { apiGet, apiPatch } from './api';
import type { PresupuestoConAportes, PresupuestoQuincenal } from '@/lib/types';

export function listarPresupuestos(token: string, grupoId: string) {
  return apiGet<PresupuestoQuincenal[]>(`/grupos/${grupoId}/presupuestos`, token);
}

/** Quincena de hoy (convención MX 1-15 / 16-fin de mes): se crea sola si no existía. */
export function obtenerPresupuestoActual(token: string, grupoId: string) {
  return apiGet<PresupuestoConAportes>(`/grupos/${grupoId}/presupuestos/actual`, token);
}

export function obtenerPresupuesto(token: string, presupuestoId: string) {
  return apiGet<PresupuestoConAportes>(`/presupuestos/${presupuestoId}`, token);
}

export function cerrarPresupuesto(token: string, presupuestoId: string) {
  return apiPatch<PresupuestoQuincenal>(`/presupuestos/${presupuestoId}/cerrar`, token);
}
