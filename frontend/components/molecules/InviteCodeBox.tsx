'use client';

import { useState } from 'react';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import type { InvitacionGrupo } from '@/lib/types';

const ESTADO_TONE: Record<InvitacionGrupo['estado'], 'success' | 'neutral' | 'danger'> = {
  activo: 'success',
  usado: 'neutral',
  expirado: 'danger',
};

const ESTADO_LABEL: Record<InvitacionGrupo['estado'], string> = {
  activo: 'Activo',
  usado: 'Usado',
  expirado: 'Expirado',
};

export function InviteCodeBox({ invitacion }: { invitacion: InvitacionGrupo }) {
  const [copiado, setCopiado] = useState(false);

  const copiar = async () => {
    await navigator.clipboard.writeText(invitacion.codigo);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1500);
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border-soft bg-surface px-4 py-3">
      <span className="flex-1 font-mono text-lg tracking-[0.3em] text-foreground">{invitacion.codigo}</span>
      <Badge tone={ESTADO_TONE[invitacion.estado]}>{ESTADO_LABEL[invitacion.estado]}</Badge>
      {invitacion.estado === 'activo' && (
        <Button variant="outline" size="sm" onClick={copiar}>
          {copiado ? 'Copiado' : 'Copiar'}
        </Button>
      )}
    </div>
  );
}
