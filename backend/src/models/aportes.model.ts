import type { SupabaseClient } from '@supabase/supabase-js';
import { HttpError } from '../utils/httpError';
import { obtenerClienteServicio } from '../config/supabaseClient';
import type { AportePresupuesto } from '../types';

export async function listarAportes(
  supabase: SupabaseClient,
  presupuestoId: string
): Promise<AportePresupuesto[]> {
  const { data, error } = await supabase
    .from('aportes_presupuesto')
    .select('*')
    .eq('presupuesto_id', presupuestoId);
  if (error) throw new HttpError(500, error.message);
  return (data ?? []) as AportePresupuesto[];
}

export async function definirAporte(
  supabase: SupabaseClient,
  presupuestoId: string,
  usuarioId: string,
  montoComprometido: number
): Promise<AportePresupuesto> {
  const { data, error } = await supabase
    .from('aportes_presupuesto')
    .upsert(
      { presupuesto_id: presupuestoId, usuario_id: usuarioId, monto_comprometido: montoComprometido },
      { onConflict: 'presupuesto_id,usuario_id' }
    )
    .select()
    .single();
  if (error) throw new HttpError(400, error.message);
  return data as AportePresupuesto;
}

/**
 * monto_aportado es un campo derivado (ver 0004_funciones_y_triggers.sql):
 * solo se recalcula vía RPC con la service key, nunca se acepta un valor
 * directo del cliente. Se invoca tras crear/editar/borrar un pago de
 * salida o un gasto individual marcado como compartido con el grupo.
 */
export async function recalcularGastadoReal(
  usuarioId: string,
  grupoId: string,
  fecha: string
): Promise<void> {
  const servicio = obtenerClienteServicio();
  const { error } = await servicio.rpc('recalcular_gastado_real', {
    p_usuario_id: usuarioId,
    p_grupo_id: grupoId,
    p_fecha: fecha,
  });
  if (error) throw new HttpError(500, error.message);
}
