import type { SupabaseClient } from '@supabase/supabase-js';
import { HttpError } from './httpError';
import type { MiembroRol } from '../types';

/**
 * Confirma explícitamente, en el controller, que usuarioId pertenece a
 * grupoId antes de una operación de escritura. RLS es la autoridad final,
 * pero esta capa da mensajes de error claros y documenta la regla de
 * negocio en el código de la aplicación en vez de dejarla implícita.
 */
export async function verificarPertenenciaGrupo(
  supabase: SupabaseClient,
  usuarioId: string,
  grupoId: string
): Promise<MiembroRol> {
  const { data, error } = await supabase
    .from('miembros_grupo')
    .select('rol')
    .eq('grupo_id', grupoId)
    .eq('usuario_id', usuarioId)
    .eq('activo', true)
    .maybeSingle();

  if (error) throw new HttpError(500, error.message);
  if (!data) throw new HttpError(403, 'No perteneces a este grupo');
  return data.rol as MiembroRol;
}
