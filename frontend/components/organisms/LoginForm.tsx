'use client';

import { useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Alert } from '@/components/atoms/Alert';
import { FormField } from '@/components/molecules/FormField';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [modo, setModo] = useState<'login' | 'recuperar'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [correoEnviado, setCorreoEnviado] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    const supabase = createClient();
    const { error: errorLogin } = await supabase.auth.signInWithPassword({ email, password });

    setCargando(false);
    if (errorLogin) {
      setError('Correo o contraseña incorrectos');
      return;
    }

    router.push(searchParams.get('siguiente') || '/grupos');
    router.refresh();
  };

  const handleRecuperar = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    const supabase = createClient();
    const { error: errorReset } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/actualizar-password`,
    });

    setCargando(false);
    if (errorReset) {
      setError(errorReset.message);
      return;
    }
    setCorreoEnviado(true);
  };

  if (modo === 'recuperar') {
    return (
      <div className="space-y-4">
        {correoEnviado ? (
          <Alert tone="success">
            Si {email} tiene una cuenta, te mandamos un correo con el enlace para elegir una nueva contraseña.
          </Alert>
        ) : (
          <form onSubmit={handleRecuperar} className="space-y-4">
            <FormField label="Correo" htmlFor="email-recuperar">
              <Input
                id="email-recuperar"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormField>

            {error && <Alert>{error}</Alert>}

            <Button type="submit" disabled={cargando} className="w-full">
              {cargando ? 'Enviando...' : 'Enviar enlace de recuperación'}
            </Button>
          </form>
        )}

        <button
          type="button"
          onClick={() => {
            setModo('login');
            setError('');
            setCorreoEnviado(false);
          }}
          className="w-full text-center text-sm text-muted hover:text-foreground"
        >
          Volver a iniciar sesión
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Correo" htmlFor="email">
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormField>

      <FormField label="Contraseña" htmlFor="password">
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </FormField>

      {error && <Alert>{error}</Alert>}

      <Button type="submit" disabled={cargando} className="w-full">
        {cargando ? 'Entrando...' : 'Entrar'}
      </Button>

      <button
        type="button"
        onClick={() => {
          setModo('recuperar');
          setError('');
        }}
        className="w-full text-center text-sm text-muted hover:text-foreground"
      >
        ¿Olvidaste tu contraseña?
      </button>
    </form>
  );
}
