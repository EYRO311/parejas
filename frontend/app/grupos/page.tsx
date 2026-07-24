import { AppShell } from '@/components/layout/AppShell';
import { navGlobal } from '@/components/layout/navPresets';
import { GruposList } from '@/components/organisms/GruposList';
import { CrearGrupoForm } from '@/components/organisms/CrearGrupoForm';
import { UnirseGrupoForm } from '@/components/organisms/UnirseGrupoForm';

export default function GruposPage() {
  return (
    <AppShell titulo="Tus grupos" nav={navGlobal()}>
      <div className="space-y-6">
        <GruposList />
        <div className="grid gap-4 sm:grid-cols-2">
          <CrearGrupoForm />
          <UnirseGrupoForm />
        </div>
      </div>
    </AppShell>
  );
}
