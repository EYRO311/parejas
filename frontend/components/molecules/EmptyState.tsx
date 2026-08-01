import type { ReactNode } from 'react';
import { IconInbox } from '@tabler/icons-react';

interface EmptyStateProps {
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
  icon?: ReactNode;
}

export function EmptyState({ titulo, descripcion, accion, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border-soft px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon ?? <IconInbox size={22} stroke={1.5} />}
      </div>
      <p className="text-sm font-medium text-foreground">{titulo}</p>
      {descripcion && <p className="max-w-xs text-sm text-muted">{descripcion}</p>}
      {accion}
    </div>
  );
}
