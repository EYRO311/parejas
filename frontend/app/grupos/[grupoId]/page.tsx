import { GrupoResumen } from '@/components/organisms/GrupoResumen';

export default async function GrupoPage({ params }: { params: Promise<{ grupoId: string }> }) {
  const { grupoId } = await params;
  return <GrupoResumen grupoId={grupoId} />;
}
