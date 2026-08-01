import type { ReactNode } from 'react';
import { IconAlertCircle, IconCircleCheck } from '@tabler/icons-react';
import { cn } from '@/lib/cn';

interface AlertProps {
  children: ReactNode;
  tone?: 'danger' | 'success';
  className?: string;
}

const TONES: Record<NonNullable<AlertProps['tone']>, string> = {
  danger: 'bg-danger-soft text-danger ring-1 ring-inset ring-danger/20',
  success: 'bg-success-soft text-success ring-1 ring-inset ring-success/20',
};

const ICONS: Record<NonNullable<AlertProps['tone']>, ReactNode> = {
  danger: <IconAlertCircle size={16} stroke={2} className="mt-0.5 shrink-0" />,
  success: <IconCircleCheck size={16} stroke={2} className="mt-0.5 shrink-0" />,
};

export function Alert({ children, tone = 'danger', className }: AlertProps) {
  return (
    <div role="alert" className={cn('flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm', TONES[tone], className)}>
      {ICONS[tone]}
      <p>{children}</p>
    </div>
  );
}
