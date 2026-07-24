'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { CalendarDayCell } from '@/components/molecules/CalendarDayCell';
import { obtenerCeldasMes, nombreMes } from '@/lib/calendario';
import { hoyISO } from '@/lib/format';
import type { Salida } from '@/lib/types';

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export function CalendarioSalidas({ salidas }: { salidas: Salida[] }) {
  const hoy = hoyISO();
  const ahora = new Date();
  const [anio, setAnio] = useState(ahora.getFullYear());
  const [mes, setMes] = useState(ahora.getMonth());

  const celdas = useMemo(() => obtenerCeldasMes(anio, mes), [anio, mes]);

  const salidasPorDia = useMemo(() => {
    const mapa = new Map<string, Salida[]>();
    for (const salida of salidas) {
      const lista = mapa.get(salida.fecha) ?? [];
      lista.push(salida);
      mapa.set(salida.fecha, lista);
    }
    return mapa;
  }, [salidas]);

  const irMesAnterior = () => {
    if (mes === 0) {
      setAnio((a) => a - 1);
      setMes(11);
    } else {
      setMes((m) => m - 1);
    }
  };

  const irMesSiguiente = () => {
    if (mes === 11) {
      setAnio((a) => a + 1);
      setMes(0);
    } else {
      setMes((m) => m + 1);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={irMesAnterior} aria-label="Mes anterior">
          <IconChevronLeft size={16} stroke={1.75} />
        </Button>
        <p className="text-sm font-medium text-foreground">{nombreMes(anio, mes)}</p>
        <Button variant="ghost" size="sm" onClick={irMesSiguiente} aria-label="Mes siguiente">
          <IconChevronRight size={16} stroke={1.75} />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {DIAS_SEMANA.map((d) => (
          <span key={d} className="text-[10px] font-medium text-muted">
            {d}
          </span>
        ))}
        {celdas.map((celda, i) => (
          <CalendarDayCell
            key={celda.iso ?? `vacio-${i}`}
            dia={celda.dia}
            esHoy={celda.iso === hoy}
            salidas={celda.iso ? (salidasPorDia.get(celda.iso) ?? []) : []}
          />
        ))}
      </div>
    </div>
  );
}
