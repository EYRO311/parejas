'use client';

import type { ReactNode } from 'react';
import { IconAlertTriangle } from '@tabler/icons-react';
import { Button } from '@/components/atoms/Button';

interface ConfirmDialogProps {
  open: boolean;
  titulo: string;
  descripcion?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'primary';
  cargando?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  titulo,
  descripcion,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  tone = 'primary',
  cargando,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-titulo"
        className="dialog-pop w-full max-w-sm rounded-2xl border border-border-soft bg-surface p-5 shadow-xl shadow-black/40"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          {tone === 'danger' && (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-danger-soft text-danger">
              <IconAlertTriangle size={18} stroke={1.75} />
            </span>
          )}
          <div className="min-w-0">
            <p id="confirm-dialog-titulo" className="text-base font-semibold text-foreground">
              {titulo}
            </p>
            {descripcion && <p className="mt-1.5 text-sm text-muted">{descripcion}</p>}
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onCancel} disabled={cargando}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === 'danger' ? 'danger' : 'primary'}
            className="flex-1"
            onClick={onConfirm}
            disabled={cargando}
          >
            {cargando ? 'Espera...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
