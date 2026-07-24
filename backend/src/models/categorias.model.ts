import type { SupabaseClient } from '@supabase/supabase-js';
import { HttpError } from '../utils/httpError';
import type { Categoria } from '../types';

export async function listarCategoriasGrupo(
  supabase: SupabaseClient,
  grupoId: string
): Promise<Categoria[]> {
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .eq('grupo_id', grupoId)
    .order('nombre', { ascending: true });
  if (error) throw new HttpError(500, error.message);
  return (data ?? []) as Categoria[];
}

export async function crearCategoriaGrupo(
  supabase: SupabaseClient,
  grupoId: string,
  nombre: string,
  icono?: string,
  color?: string
): Promise<Categoria> {
  const { data, error } = await supabase
    .from('categorias')
    .insert({ grupo_id: grupoId, usuario_id: null, nombre, icono, color })
    .select()
    .single();
  if (error) throw new HttpError(400, error.message);
  return data as Categoria;
}

export async function actualizarCategoria(
  supabase: SupabaseClient,
  categoriaId: string,
  cambios: Partial<Pick<Categoria, 'nombre' | 'icono' | 'color'>>
): Promise<Categoria> {
  const { data, error } = await supabase
    .from('categorias')
    .update(cambios)
    .eq('id', categoriaId)
    .select()
    .single();
  if (error) throw new HttpError(400, error.message);
  return data as Categoria;
}

export async function eliminarCategoria(supabase: SupabaseClient, categoriaId: string): Promise<void> {
  const { error } = await supabase.from('categorias').delete().eq('id', categoriaId);
  if (error) throw new HttpError(400, error.message);
}
