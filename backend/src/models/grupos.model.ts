import type { SupabaseClient } from '@supabase/supabase-js';
import { HttpError } from '../utils/httpError';
import type { Grupo, GrupoTipo } from '../types';

export async function listarGruposDeUsuario(
  supabase: SupabaseClient,
  usuarioId: string
): Promise<Grupo[]> {
  // La policy miembros_grupo_select deja ver a TODOS los miembros de los
  // grupos propios, así que sin filtrar por usuario_id el grupo se repite
  // una vez por cada miembro.
  const { data, error } = await supabase
    .from('miembros_grupo')
    .select('grupos(*)')
    .eq('usuario_id', usuarioId)
    .eq('activo', true);

  if (error) throw new HttpError(500, error.message);

  const vistos = new Set<string>();
  const grupos: Grupo[] = [];
  for (const fila of (data ?? []) as any[]) {
    const grupo = fila.grupos as Grupo | null;
    if (!grupo || vistos.has(grupo.id)) continue;
    vistos.add(grupo.id);
    grupos.push(grupo);
  }
  return grupos;
}

export async function obtenerGrupo(supabase: SupabaseClient, grupoId: string): Promise<Grupo> {
  const { data, error } = await supabase.from('grupos').select('*').eq('id', grupoId).maybeSingle();
  if (error) throw new HttpError(500, error.message);
  if (!data) throw new HttpError(404, 'Grupo no encontrado');
  return data as Grupo;
}

export async function crearGrupo(
  supabase: SupabaseClient,
  nombre: string,
  tipo: GrupoTipo
): Promise<string> {
  const { data, error } = await supabase.rpc('crear_grupo', { p_nombre: nombre, p_tipo: tipo });
  if (error) throw new HttpError(400, error.message);
  return data as string;
}

export async function actualizarGrupo(
  supabase: SupabaseClient,
  grupoId: string,
  cambios: Partial<Pick<Grupo, 'nombre' | 'tipo'>>
): Promise<Grupo> {
  const { data, error } = await supabase
    .from('grupos')
    .update(cambios)
    .eq('id', grupoId)
    .select()
    .single();
  if (error) throw new HttpError(400, error.message);
  return data as Grupo;
}

export async function eliminarGrupo(supabase: SupabaseClient, grupoId: string): Promise<void> {
  const { error } = await supabase.from('grupos').delete().eq('id', grupoId);
  if (error) throw new HttpError(400, error.message);
}
