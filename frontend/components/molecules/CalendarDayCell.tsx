import Link from 'next/link';
import { cn } from '@/lib/cn';
import type { Salida } from '@/lib/types';

interface CalendarDayCellProps {
  dia: number | null;
  esHoy: boolean;
  salidas: Salida[];
}

const MAX_VISIBLES = 2;

export function CalendarDayCell({ dia, esHoy, salidas }: CalendarDayCellProps) {
  if (dia === null) {
    return <div className="min-h-20 rounded-lg" />;
  }

  const visibles = salidas.slice(0, MAX_VISIBLES);
  const restantes = salidas.length - visibles.length;

  return (
    <div
      className={cn(
        'flex min-h-20 flex-col gap-1 rounded-lg border p-1.5 sm:p-2',
        salidas.length > 0 ? 'border-primary/30 bg-primary/5' : 'border-border-soft/60'
      )}
    >
      <span className={cn('text-xs font-medium', esHoy ? 'text-primary' : 'text-muted')}>{dia}</span>
      <div className="flex flex-col gap-1">
        {visibles.map((salida) => (
          <Link
            key={salida.id}
            href={`/grupos/${salida.grupo_id}/salidas/${salida.id}`}
            className="truncate rounded bg-primary/15 px-1 py-0.5 text-[10px] font-medium text-foreground hover:bg-primary/25"
            title={salida.titulo}
          >
            {salida.titulo}
          </Link>
        ))}
        {restantes > 0 && <span className="text-[10px] text-muted">+{restantes} más</span>}
      </div>
    </div>
  );
}
