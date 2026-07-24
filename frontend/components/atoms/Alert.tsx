import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface AlertProps {
  children: ReactNode;
  tone?: 'danger' | 'success';
  className?: string;
}

const TONES: Record<NonNullable<AlertProps['tone']>, string> = {
  danger: 'bg-danger-soft text-danger',
  success: 'bg-success-soft text-success',
};

export function Alert({ children, tone = 'danger', className }: AlertProps) {
  return (
    <p role="alert" className={cn('rounded-xl px-3 py-2 text-sm', TONES[tone], className)}>
      {children}
    </p>
  );
}
