'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSession } from '@/lib/useSession';
import { listarSalidas } from '@/services/salidas.service';
import { listarMiembros } from '@/services/miembros.service';
import { SalidaListItem } from '@/components/molecules/SalidaListItem';
import { EmptyState } from '@/components/molecules/EmptyState';
import { ResumenTotalSalidas } from '@/components/molecules/ResumenTotalSalidas';
import { Spinner } from '@/components/atoms/Spinner';
import { Alert } from '@/components/atoms/Alert';
import { Button } from '@/components/atoms/Button';
import { IconCalendar, IconPlus } from '@tabler/icons-react';
import { SalidasFiltros, type FiltrosSalidasValor } from './SalidasFiltros';
import { CalendarioSalidas } from './CalendarioSalidas';
import type { MiembroGrupo, Salida } from '@/lib/types';

const FILTROS_VACIOS: FiltrosSalidasValor = { texto: '', creadorId: '', desde: '', hasta: '' };

export function SalidasList({ grupoId }: { grupoId: string }) {
  const { accessToken } = useSession();
  const [salidas, setSalidas] = useState<Salida[] | null>(null);
  const [miembros, setMiembros] = useState<MiembroGrupo[]>([]);
  const [filtros, setFiltros] = useState<FiltrosSalidasValor>(FILTROS_VACIOS);
  const [vista, setVista] = useState<'lista' | 'calendario'>('lista');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!accessToken) return;
    listarSalidas(accessToken, grupoId)
      .then(setSalidas)
      .catch((err: Error) => setError(err.message));
    listarMiembros(accessToken, grupoId).then(setMiembros);
  }, [accessToken, grupoId]);

  const nombreDe = (usuarioId: string) =>
    miembros.find((m) => m.usuario_id === usuarioId)?.usuarios?.nombre ?? 'Usuario';

  const salidasFiltradas = useMemo(() => {
    if (!salidas) return [];
    const texto = filtros.texto.trim().toLowerCase();
    return salidas.filter((s) => {
      if (texto && !s.titulo.toLowerCase().includes(texto)) return false;
      if (filtros.creadorId && s.creado_por !== filtros.creadorId) return false;
      if (filtros.desde && s.fecha < filtros.desde) return false;
      if (filtros.hasta && s.fecha > filtros.hasta) return false;
      return true;
    });
  }, [salidas, filtros]);

  const totalFiltrado = salidasFiltradas.reduce((acc, s) => acc + s.costo_total, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Link href={`/grupos/${grupoId}/salidas/nueva`}>
          <Button className="w-full sm:w-auto">
            <IconPlus size={16} stroke={1.75} />
            Nueva salida
          </Button>
        </Link>
        <Button
          variant={vista === 'calendario' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setVista(vista === 'lista' ? 'calendario' : 'lista')}
          className="ml-auto"
        >
          <IconCalendar size={16} stroke={1.75} />
          {vista === 'lista' ? 'Ver calendario' : 'Ver lista'}
        </Button>
      </div>

      {error && <Alert>{error}</Alert>}

      {salidas === null && !error ? (
        <div className="flex justify-center py-10 text-muted">
          <Spinner />
        </div>
      ) : salidas && salidas.length === 0 ? (
        <EmptyState titulo="Sin salidas todavía" descripcion="Registra la primera salida del grupo." />
      ) : (
        <>
          <SalidasFiltros valor={filtros} onChange={setFiltros} miembros={miembros} />
          <ResumenTotalSalidas cantidad={salidasFiltradas.length} total={totalFiltrado} />

          {salidasFiltradas.length === 0 ? (
            <EmptyState titulo="Ninguna salida coincide con el filtro" />
          ) : vista === 'calendario' ? (
            <CalendarioSalidas salidas={salidasFiltradas} />
          ) : (
            <div className="space-y-2">
              {salidasFiltradas.map((salida) => (
                <SalidaListItem key={salida.id} salida={salida} nombreCreador={nombreDe(salida.creado_por)} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
