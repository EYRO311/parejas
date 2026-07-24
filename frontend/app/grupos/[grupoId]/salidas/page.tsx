import { SalidasList } from '@/components/organisms/SalidasList';

export default async function SalidasPage({ params }: { params: Promise<{ grupoId: string }> }) {
  const { grupoId } = await params;
  return <SalidasList grupoId={grupoId} />;
}
