'use client';

import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

interface EstadoSesion {
  usuario: User | null;
  accessToken: string | null;
  cargando: boolean;
}

/** Sesión de Supabase en el cliente: da el access_token que services/ manda al backend. */
export function useSession(): EstadoSesion {
  const [estado, setEstado] = useState<EstadoSesion>({
    usuario: null,
    accessToken: null,
    cargando: true,
  });

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data }) => {
      setEstado({
        usuario: data.session?.user ?? null,
        accessToken: data.session?.access_token ?? null,
        cargando: false,
      });
    });

    const { data: suscripcion } = supabase.auth.onAuthStateChange((_evento, session) => {
      setEstado({
        usuario: session?.user ?? null,
        accessToken: session?.access_token ?? null,
        cargando: false,
      });
    });

    return () => suscripcion.subscription.unsubscribe();
  }, []);

  return estado;
}
