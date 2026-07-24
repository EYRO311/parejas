'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/useSession';
import { listarPresupuestos, obtenerPresupuestoActual } from '@/services/presupuestos.service';
import { PresupuestoListItem } from '@/components/molecules/PresupuestoListItem';
import { EmptyState } from '@/components/molecules/EmptyState';
import { Spinner } from '@/components/atoms/Spinner';
import { Alert } from '@/components/atoms/Alert';
import type { PresupuestoQuincenal } from '@/lib/types';

/**
 * La quincena de hoy se garantiza sola (obtenerPresupuestoActual la crea
 * si hacía falta) — esta vista solo lista el historial, ya no hay
 * formulario para capturar fechas a mano.
 */
export function PresupuestosList({ grupoId }: { grupoId: string }) {
  const { accessToken } = useSession();
  const [presupuestos, setPresupuestos] = useState<PresupuestoQuincenal[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!accessToken) return;
    obtenerPresupuestoActual(accessToken, grupoId)
      .then(() => listarPresupuestos(accessToken, grupoId))
      .then(setPresupuestos)
      .catch((err: Error) => setError(err.message));
  }, [accessToken, grupoId]);

  if (error) return <Alert>{error}</Alert>;

  if (presupuestos === null) {
    return (
      <div className="flex justify-center py-10 text-muted">
        <Spinner />
      </div>
    );
  }

  if (presupuestos.length === 0) {
    return <EmptyState titulo="Sin quincenas todavía" />;
  }

  return (
    <div className="space-y-2">
      {presupuestos.map((p) => (
        <PresupuestoListItem key={p.id} presupuesto={p} grupoId={grupoId} />
      ))}
    </div>
  );
}
