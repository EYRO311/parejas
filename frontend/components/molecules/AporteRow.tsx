import { Avatar } from '@/components/atoms/Avatar';
import { MoneyText } from '@/components/atoms/MoneyText';
import { ProgressBar } from '@/components/atoms/ProgressBar';
import type { AportePresupuesto } from '@/lib/types';

export function AporteRow({ aporte, nombreUsuario }: { aporte: AportePresupuesto; nombreUsuario: string }) {
  const sobrepasado = aporte.monto_aportado > aporte.monto_comprometido;

  return (
    <div className="space-y-1.5 py-2">
      <div className="flex items-center gap-3">
        <Avatar nombre={nombreUsuario} size="sm" />
        <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{nombreUsuario}</p>
        <MoneyText monto={aporte.monto_aportado} tone={sobrepasado ? 'danger' : 'default'} className="font-medium" />
        <span className="text-xs text-muted">/ <MoneyText monto={aporte.monto_comprometido} tone="muted" /></span>
      </div>
      <ProgressBar valor={aporte.monto_aportado} maximo={aporte.monto_comprometido} />
    </div>
  );
}
