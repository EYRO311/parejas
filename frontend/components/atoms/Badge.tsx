import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface BadgeProps {
  children: ReactNode;
  tone?: 'neutral' | 'primary' | 'success' | 'danger' | 'accent';
  className?: string;
}

const TONES: Record<NonNullable<BadgeProps['tone']>, string> = {
  neutral: 'bg-border-soft/60 text-foreground ring-1 ring-inset ring-white/5',
  primary: 'bg-primary/15 text-primary ring-1 ring-inset ring-primary/20',
  success: 'bg-success-soft text-success ring-1 ring-inset ring-success/20',
  danger: 'bg-danger-soft text-danger ring-1 ring-inset ring-danger/20',
  accent: 'bg-accent/15 text-accent ring-1 ring-inset ring-accent/25',
};

export function Badge({ children, tone = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
