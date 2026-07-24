import { apiDelete, apiGet, apiPatch } from './api';
import type { MiembroGrupo, MiembroRol } from '@/lib/types';

export function listarMiembros(token: string, grupoId: string) {
  return apiGet<MiembroGrupo[]>(`/grupos/${grupoId}/miembros`, token);
}

export function actualizarMiembro(
  token: string,
  grupoId: string,
  usuarioId: string,
  cambios: Partial<{ rol: MiembroRol; activo: boolean }>
) {
  return apiPatch<MiembroGrupo>(`/grupos/${grupoId}/miembros/${usuarioId}`, token, cambios);
}

export function eliminarMiembro(token: string, grupoId: string, usuarioId: string) {
  return apiDelete<void>(`/grupos/${grupoId}/miembros/${usuarioId}`, token);
}
