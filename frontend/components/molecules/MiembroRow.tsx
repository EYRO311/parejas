import { Avatar } from '@/components/atoms/Avatar';
import { Badge } from '@/components/atoms/Badge';
import type { MiembroGrupo } from '@/lib/types';

interface MiembroRowProps {
  miembro: MiembroGrupo;
  acciones?: React.ReactNode;
}

export function MiembroRow({ miembro, acciones }: MiembroRowProps) {
  const nombre = miembro.usuarios?.nombre ?? miembro.usuarios?.email ?? 'Miembro';

  return (
    <div className="flex items-center gap-3 py-2">
      <Avatar nombre={nombre} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{nombre}</p>
        {miembro.usuarios?.email && <p className="truncate text-xs text-muted">{miembro.usuarios.email}</p>}
      </div>
      <Badge tone={miembro.rol === 'admin' ? 'accent' : 'neutral'}>
        {miembro.rol === 'admin' ? 'Admin' : 'Miembro'}
      </Badge>
      {acciones}
    </div>
  );
}
