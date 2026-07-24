import { Suspense } from 'react';
import { LoginForm } from '@/components/organisms/LoginForm';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <p className="text-xl font-semibold text-foreground">Finanzas en Pareja</p>
          <p className="text-sm text-muted">Entra para ver tus grupos</p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
