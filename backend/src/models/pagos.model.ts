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

/**
 * Todos los pagos del grupo (de todas sus salidas), con el nombre de quien
 * pagó embebido. Base para el dashboard de gastos por usuario. RLS ya
 * garantiza que solo se vean pagos de salidas de grupos donde el usuario
 * que consulta es miembro (pagos_salida_select en 0005_rls_policies.sql).
 */
export async function listarPagosDeGrupo(
  supabase: SupabaseClient,
  grupoId: string
): Promise<Array<PagoSalida & { usuarios: { nombre: string } | null }>> {
  const { data: salidas, error: errorSalidas } = await supabase
    .from('salidas')
    .select('id')
    .eq('grupo_id', grupoId);
  if (errorSalidas) throw new HttpError(500, errorSalidas.message);

  const salidaIds = (salidas ?? []).map((s) => s.id);
  if (salidaIds.length === 0) return [];

  const { data, error } = await supabase
    .from('pagos_salida')
    .select('*, usuarios(nombre)')
    .in('salida_id', salidaIds)
    .order('created_at', { ascending: true });
  if (error) throw new HttpError(500, error.message);
  return (data ?? []) as any;
}
