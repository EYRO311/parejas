import { Suspense } from 'react';
import { ActualizarPasswordForm } from '@/components/organisms/ActualizarPasswordForm';
import { Card } from '@/components/atoms/Card';

export default function ActualizarPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <p className="font-handwriting text-4xl leading-tight text-foreground">Nueva contraseña</p>
          <p className="text-sm text-muted">Elige una nueva contraseña para tu cuenta.</p>
        </div>
        <Card>
          <Suspense>
            <ActualizarPasswordForm />
          </Suspense>
        </Card>
      </div>
    </main>
  );
}
