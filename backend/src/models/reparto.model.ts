import type { SupabaseClient } from '@supabase/supabase-js';
import { HttpError } from '../utils/httpError';
import type { RepartoSalida } from '../types';

export async function listarReparto(supabase: SupabaseClient, salidaId: string): Promise<RepartoSalida[]> {
  const { data, error } = await supabase.from('reparto_salida').select('*').eq('salida_id', salidaId);
  if (error) throw new HttpError(500, error.message);
  return (data ?? []) as RepartoSalida[];
}

/**
 * Reemplaza el reparto completo de una salida (upsert por usuario). El
 * frontend puede sugerir 50/50, pero el reparto final que llega aquí es
 * responsabilidad del usuario editarlo si no aplica.
 */
export async function definirReparto(
  supabase: SupabaseClient,
  salidaId: string,
  reparto: Array<{ usuario_id: string; monto_le_corresponde: number }>
): Promise<RepartoSalida[]> {
  const filas = reparto.map((r) => ({ ...r, salida_id: salidaId }));
  const { data, error } = await supabase
    .from('reparto_salida')
    .upsert(filas, { onConflict: 'salida_id,usuario_id' })
    .select();
  if (error) throw new HttpError(400, error.message);
  return (data ?? []) as RepartoSalida[];
}

export async function marcarLiquidado(
  supabase: SupabaseClient,
  salidaId: string,
  usuarioId: string,
  liquidado: boolean
): Promise<RepartoSalida> {
  const { data, error } = await supabase
    .from('reparto_salida')
    .update({ liquidado })
    .eq('salida_id', salidaId)
    .eq('usuario_id', usuarioId)
    .select()
    .single();
  if (error) throw new HttpError(400, error.message);
  return data as RepartoSalida;
}
