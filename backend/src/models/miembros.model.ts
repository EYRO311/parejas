import type { SupabaseClient } from '@supabase/supabase-js';
import { HttpError } from '../utils/httpError';
import type { MiembroGrupo, MiembroRol } from '../types';

export async function listarMiembros(
  supabase: SupabaseClient,
  grupoId: string
): Promise<Array<MiembroGrupo & { usuarios: { nombre: string; email: string } }>> {
  const { data, error } = await supabase
    .from('miembros_grupo')
    .select('*, usuarios(nombre, email)')
    .eq('grupo_id', grupoId)
    .order('fecha_union', { ascending: true });
  if (error) throw new HttpError(500, error.message);
  return (data ?? []) as any;
}

export async function actualizarMiembro(
  supabase: SupabaseClient,
  grupoId: string,
  usuarioId: string,
  cambios: Partial<Pick<MiembroGrupo, 'rol' | 'activo'>>
): Promise<MiembroGrupo> {
  const { data, error } = await supabase
    .from('miembros_grupo')
    .update(cambios)
    .eq('grupo_id', grupoId)
    .eq('usuario_id', usuarioId)
    .select()
    .single();
  if (error) throw new HttpError(400, error.message);
  return data as MiembroGrupo;
}

export async function eliminarMiembro(
  supabase: SupabaseClient,
  grupoId: string,
  usuarioId: string
): Promise<void> {
  const { error } = await supabase
    .from('miembros_grupo')
    .delete()
    .eq('grupo_id', grupoId)
    .eq('usuario_id', usuarioId);
  if (error) throw new HttpError(400, error.message);
}

export type { MiembroRol };
