'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/useSession';
import { unirseAGrupo } from '@/services/invitaciones.service';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Alert } from '@/components/atoms/Alert';
import { Card } from '@/components/atoms/Card';
import { FormField } from '@/components/molecules/FormField';

export function UnirseGrupoForm() {
  const router = useRouter();
  const { accessToken } = useSession();
  const [codigo, setCodigo] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    setError('');
    setCargando(true);
    try {
      const grupo = await unirseAGrupo(accessToken, codigo.trim().toUpperCase());
      router.push(`/grupos/${grupo.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Código inválido');
    } finally {
      setCargando(false);
    }
  };

  return (
    <Card>
      <p className="mb-3 text-sm font-medium text-foreground">Unirme con un código</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <FormField label="Código de invitación" htmlFor="codigo-invitacion">
          <Input
            id="codigo-invitacion"
            required
            maxLength={6}
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.toUpperCase())}
            placeholder="AB12CD"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            className="font-mono text-lg tracking-[0.3em] text-center"
          />
        </FormField>

        {error && <Alert>{error}</Alert>}

        <Button type="submit" variant="secondary" disabled={cargando} className="w-full">
          {cargando ? 'Uniéndome...' : 'Unirme al grupo'}
        </Button>
      </form>
    </Card>
  );
}
