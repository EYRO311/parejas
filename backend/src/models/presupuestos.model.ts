import type { SupabaseClient } from '@supabase/supabase-js';
import { HttpError } from '../utils/httpError';
import type { PresupuestoQuincenal } from '../types';

export async function listarPresupuestos(
  supabase: SupabaseClient,
  grupoId: string
): Promise<PresupuestoQuincenal[]> {
  const { data, error } = await supabase
    .from('presupuestos_quincenales')
    .select('*')
    .eq('grupo_id', grupoId)
    .order('quincena_inicio', { ascending: false });
  if (error) throw new HttpError(500, error.message);
  return (data ?? []) as PresupuestoQuincenal[];
}

export async function obtenerPresupuesto(
  supabase: SupabaseClient,
  presupuestoId: string
): Promise<PresupuestoQuincenal & { aportes_presupuesto: unknown[] }> {
  const { data, error } = await supabase
    .from('presupuestos_quincenales')
    .select('*, aportes_presupuesto(*)')
    .eq('id', presupuestoId)
    .maybeSingle();
  if (error) throw new HttpError(500, error.message);
  if (!data) throw new HttpError(404, 'Presupuesto no encontrado o sin acceso');
  return data as any;
}

/**
 * La quincena (convención MX: 1-15 y 16-fin de mes) de la fecha actual se
 * crea sola la primera vez que algún miembro del grupo la consulta — ver
 * public.obtener_o_crear_presupuesto_actual (migración 0007). Nadie
 * captura fechas a mano.
 */
export async function obtenerOCrearPresupuestoActual(
  supabase: SupabaseClient,
  grupoId: string
): Promise<string> {
  const { data, error } = await supabase.rpc('obtener_o_crear_presupuesto_actual', { p_grupo_id: grupoId });
  if (error) throw new HttpError(400, error.message);
  return data as string;
}

export async function cerrarPresupuesto(
  supabase: SupabaseClient,
  presupuestoId: string
): Promise<PresupuestoQuincenal> {
  const { data, error } = await supabase
    .from('presupuestos_quincenales')
    .update({ estado: 'cerrado' })
    .eq('id', presupuestoId)
    .select()
    .single();
  if (error) throw new HttpError(400, error.message);
  return data as PresupuestoQuincenal;
}
