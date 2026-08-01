import { GastosPorUsuario } from '@/components/organisms/GastosPorUsuario';

export default async function GastosPage({ params }: { params: Promise<{ grupoId: string }> }) {
  const { grupoId } = await params;
  return <GastosPorUsuario grupoId={grupoId} />;
}
