import type { ReactNode } from 'react';

interface EmptyStateProps {
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
}

export function EmptyState({ titulo, descripcion, accion }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border-soft py-10 text-center">
      <p className="text-sm font-medium text-foreground">{titulo}</p>
      {descripcion && <p className="max-w-xs text-sm text-muted">{descripcion}</p>}
      {accion}
    </div>
  );
}
