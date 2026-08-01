import Link from 'next/link';
import { MoneyText } from '@/components/atoms/MoneyText';
import { formatFechaCorta } from '@/lib/format';
import type { Salida } from '@/lib/types';

interface SalidaListItemProps {
  salida: Salida;
  nombreCreador?: string;
}

export function SalidaListItem({ salida, nombreCreador }: SalidaListItemProps) {
  return (
    <Link
      href={`/grupos/${salida.grupo_id}/salidas/${salida.id}`}
      className="flex items-center justify-between gap-3 rounded-2xl border border-border-soft bg-surface/70 px-4 py-3.5 shadow-sm shadow-black/20 backdrop-blur-sm transition-all hover:border-primary/40 hover:bg-surface active:scale-[0.98]"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{salida.titulo}</p>
        <p className="text-xs text-muted">
          {formatFechaCorta(salida.fecha)}
          {nombreCreador && <> · {nombreCreador}</>}
        </p>
      </div>
      <MoneyText monto={salida.costo_total} moneda={salida.moneda} className="shrink-0 font-medium" />
    </Link>
  );
}
