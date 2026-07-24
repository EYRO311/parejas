import { createBrowserClient } from '@supabase/ssr';

/** Cliente de Supabase para Client Components (navegador). Solo se usa para leer la sesión/token; los datos siempre pasan por el backend. */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
