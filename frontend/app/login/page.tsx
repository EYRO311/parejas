import { Suspense } from 'react';
import { LoginForm } from '@/components/organisms/LoginForm';
import { Card } from '@/components/atoms/Card';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-lg font-bold text-white shadow-lg shadow-primary/30">
            FP
          </span>
          <div>
            <p className="font-handwriting text-4xl leading-tight text-foreground">Finanzas en Pareja</p>
            <p className="text-sm text-muted">Entra para ver tus grupos</p>
          </div>
        </div>
        <Card>
          <Suspense>
            <LoginForm />
          </Suspense>
        </Card>
      </div>
    </main>
  );
}
