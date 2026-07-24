import { Card } from '@/components/atoms/Card';
import { Input } from '@/components/atoms/Input';
import { FormField } from '@/components/molecules/FormField';
import { ChipGroup } from '@/components/molecules/ChipGroup';
import type { MiembroGrupo } from '@/lib/types';

export interface FiltrosSalidasValor {
  texto: string;
  creadorId: string;
  desde: string;
  hasta: string;
}

interface SalidasFiltrosProps {
  valor: FiltrosSalidasValor;
  onChange: (valor: FiltrosSalidasValor) => void;
  miembros: MiembroGrupo[];
}

export function SalidasFiltros({ valor, onChange, miembros }: SalidasFiltrosProps) {
  const set = (cambios: Partial<FiltrosSalidasValor>) => onChange({ ...valor, ...cambios });

  return (
    <Card className="space-y-3">
      <FormField label="Nombre" htmlFor="filtro-nombre">
        <Input
          id="filtro-nombre"
          placeholder="Buscar..."
          value={valor.texto}
          onChange={(e) => set({ texto: e.target.value })}
        />
      </FormField>

      {miembros.length > 0 && (
        <div>
          <p className="mb-1 text-sm font-medium text-foreground">Creador</p>
          <ChipGroup
            options={miembros.map((m) => ({
              value: m.usuario_id,
              label: m.usuarios?.nombre ?? m.usuarios?.email ?? 'Miembro',
            }))}
            value={valor.creadorId || null}
            onChange={(v) => set({ creadorId: v ?? '' })}
            allowClear
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Desde" htmlFor="filtro-desde">
          <Input id="filtro-desde" type="date" value={valor.desde} onChange={(e) => set({ desde: e.target.value })} />
        </FormField>
        <FormField label="Hasta" htmlFor="filtro-hasta">
          <Input id="filtro-hasta" type="date" value={valor.hasta} onChange={(e) => set({ hasta: e.target.value })} />
        </FormField>
      </div>
    </Card>
  );
}
