import type { SupabaseClient } from '@supabase/supabase-js';
import { HttpError } from '../utils/httpError';
import type { InvitacionGrupo } from '../types';

export async function listarInvitaciones(
  supabase: SupabaseClient,
  grupoId: string
): Promise<InvitacionGrupo[]> {
  const { data, error } = await supabase
    .from('invitaciones_grupo')
    .select('*')
    .eq('grupo_id', grupoId)
    .order('created_at', { ascending: false });
  if (error) throw new HttpError(500, error.message);
  return (data ?? []) as InvitacionGrupo[];
}

export async function generarInvitacion(
  supabase: SupabaseClient,
  grupoId: string,
  creadoPor: string
): Promise<InvitacionGrupo> {
  const { data: codigo, error: errorCodigo } = await supabase.rpc('generar_codigo_invitacion');
  if (errorCodigo) throw new HttpError(500, errorCodigo.message);

  const { data, error } = await supabase
    .from('invitaciones_grupo')
    .insert({ grupo_id: grupoId, codigo, creado_por: creadoPor })
    .select()
    .single();
  if (error) throw new HttpError(400, error.message);
  return data as InvitacionGrupo;
}

export async function expirarInvitacion(
  supabase: SupabaseClient,
  invitacionId: string
): Promise<InvitacionGrupo> {
  const { data, error } = await supabase
    .from('invitaciones_grupo')
    .update({ estado: 'expirado' })
    .eq('id', invitacionId)
    .select()
    .single();
  if (error) throw new HttpError(400, error.message);
  return data as InvitacionGrupo;
}

/** Devuelve el grupo_id al que el usuario se unió. */
export async function unirseAGrupo(supabase: SupabaseClient, codigo: string): Promise<string> {
  const { data, error } = await supabase.rpc('unirse_a_grupo', { p_codigo: codigo });
  if (error) throw new HttpError(400, error.message);
  return data as string;
}
