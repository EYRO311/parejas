import { Avatar } from '@/components/atoms/Avatar';
import { Input } from '@/components/atoms/Input';
import { Badge } from '@/components/atoms/Badge';

interface RepartoRowProps {
  nombreUsuario: string;
  monto: number;
  liquidado: boolean;
  editable: boolean;
  onCambiarMonto?: (monto: number) => void;
  onToggleLiquidado?: () => void;
}

export function RepartoRow({
  nombreUsuario,
  monto,
  liquidado,
  editable,
  onCambiarMonto,
  onToggleLiquidado,
}: RepartoRowProps) {
  return (
    <div className="flex items-center gap-3 py-2">
      <Avatar nombre={nombreUsuario} size="sm" />
      <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{nombreUsuario}</p>

      {editable ? (
        <Input
          type="number"
          min={0}
          step="0.01"
          value={monto}
          onChange={(e) => onCambiarMonto?.(Number(e.target.value))}
          className="w-28 text-right"
        />
      ) : (
        <span className="w-28 text-right text-sm tabular-nums text-foreground">{monto.toFixed(2)}</span>
      )}

      <button type="button" onClick={onToggleLiquidado}>
        <Badge tone={liquidado ? 'success' : 'neutral'}>{liquidado ? 'Liquidado' : 'Pendiente'}</Badge>
      </button>
    </div>
  );
}
