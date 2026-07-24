import { PresupuestosList } from '@/components/organisms/PresupuestosList';

export default async function PresupuestoPage({ params }: { params: Promise<{ grupoId: string }> }) {
  const { grupoId } = await params;
  return <PresupuestosList grupoId={grupoId} />;
}
