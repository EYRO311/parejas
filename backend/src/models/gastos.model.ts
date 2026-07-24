import type { SupabaseClient } from '@supabase/supabase-js';
import { HttpError } from '../utils/httpError';

interface GastoCompartible {
  id: string;
  usuario_id: string;
  grupo_id: string | null;
  fecha: string;
}

/**
 * Punto de extensión sobre el gasto ya existente en la app base Finanzas:
 * marca/desmarca un gasto personal como compartido con un grupo, sin
 * duplicar el registro (ver comentario en gastos.grupo_id, migración 0003).
 */
export async function obtenerGasto(supabase: SupabaseClient, gastoId: string): Promise<GastoCompartible> {
  const { data, error } = await supabase
    .from('gastos')
    .select('id, usuario_id, grupo_id, fecha')
    .eq('id', gastoId)
    .maybeSingle();
  if (error) throw new HttpError(500, error.message);
  if (!data) throw new HttpError(404, 'Gasto no encontrado');
  return data as GastoCompartible;
}

export async function compartirGastoConGrupo(
  supabase: SupabaseClient,
  gastoId: string,
  grupoId: string | null
): Promise<GastoCompartible> {
  const { data, error } = await supabase
    .from('gastos')
    .update({ grupo_id: grupoId })
    .eq('id', gastoId)
    .select('id, usuario_id, grupo_id, fecha')
    .single();
  if (error) throw new HttpError(400, error.message);
  return data as GastoCompartible;
}
