import { PresupuestoDetalle } from '@/components/organisms/PresupuestoDetalle';

export default async function PresupuestoDetallePage({
  params,
}: {
  params: Promise<{ presupuestoId: string }>;
}) {
  const { presupuestoId } = await params;
  return <PresupuestoDetalle presupuestoId={presupuestoId} />;
}
