import type { SupabaseClient } from '@supabase/supabase-js';
import { HttpError } from '../utils/httpError';
import type { PagoSalida } from '../types';

export async function listarPagos(supabase: SupabaseClient, salidaId: string): Promise<PagoSalida[]> {
  const { data, error } = await supabase
    .from('pagos_salida')
    .select('*')
    .eq('salida_id', salidaId)
    .order('created_at', { ascending: true });
  if (error) throw new HttpError(500, error.message);
  return (data ?? []) as PagoSalida[];
}

export async function obtenerPago(supabase: SupabaseClient, pagoId: string): Promise<PagoSalida> {
  const { data, error } = await supabase
    .from('pagos_salida')
    .select('*')
    .eq('id', pagoId)
    .maybeSingle();
  if (error) throw new HttpError(500, error.message);
  if (!data) throw new HttpError(404, 'Pago no encontrado');
  return data as PagoSalida;
}

export async function registrarPago(
  supabase: SupabaseClient,
  salidaId: string,
  usuarioId: string,
  datos: Pick<PagoSalida, 'monto' | 'banco' | 'captura_url'>
): Promise<PagoSalida> {
  const { data, error } = await supabase
    .from('pagos_salida')
    .insert({ ...datos, salida_id: salidaId, usuario_id: usuarioId })
    .select()
    .single();
  if (error) throw new HttpError(400, error.message);
  return data as PagoSalida;
}

export async function actualizarPago(
  supabase: SupabaseClient,
  pagoId: string,
  cambios: Partial<Pick<PagoSalida, 'monto' | 'banco' | 'captura_url'>>
): Promise<PagoSalida> {
  const { data, error } = await supabase
    .from('pagos_salida')
    .update(cambios)
    .eq('id', pagoId)
    .select()
    .single();
  if (error) throw new HttpError(400, error.message);
  return data as PagoSalida;
}

export async function eliminarPago(supabase: SupabaseClient, pagoId: string): Promise<void> {
  const { error } = await supabase.from('pagos_salida').delete().eq('id', pagoId);
  if (error) throw new HttpError(400, error.message);
}
