'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/useSession';
import { generarInvitacion, listarInvitaciones } from '@/services/invitaciones.service';
import { InviteCodeBox } from '@/components/molecules/InviteCodeBox';
import { EmptyState } from '@/components/molecules/EmptyState';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Spinner } from '@/components/atoms/Spinner';
import { Alert } from '@/components/atoms/Alert';
import type { InvitacionGrupo } from '@/lib/types';

export function InvitacionesPanel({ grupoId }: { grupoId: string }) {
  const { accessToken } = useSession();
  const [invitaciones, setInvitaciones] = useState<InvitacionGrupo[] | null>(null);
  const [error, setError] = useState('');
  const [generando, setGenerando] = useState(false);

  const cargar = () => {
    if (!accessToken) return;
    listarInvitaciones(accessToken, grupoId)
      .then(setInvitaciones)
      .catch((err: Error) => setError(err.message));
  };

  useEffect(cargar, [accessToken, grupoId]);

  const handleGenerar = async () => {
    if (!accessToken) return;
    setError('');
    setGenerando(true);
    try {
      await generarInvitacion(accessToken, grupoId);
      cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar el código');
    } finally {
      setGenerando(false);
    }
  };

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">Invitar a alguien</p>
        <Button size="sm" onClick={handleGenerar} disabled={generando}>
          {generando ? 'Generando...' : 'Generar código'}
        </Button>
      </div>

      {error && <Alert>{error}</Alert>}

      {invitaciones === null ? (
        <div className="flex justify-center py-4 text-muted">
          <Spinner />
        </div>
      ) : invitaciones.length === 0 ? (
        <EmptyState titulo="Sin códigos generados" descripcion="Genera uno para que se unan a este grupo." />
      ) : (
        <div className="space-y-2">
          {invitaciones.map((inv) => (
            <InviteCodeBox key={inv.id} invitacion={inv} />
          ))}
        </div>
      )}
    </Card>
  );
}
