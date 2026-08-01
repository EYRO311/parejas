import { cn } from '@/lib/cn';

interface ProgressBarProps {
  valor: number;
  maximo: number;
  className?: string;
}

export function ProgressBar({ valor, maximo, className }: ProgressBarProps) {
  const porcentaje = maximo > 0 ? Math.min(100, Math.round((valor / maximo) * 100)) : 0;
  const sobrepasado = maximo > 0 && valor > maximo;

  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-border-soft/60', className)}>
      <div
        className={cn(
          'h-full rounded-full transition-all duration-500 ease-out',
          sobrepasado ? 'bg-danger' : 'bg-gradient-to-r from-primary to-accent'
        )}
        style={{ width: `${porcentaje}%` }}
        role="progressbar"
        aria-valuenow={valor}
        aria-valuemax={maximo}
      />
    </div>
  );
}
