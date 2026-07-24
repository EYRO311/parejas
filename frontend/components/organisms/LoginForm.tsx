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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

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
    </form>
  );
}
