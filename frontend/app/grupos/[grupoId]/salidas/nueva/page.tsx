import { SalidaForm } from '@/components/organisms/SalidaForm';

export default async function NuevaSalidaPage({ params }: { params: Promise<{ grupoId: string }> }) {
  const { grupoId } = await params;
  return <SalidaForm grupoId={grupoId} />;
}
