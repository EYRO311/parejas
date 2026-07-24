import { CategoriasList } from '@/components/organisms/CategoriasList';

export default async function CategoriasPage({ params }: { params: Promise<{ grupoId: string }> }) {
  const { grupoId } = await params;
  return <CategoriasList grupoId={grupoId} />;
}
