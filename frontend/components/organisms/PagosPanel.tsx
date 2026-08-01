'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useSession } from '@/lib/useSession';
import { eliminarPago, listarPagos, registrarPago } from '@/services/pagos.service';
import { PagoRow } from '@/components/molecules/PagoRow';
import { EmptyState } from '@/components/molecules/EmptyState';
import { Spinner } from '@/components/atoms/Spinner';
import { Alert } from '@/components/atoms/Alert';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import type { MiembroGrupo, PagoSalida } from '@/lib/types';

interface PagosPanelProps {
  salidaId: string;
  moneda: string;
  miembros: MiembroGrupo[];
  onCambio?: () => void;
}

function nombreDe(miembros: MiembroGrupo[], usuarioId: string): string {
  return miembros.find((m) => m.usuario_id === usuarioId)?.usuarios?.nombre ?? 'Usuario';
}

export function PagosPanel({ salidaId, moneda, miembros, onCambio }: PagosPanelProps) {
  const { accessToken, usuario } = useSession();
  const [pagos, setPagos] = useState<PagoSalida[] | null>(null);
  const [monto, setMonto] = useState('');
  const [banco, setBanco] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cargar = () => {
    if (!accessToken) return;
    listarPagos(accessToken, salidaId).then(setPagos).catch((err: Error) => setError(err.message));
  };

  useEffect(cargar, [accessToken, salidaId]);

  const handleAgregar = async (e: FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    setError('');
    setGuardando(true);
    try {
      await registrarPago(accessToken, salidaId, { monto: Number(monto), banco: banco.trim() || undefined });
      setMonto('');
      setBanco('');
      cargar();
      onCambio?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar el pago');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (pagoId: string) => {
    if (!accessToken) return;
    await eliminarPago(accessToken, pagoId);
    cargar();
    onCambio?.();
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-foreground">Pagos registrados</p>

      {pagos === null && !error ? (
        <div className="flex justify-center py-6 text-muted">
          <Spinner />
        </div>
      ) : pagos && pagos.length === 0 ? (
        <EmptyState titulo="Nadie ha registrado un pago todavía" />
      ) : (
        <div className="divide-y divide-border-soft">
          {pagos?.map((pago) => (
            <PagoRow
              key={pago.id}
              pago={pago}
              nombreUsuario={nombreDe(miembros, pago.usuario_id)}
              moneda={moneda}
              esPropio={pago.usuario_id === usuario?.id}
              onEliminar={() => handleEliminar(pago.id)}
            />
          ))}
        </div>
      )}

      <form onSubmit={handleAgregar} className="flex flex-wrap items-end gap-2 pt-2">
        <div className="flex-1 min-w-24">
          <Input
            type="number"
            inputMode="decimal"
            min={0.01}
            step="0.01"
            required
            placeholder="Monto"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
          />
        </div>
        <div className="flex-1 min-w-24">
          <Input placeholder="Banco (opcional)" value={banco} onChange={(e) => setBanco(e.target.value)} />
        </div>
        <Button type="submit" variant="secondary" size="sm" disabled={guardando}>
          {guardando ? 'Guardando...' : 'Agregar mi pago'}
        </Button>
      </form>

      {error && <Alert>{error}</Alert>}
    </div>
  );
}
