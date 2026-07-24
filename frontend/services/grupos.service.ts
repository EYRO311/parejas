import { apiDelete, apiGet, apiPatch, apiPost } from './api';
import type { Grupo, GrupoTipo } from '@/lib/types';

export function listarGrupos(token: string) {
  return apiGet<Grupo[]>('/grupos', token);
}

export function obtenerGrupo(token: string, grupoId: string) {
  return apiGet<Grupo>(`/grupos/${grupoId}`, token);
}

export function crearGrupo(token: string, nombre: string, tipo: GrupoTipo) {
  return apiPost<Grupo>('/grupos', token, { nombre, tipo });
}

export function actualizarGrupo(token: string, grupoId: string, cambios: Partial<Pick<Grupo, 'nombre' | 'tipo'>>) {
  return apiPatch<Grupo>(`/grupos/${grupoId}`, token, cambios);
}

export function eliminarGrupo(token: string, grupoId: string) {
  return apiDelete<void>(`/grupos/${grupoId}`, token);
}
