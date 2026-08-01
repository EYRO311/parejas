import Link from 'next/link';
import { Card } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import type { Grupo } from '@/lib/types';

const TIPO_LABEL: Record<Grupo['tipo'], string> = {
  pareja: 'Pareja',
  familia: 'Familia',
  roommates: 'Roommates',
};

export function GrupoCard({ grupo }: { grupo: Grupo }) {
  return (
    <Link href={`/grupos/${grupo.id}`} className="block">
      <Card className="transition-all hover:border-primary/40 hover:bg-surface active:scale-[0.98]">
        <div className="flex items-center justify-between gap-2">
          <p className="font-medium text-foreground">{grupo.nombre}</p>
          <Badge tone="primary">{TIPO_LABEL[grupo.tipo]}</Badge>
        </div>
      </Card>
    </Link>
  );
}
