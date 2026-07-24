'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/useSession';
import { eliminarMiembro, listarMiembros } from '@/services/miembros.service';
import { MiembroRow } from '@/components/molecules/MiembroRow';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Spinner } from '@/components/atoms/Spinner';
import { Alert } from '@/components/atoms/Alert';
import type { MiembroGrupo } from '@/lib/types';

export function MiembrosList({ grupoId }: { grupoId: string }) {
  const { accessToken, usuario } = useSession();
  const [miembros, setMiembros] = useState<MiembroGrupo[] | null>(null);
  const [error, setError] = useState('');

  const cargar = () => {
    if (!accessToken) return;
    listarMiembros(accessToken, grupoId)
      .then(setMiembros)
      .catch((err: Error) => setError(err.message));
  };

  useEffect(cargar, [accessToken, grupoId]);

  const soyAdmin = miembros?.find((m) => m.usuario_id === usuario?.id)?.rol === 'admin';

  const handleQuitar = async (usuarioId: string) => {
    if (!accessToken) return;
    if (!confirm('¿Quitar a este integrante del grupo?')) return;
    await eliminarMiembro(accessToken, grupoId, usuarioId);
    cargar();
  };

  if (error) return <Alert>{error}</Alert>;

  if (!miembros) {
    return (
      <div className="flex justify-center py-10 text-muted">
        <Spinner />
      </div>
    );
  }

  return (
    <Card>
      <div className="divide-y divide-border-soft">
        {miembros.map((m) => (
          <MiembroRow
            key={m.id}
            miembro={m}
            acciones={
              soyAdmin && m.usuario_id !== usuario?.id ? (
                <Button variant="ghost" size="sm" onClick={() => handleQuitar(m.usuario_id)}>
                  Quitar
                </Button>
              ) : undefined
            }
          />
        ))}
      </div>
    </Card>
  );
}
