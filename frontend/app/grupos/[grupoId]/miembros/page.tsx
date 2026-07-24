import { MiembrosList } from '@/components/organisms/MiembrosList';
import { InvitacionesPanel } from '@/components/organisms/InvitacionesPanel';

export default async function MiembrosPage({ params }: { params: Promise<{ grupoId: string }> }) {
  const { grupoId } = await params;
  return (
    <div className="space-y-4">
      <MiembrosList grupoId={grupoId} />
      <InvitacionesPanel grupoId={grupoId} />
    </div>
  );
}
