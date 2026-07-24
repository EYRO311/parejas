import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

/**
 * Cliente de Supabase para Server Components / Server Actions. Solo se usa
 * para leer la sesión (y así obtener el access_token que se manda al
 * backend); ningún dato de negocio se lee/escribe directo desde aquí.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignorado: pasa cuando setAll se llama desde un Server Component.
            // La sesión igual se refresca vía middleware.ts en cada request.
          }
        },
      },
    }
  );
}
