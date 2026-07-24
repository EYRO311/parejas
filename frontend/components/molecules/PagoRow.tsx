import { Avatar } from '@/components/atoms/Avatar';
import { MoneyText } from '@/components/atoms/MoneyText';
import { Button } from '@/components/atoms/Button';
import type { PagoSalida } from '@/lib/types';

interface PagoRowProps {
  pago: PagoSalida;
  nombreUsuario: string;
  moneda: string;
  esPropio: boolean;
  onEliminar?: () => void;
}

export function PagoRow({ pago, nombreUsuario, moneda, esPropio, onEliminar }: PagoRowProps) {
  return (
    <div className="flex items-center gap-3 py-2">
      <Avatar nombre={nombreUsuario} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{nombreUsuario}</p>
        {pago.banco && <p className="truncate text-xs text-muted">{pago.banco}</p>}
      </div>
      <MoneyText monto={pago.monto} moneda={moneda} className="font-medium" />
      {esPropio && onEliminar && (
        <Button variant="ghost" size="sm" onClick={onEliminar} aria-label="Borrar pago">
          ✕
        </Button>
      )}
    </div>
  );
}
