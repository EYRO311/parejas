import { formatMoney } from '@/lib/format';
import { cn } from '@/lib/cn';

interface MoneyTextProps {
  monto: number;
  moneda?: string;
  tone?: 'default' | 'muted' | 'danger' | 'success';
  className?: string;
}

const TONES: Record<NonNullable<MoneyTextProps['tone']>, string> = {
  default: 'text-foreground',
  muted: 'text-muted',
  danger: 'text-danger',
  success: 'text-success',
};

export function MoneyText({ monto, moneda = 'MXN', tone = 'default', className }: MoneyTextProps) {
  return <span className={cn('tabular-nums', TONES[tone], className)}>{formatMoney(monto, moneda)}</span>;
}
