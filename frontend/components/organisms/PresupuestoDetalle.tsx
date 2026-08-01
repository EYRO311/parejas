'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useSession } from '@/lib/useSession';
import { cerrarPresupuesto, obtenerPresupuesto } from '@/services/presupuestos.service';
import { definirAportePropio } from '@/services/aportes.service';
import { listarMiembros } from '@/services/miembros.service';
import { AporteRow } from '@/components/molecules/AporteRow';
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog';
import { Card } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { MoneyText } from '@/components/atoms/MoneyText';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Spinner } from '@/components/atoms/Spinner';
import { Alert } from '@/components/atoms/Alert';
import { FormField } from '@/components/molecules/FormField';
import { formatFecha } from '@/lib/format';
import type { MiembroGrupo, PresupuestoConAportes } from '@/lib/types';

export function PresupuestoDetalle({ presupuestoId }: { presupuestoId: string }) {
  const { accessToken, usuario } = useSession();
  const [presupuesto, setPresupuesto] = useState<PresupuestoConAportes | null>(null);
  const [miembros, setMiembros] = useState<MiembroGrupo[]>([]);
  const [montoPropio, setMontoPropio] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [confirmarCierre, setConfirmarCierre] = useState(false);
  const [cerrando, setCerrando] = useState(false);

  const cargar = useCallback(() => {
    if (!accessToken) return;
    obtenerPresupuesto(accessToken, presupuestoId)
      .then((p) => {
        setPresupuesto(p);
        const propio = p.aportes_presupuesto.find((a) => a.usuario_id === usuario?.id);
        if (propio) setMontoPropio(String(propio.monto_comprometido));
      })
      .catch((err: Error) => setError(err.message));
  }, [accessToken, presupuestoId, usuario?.id]);

  useEffect(cargar, [cargar]);

  useEffect(() => {
    if (!accessToken || !presupuesto) return;
    listarMiembros(accessToken, presupuesto.grupo_id).then(setMiembros);
  }, [accessToken, presupuesto]);

  const nombreDe = (usuarioId: string) =>
    miembros.find((m) => m.usuario_id === usuarioId)?.usuarios?.nombre ?? 'Usuario';

  const soyAdmin = miembros.find((m) => m.usuario_id === usuario?.id)?.rol === 'admin';

  const handleDefinirAporte = async (e: FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    setError('');
    setGuardando(true);
    try {
      await definirAportePropio(accessToken, presupuestoId, Number(montoPropio));
      cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar tu aporte');
    } finally {
      setGuardando(false);
    }
  };

  const handleCerrar = async () => {
    if (!accessToken) return;
    setCerrando(true);
    try {
      await cerrarPresupuesto(accessToken, presupuestoId);
      cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cerrar la quincena');
    } finally {
      setCerrando(false);
      setConfirmarCierre(false);
    }
  };

  if (error && !presupuesto) return <Alert>{error}</Alert>;

  if (!presupuesto) {
    return (
      <div className="flex justify-center py-10 text-muted">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between">
          <p className="text-sm text-foreground">
            {formatFecha(presupuesto.quincena_inicio)} — {formatFecha(presupuesto.quincena_fin)}
          </p>
          <Badge tone={presupuesto.estado === 'activo' ? 'success' : 'neutral'}>
            {presupuesto.estado === 'activo' ? 'Activo' : 'Cerrado'}
          </Badge>
        </div>
        <p className="mt-1 text-2xl font-semibold text-foreground">
          <MoneyText monto={presupuesto.monto_objetivo_total} />
        </p>
        <p className="text-xs text-muted">Objetivo total del grupo (suma de los compromisos individuales)</p>
      </Card>

      <Card>
        <p className="mb-3 text-sm font-medium text-foreground">Aportes por persona</p>
        <div className="divide-y divide-border-soft">
          {presupuesto.aportes_presupuesto.map((aporte) => (
            <AporteRow key={aporte.id} aporte={aporte} nombreUsuario={nombreDe(aporte.usuario_id)} />
          ))}
        </div>
      </Card>

      {presupuesto.estado === 'activo' && (
        <Card>
          <p className="mb-3 text-sm font-medium text-foreground">Mi límite para esta quincena</p>
          <form onSubmit={handleDefinirAporte} className="flex flex-wrap items-end gap-3">
            <FormField label="Monto comprometido" htmlFor="monto-propio">
              <Input
                id="monto-propio"
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                required
                value={montoPropio}
                onChange={(e) => setMontoPropio(e.target.value)}
                className="w-40"
              />
            </FormField>
            <Button type="submit" disabled={guardando}>
              {guardando ? 'Guardando...' : 'Guardar'}
            </Button>
          </form>
        </Card>
      )}

      {error && <Alert>{error}</Alert>}

      {presupuesto.estado === 'activo' && soyAdmin && (
        <Button variant="outline" size="sm" onClick={() => setConfirmarCierre(true)}>
          Cerrar quincena
        </Button>
      )}

      <ConfirmDialog
        open={confirmarCierre}
        titulo="¿Cerrar esta quincena?"
        descripcion="Ya no se podrán editar los aportes de nadie."
        confirmLabel="Cerrar quincena"
        tone="danger"
        cargando={cerrando}
        onConfirm={handleCerrar}
        onCancel={() => setConfirmarCierre(false)}
      />
    </div>
  );
}
