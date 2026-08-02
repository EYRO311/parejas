'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Alert } from '@/components/atoms/Alert';
import { Spinner } from '@/components/atoms/Spinner';
import { FormField } from '@/components/molecules/FormField';

/**
 * Sirve para dos casos, igual que en asistente:
 * 1. Enlace de recuperación por correo (evento PASSWORD_RECOVERY).
 * 2. Usuario ya logueado que entra aquí desde el menú para cambiar su
 *    contraseña (ya tiene sesión, no necesita el enlace).
 */
export function ActualizarPasswordForm() {
  const router = useRouter();
  const [listo, setListo] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const { data: listener } = supabase.auth.onAuthStateChange((evento) => {
      if (evento === 'PASSWORD_RECOVERY' || evento === 'SIGNED_IN') setListo(true);
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setListo(true);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmar) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setCargando(true);
    try {
      const supabase = createClient();
      const { error: errorUpdate } = await supabase.auth.updateUser({ password });
      if (errorUpdate) throw errorUpdate;
      setExito(true);
      setTimeout(() => {
        router.push('/grupos');
        router.refresh();
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setCargando(false);
    }
  };

  if (exito) {
    return <Alert tone="success">Contraseña actualizada. Redirigiendo...</Alert>;
  }

  if (!listo) {
    return (
      <div className="space-y-3 text-center">
        <div className="flex justify-center text-muted">
          <Spinner />
        </div>
        <p className="text-sm text-muted">
          Verificando el enlace de recuperación... si no es válido o expiró, vuelve a solicitarlo desde el login.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Nueva contraseña" htmlFor="password">
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </FormField>

      <FormField label="Confirmar contraseña" htmlFor="confirmar-password">
        <Input
          id="confirmar-password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          value={confirmar}
          onChange={(e) => setConfirmar(e.target.value)}
        />
      </FormField>

      {error && <Alert>{error}</Alert>}

      <Button type="submit" disabled={cargando} className="w-full">
        {cargando ? 'Guardando...' : 'Guardar nueva contraseña'}
      </Button>
    </form>
  );
}
