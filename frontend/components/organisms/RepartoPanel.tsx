'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/useSession';
import { definirReparto, listarReparto, marcarLiquidado } from '@/services/reparto.service';
import { RepartoRow } from '@/components/molecules/RepartoRow';
import { Spinner } from '@/components/atoms/Spinner';
import { Alert } from '@/components/atoms/Alert';
import { Button } from '@/components/atoms/Button';
import type { MiembroGrupo, RepartoSalida } from '@/lib/types';

interface RepartoPanelProps {
  salidaId: string;
  costoTotal: number;
  miembros: MiembroGrupo[];
}

function nombreDe(miembros: MiembroGrupo[], usuarioId: string): string {
  return miembros.find((m) => m.usuario_id === usuarioId)?.usuarios?.nombre ?? 'Usuario';
}

export function RepartoPanel({ salidaId, costoTotal, miembros }: RepartoPanelProps) {
  const { accessToken } = useSession();
  const [reparto, setReparto] = useState<RepartoSalida[] | null>(null);
  const [montos, setMontos] = useState<Record<string, number>>({});
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cargar = () => {
    if (!accessToken) return;
    listarReparto(accessToken, salidaId)
      .then((filas) => {
        setReparto(filas);
        setMontos(Object.fromEntries(filas.map((f) => [f.usuario_id, f.monto_le_corresponde])));
      })
      .catch((err: Error) => setError(err.message));
  };

  useEffect(cargar, [accessToken, salidaId]);

  const sugerir5050 = () => {
    const partes = miembros.length || 1;
    const porPersona = Math.round((costoTotal / partes) * 100) / 100;
    setMontos(Object.fromEntries(miembros.map((m) => [m.usuario_id, porPersona])));
  };

  const guardar = async () => {
    if (!accessToken) return;
    setError('');
    setGuardando(true);
    try {
      const filas = await definirReparto(
        accessToken,
        salidaId,
        miembros.map((m) => ({ usuario_id: m.usuario_id, monto_le_corresponde: montos[m.usuario_id] ?? 0 }))
      );
      setReparto(filas);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el reparto');
    } finally {
      setGuardando(false);
    }
  };

  const toggleLiquidado = async (usuarioId: string, liquidadoActual: boolean) => {
    if (!accessToken) return;
    await marcarLiquidado(accessToken, salidaId, usuarioId, !liquidadoActual);
    cargar();
  };

  if (reparto === null && !error) {
    return (
      <div className="flex justify-center py-6 text-muted">
        <Spinner />
      </div>
    );
  }

  const suma = miembros.reduce((acc, m) => acc + (montos[m.usuario_id] ?? 0), 0);
  const cuadra = Math.abs(suma - costoTotal) < 0.01;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">Reparto</p>
        <Button variant="ghost" size="sm" onClick={sugerir5050} type="button">
          Sugerir 50/50
        </Button>
      </div>

      <div className="divide-y divide-border-soft">
        {miembros.map((m) => {
          const fila = reparto?.find((r) => r.usuario_id === m.usuario_id);
          return (
            <RepartoRow
              key={m.usuario_id}
              nombreUsuario={nombreDe(miembros, m.usuario_id)}
              monto={montos[m.usuario_id] ?? 0}
              liquidado={fila?.liquidado ?? false}
              editable
              onCambiarMonto={(valor) => setMontos((prev) => ({ ...prev, [m.usuario_id]: valor }))}
              onToggleLiquidado={fila ? () => toggleLiquidado(m.usuario_id, fila.liquidado) : undefined}
            />
          );
        })}
      </div>

      {!cuadra && (
        <p className="text-xs text-muted">
          La suma ({suma.toFixed(2)}) no coincide con el costo total ({costoTotal.toFixed(2)}) — puedes guardarlo
          igual si así lo acordaron.
        </p>
      )}

      {error && <Alert>{error}</Alert>}

      <Button onClick={guardar} disabled={guardando} className="w-full sm:w-auto">
        {guardando ? 'Guardando...' : 'Guardar reparto'}
      </Button>
    </div>
  );
}
