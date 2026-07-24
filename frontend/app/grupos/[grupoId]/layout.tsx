import { AppShell } from '@/components/layout/AppShell';
import { navGrupo } from '@/components/layout/navPresets';

export default async function GrupoLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ grupoId: string }>;
}) {
  const { grupoId } = await params;

  return (
    <AppShell titulo="Grupo" nav={navGrupo(grupoId)} backHref="/grupos">
      {children}
    </AppShell>
  );
}
