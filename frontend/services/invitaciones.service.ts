import { apiGet, apiPatch, apiPost } from './api';
import type { Grupo, InvitacionGrupo } from '@/lib/types';

export function listarInvitaciones(token: string, grupoId: string) {
  return apiGet<InvitacionGrupo[]>(`/grupos/${grupoId}/invitaciones`, token);
}

export function generarInvitacion(token: string, grupoId: string) {
  return apiPost<InvitacionGrupo>(`/grupos/${grupoId}/invitaciones`, token);
}

export function expirarInvitacion(token: string, grupoId: string, invitacionId: string) {
  return apiPatch<InvitacionGrupo>(`/grupos/${grupoId}/invitaciones/${invitacionId}`, token);
}

export function unirseAGrupo(token: string, codigo: string) {
  return apiPost<Grupo>('/invitaciones/unirse', token, { codigo });
}
