'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/useSession';
import { crearGrupo } from '@/services/grupos.service';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Alert } from '@/components/atoms/Alert';
import { Card } from '@/components/atoms/Card';
import { FormField } from '@/components/molecules/FormField';
import { OptionCards } from '@/components/molecules/OptionCards';
import type { GrupoTipo } from '@/lib/types';

const TIPOS: { value: GrupoTipo; label: string; description: string }[] = [
  { value: 'pareja', label: 'Pareja', description: 'Solo ustedes dos' },
  { value: 'familia', label: 'Familia', description: 'Todos los de casa' },
  { value: 'roommates', label: 'Roommates', description: 'Gastos de la casa' },
];

export function CrearGrupoForm() {
  const router = useRouter();
  const { accessToken } = useSession();
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState<GrupoTipo>('pareja');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    setError('');
    setCargando(true);
    try {
      const grupo = await crearGrupo(accessToken, nombre.trim(), tipo);
      router.push(`/grupos/${grupo.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el grupo');
    } finally {
      setCargando(false);
    }
  };

  return (
    <Card>
      <p className="mb-3 text-sm font-medium text-foreground">Crear grupo nuevo</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <FormField label="Nombre" htmlFor="nombre-grupo">
          <Input
            id="nombre-grupo"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nuestra pareja"
          />
        </FormField>

        <div>
          <p className="mb-1 text-sm font-medium text-foreground">Tipo</p>
          <OptionCards options={TIPOS} value={tipo} onChange={setTipo} />
        </div>

        {error && <Alert>{error}</Alert>}

        <Button type="submit" disabled={cargando} className="w-full">
          {cargando ? 'Creando...' : 'Crear grupo'}
        </Button>
      </form>
    </Card>
  );
}
