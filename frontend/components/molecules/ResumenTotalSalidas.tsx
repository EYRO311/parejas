import { Card } from '@/components/atoms/Card';
import { MoneyText } from '@/components/atoms/MoneyText';

interface ResumenTotalSalidasProps {
  cantidad: number;
  total: number;
}

export function ResumenTotalSalidas({ cantidad, total }: ResumenTotalSalidasProps) {
  return (
    <Card className="flex items-center justify-between">
      <div>
        <p className="text-xs text-muted">
          {cantidad === 1 ? '1 salida' : `${cantidad} salidas`}
        </p>
        <p className="text-xs text-muted">Suma del total mostrado</p>
      </div>
      <MoneyText monto={total} className="text-xl font-semibold" />
    </Card>
  );
}
