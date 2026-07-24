import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';

let clienteServicio: SupabaseClient | null = null;

/**
 * Cliente con la service role key: bypassa RLS. Solo debe usarse desde el
 * backend para operaciones internas (ej. recalcular_gastado_real), nunca
 * para responder directamente lecturas/escrituras iniciadas por el usuario.
 */
export function obtenerClienteServicio(): SupabaseClient {
  if (!clienteServicio) {
    clienteServicio = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return clienteServicio;
}

/**
 * Cliente anon-key con el JWT del usuario en los headers: toda query hecha
 * con este cliente pasa por RLS como ese usuario (auth.uid() resuelve a él).
 */
export function obtenerClienteUsuario(accessToken: string): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}
