import Link from 'next/link';
import { Badge } from '@/components/atoms/Badge';
import { MoneyText } from '@/components/atoms/MoneyText';
import { formatFecha } from '@/lib/format';
import type { PresupuestoQuincenal } from '@/lib/types';

export function PresupuestoListItem({ presupuesto, grupoId }: { presupuesto: PresupuestoQuincenal; grupoId: string }) {
  return (
    <Link
      href={`/grupos/${grupoId}/presupuesto/${presupuesto.id}`}
      className="flex items-center justify-between gap-3 rounded-2xl border border-border-soft bg-surface/70 px-4 py-3.5 shadow-sm shadow-black/20 backdrop-blur-sm transition-all hover:border-primary/40 hover:bg-surface active:scale-[0.98]"
    >
      <div>
        <p className="text-sm font-medium text-foreground">
          {formatFecha(presupuesto.quincena_inicio)} — {formatFecha(presupuesto.quincena_fin)}
        </p>
        <Badge tone={presupuesto.estado === 'activo' ? 'success' : 'neutral'}>
          {presupuesto.estado === 'activo' ? 'Activo' : 'Cerrado'}
        </Badge>
      </div>
      <MoneyText monto={presupuesto.monto_objetivo_total} className="font-medium" />
    </Link>
  );
}
