'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/useSession';
import { eliminarSalida, obtenerSalida } from '@/services/salidas.service';
import { listarMiembros } from '@/services/miembros.service';
import { Card } from '@/components/atoms/Card';
import { MoneyText } from '@/components/atoms/MoneyText';
import { Button } from '@/components/atoms/Button';
import { Spinner } from '@/components/atoms/Spinner';
import { Alert } from '@/components/atoms/Alert';
import { PagosPanel } from './PagosPanel';
import { RepartoPanel } from './RepartoPanel';
import { formatFecha } from '@/lib/format';
import type { MiembroGrupo, Salida } from '@/lib/types';

export function SalidaDetalle({ grupoId, salidaId }: { grupoId: string; salidaId: string }) {
  const router = useRouter();
  const { accessToken } = useSession();
  const [salida, setSalida] = useState<Salida | null>(null);
  const [miembros, setMiembros] = useState<MiembroGrupo[]>([]);
  const [error, setError] = useState('');

  const cargarSalida = useCallback(() => {
    if (!accessToken) return;
    obtenerSalida(accessToken, salidaId)
      .then(setSalida)
      .catch((err: Error) => setError(err.message));
  }, [accessToken, salidaId]);

  useEffect(cargarSalida, [cargarSalida]);

  useEffect(() => {
    if (!accessToken) return;
    listarMiembros(accessToken, grupoId).then(setMiembros);
  }, [accessToken, grupoId]);

  const handleEliminar = async () => {
    if (!accessToken) return;
    if (!confirm('¿Borrar esta salida? Se perderán sus pagos y reparto.')) return;
    await eliminarSalida(accessToken, salidaId);
    router.push(`/grupos/${grupoId}/salidas`);
  };

  if (error) return <Alert>{error}</Alert>;

  if (!salida) {
    return (
      <div className="flex justify-center py-10 text-muted">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-foreground">{salida.titulo}</p>
            <p className="text-sm text-muted">{formatFecha(salida.fecha)}</p>
            {salida.descripcion && <p className="mt-1 text-sm text-foreground/80">{salida.descripcion}</p>}
          </div>
          <MoneyText monto={salida.costo_total} moneda={salida.moneda} className="text-lg font-semibold" />
        </div>
      </Card>

      <Card>
        <PagosPanel salidaId={salidaId} moneda={salida.moneda} miembros={miembros} onCambio={cargarSalida} />
      </Card>

      <Card>
        <RepartoPanel salidaId={salidaId} costoTotal={salida.costo_total} miembros={miembros} />
      </Card>

      <Button variant="danger" size="sm" onClick={handleEliminar}>
        Borrar salida
      </Button>
    </div>
  );
}
