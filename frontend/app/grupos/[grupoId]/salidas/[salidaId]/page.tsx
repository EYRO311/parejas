import { SalidaDetalle } from '@/components/organisms/SalidaDetalle';

export default async function SalidaDetallePage({
  params,
}: {
  params: Promise<{ grupoId: string; salidaId: string }>;
}) {
  const { grupoId, salidaId } = await params;
  return <SalidaDetalle grupoId={grupoId} salidaId={salidaId} />;
}
