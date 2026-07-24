import type { SupabaseClient } from '@supabase/supabase-js';
import { HttpError } from '../utils/httpError';
import type { Salida } from '../types';

export interface FiltrosSalidas {
  desde?: string;
  hasta?: string;
  categoriaId?: string;
}

export async function listarSalidas(
  supabase: SupabaseClient,
  grupoId: string,
  filtros: FiltrosSalidas
): Promise<Salida[]> {
  let query = supabase.from('salidas').select('*').eq('grupo_id', grupoId);
  if (filtros.desde) query = query.gte('fecha', filtros.desde);
  if (filtros.hasta) query = query.lte('fecha', filtros.hasta);
  if (filtros.categoriaId) query = query.eq('categoria_id', filtros.categoriaId);

  const { data, error } = await query.order('fecha', { ascending: false });
  if (error) throw new HttpError(500, error.message);
  return (data ?? []) as Salida[];
}

export async function obtenerSalida(supabase: SupabaseClient, salidaId: string): Promise<Salida> {
  const { data, error } = await supabase.from('salidas').select('*').eq('id', salidaId).maybeSingle();
  if (error) throw new HttpError(500, error.message);
  if (!data) throw new HttpError(404, 'Salida no encontrada o sin acceso');
  return data as Salida;
}

export async function crearSalida(
  supabase: SupabaseClient,
  grupoId: string,
  creadoPor: string,
  datos: Pick<Salida, 'titulo' | 'descripcion' | 'fecha' | 'categoria_id' | 'moneda'>
): Promise<Salida> {
  const { data, error } = await supabase
    .from('salidas')
    .insert({ ...datos, grupo_id: grupoId, creado_por: creadoPor })
    .select()
    .single();
  if (error) throw new HttpError(400, error.message);
  return data as Salida;
}

export async function actualizarSalida(
  supabase: SupabaseClient,
  salidaId: string,
  cambios: Partial<Pick<Salida, 'titulo' | 'descripcion' | 'fecha' | 'categoria_id'>>
): Promise<Salida> {
  const { data, error } = await supabase
    .from('salidas')
    .update(cambios)
    .eq('id', salidaId)
    .select()
    .single();
  if (error) throw new HttpError(400, error.message);
  return data as Salida;
}

export async function eliminarSalida(supabase: SupabaseClient, salidaId: string): Promise<void> {
  const { error } = await supabase.from('salidas').delete().eq('id', salidaId);
  if (error) throw new HttpError(400, error.message);
}
