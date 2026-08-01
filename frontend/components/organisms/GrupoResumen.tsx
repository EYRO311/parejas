'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from '@/lib/useSession';
import { listarSalidas } from '@/services/salidas.service';
import { obtenerPresupuestoActual } from '@/services/presupuestos.service';
import { Card } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { MoneyText } from '@/components/atoms/MoneyText';
import { Spinner } from '@/components/atoms/Spinner';
import { EmptyState } from '@/components/molecules/EmptyState';
import { SalidaListItem } from '@/components/molecules/SalidaListItem';
import { formatFecha } from '@/lib/format';
import type { PresupuestoConAportes, Salida } from '@/lib/types';

export function GrupoResumen({ grupoId }: { grupoId: string }) {
  const { accessToken } = useSession();
  const [salidas, setSalidas] = useState<Salida[] | null>(null);
  const [presupuesto, setPresupuesto] = useState<PresupuestoConAportes | undefined>(undefined);

  useEffect(() => {
    if (!accessToken) return;
    listarSalidas(accessToken, grupoId).then(setSalidas);
    obtenerPresupuestoActual(accessToken, grupoId).then(setPresupuesto);
  }, [accessToken, grupoId]);

  return (
    <div className="space-y-6">
      <section>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">Quincena actual</p>
          <Link href={`/grupos/${grupoId}/presupuesto`} className="text-xs text-primary">
            Ver todo
          </Link>
        </div>
        {presupuesto === undefined ? (
          <div className="flex justify-center py-6 text-muted">
            <Spinner />
          </div>
        ) : (
          <Link href={`/grupos/${grupoId}/presupuesto/${presupuesto.id}`} className="block">
            <Card className="transition-all hover:border-primary/40 hover:bg-surface active:scale-[0.98]">
              <div className="flex items-center justify-between">
                <p className="text-sm text-foreground">
                  {formatFecha(presupuesto.quincena_inicio)} — {formatFecha(presupuesto.quincena_fin)}
                </p>
                <Badge tone={presupuesto.estado === 'activo' ? 'success' : 'neutral'}>
                  {presupuesto.estado === 'activo' ? 'Activo' : 'Cerrado'}
                </Badge>
              </div>
              <p className="mt-1 text-lg font-semibold text-foreground">
                <MoneyText monto={presupuesto.monto_objetivo_total} />
              </p>
            </Card>
          </Link>
        )}
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">Salidas recientes</p>
          <Link href={`/grupos/${grupoId}/salidas`} className="text-xs text-primary">
            Ver todas
          </Link>
        </div>
        {salidas === null ? (
          <div className="flex justify-center py-6 text-muted">
            <Spinner />
          </div>
        ) : salidas.length === 0 ? (
          <EmptyState titulo="Sin salidas registradas" descripcion="Registra la primera desde la pestaña Salidas." />
        ) : (
          <div className="space-y-2">
            {salidas.slice(0, 5).map((salida) => (
              <SalidaListItem key={salida.id} salida={salida} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
