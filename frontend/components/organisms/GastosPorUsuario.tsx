'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { IconChevronDown } from '@tabler/icons-react';
import { useSession } from '@/lib/useSession';
import { obtenerGastosPorUsuario } from '@/services/dashboard.service';
import { Card } from '@/components/atoms/Card';
import { Avatar } from '@/components/atoms/Avatar';
import { MoneyText } from '@/components/atoms/MoneyText';
import { Spinner } from '@/components/atoms/Spinner';
import { Alert } from '@/components/atoms/Alert';
import { EmptyState } from '@/components/molecules/EmptyState';
import { formatFechaCorta } from '@/lib/format';
import type { GastoPorUsuario } from '@/lib/types';

export function GastosPorUsuario({ grupoId }: { grupoId: string }) {
  const { accessToken } = useSession();
  const [gastos, setGastos] = useState<GastoPorUsuario[] | null>(null);
  const [error, setError] = useState('');
  const [expandido, setExpandido] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    obtenerGastosPorUsuario(accessToken, grupoId)
      .then(setGastos)
      .catch((err: Error) => setError(err.message));
  }, [accessToken, grupoId]);

  if (error) return <Alert>{error}</Alert>;

  if (gastos === null) {
    return (
      <div className="flex justify-center py-10 text-muted">
        <Spinner />
      </div>
    );
  }

  const totalGrupo = gastos.reduce((suma, g) => suma + g.total, 0);

  if (totalGrupo === 0) {
    return <EmptyState titulo="Sin gastos registrados" descripcion="Los pagos que registren en cada salida aparecerán aquí." />;
  }

  return (
    <div className="space-y-4">
      <Card>
        <p className="text-sm text-muted">Total del grupo</p>
        <p className="mt-1 text-2xl font-semibold text-foreground">
          <MoneyText monto={totalGrupo} />
        </p>
      </Card>

      <div className="space-y-2">
        {gastos.map((gasto) => {
          const porcentaje = totalGrupo > 0 ? Math.round((gasto.total / totalGrupo) * 100) : 0;
          const abierto = expandido === gasto.usuarioId;

          return (
            <Card key={gasto.usuarioId} className="p-0">
              <button
                onClick={() => setExpandido(abierto ? null : gasto.usuarioId)}
                className="flex w-full items-center gap-3 p-4 text-left sm:p-5"
              >
                <Avatar nombre={gasto.nombre} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{gasto.nombre}</p>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-border-soft/60">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${porcentaje}%` }} />
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <MoneyText monto={gasto.total} className="font-semibold" />
                  <p className="text-xs text-muted">{porcentaje}%</p>
                </div>
                <IconChevronDown
                  size={18}
                  stroke={1.5}
                  className={`shrink-0 text-muted transition-transform ${abierto ? 'rotate-180' : ''}`}
                />
              </button>

              {abierto && (
                <div className="border-t border-border-soft/70 px-4 pb-4 sm:px-5 sm:pb-5">
                  {gasto.salidas.length === 0 ? (
                    <p className="pt-3 text-sm text-muted">No ha pagado en ninguna salida todavía.</p>
                  ) : (
                    <ul className="divide-y divide-border-soft/50">
                      {gasto.salidas.map((s) => (
                        <li key={s.salidaId}>
                          <Link
                            href={`/grupos/${grupoId}/salidas/${s.salidaId}`}
                            className="flex items-center justify-between gap-3 py-2.5 hover:text-primary"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm text-foreground">{s.titulo}</p>
                              <p className="text-xs text-muted">{formatFechaCorta(s.fecha)}</p>
                            </div>
                            <MoneyText monto={s.monto} className="shrink-0 text-sm" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
