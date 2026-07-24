import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn('rounded-xl border border-border-soft bg-surface p-4 sm:p-5', className)}
      {...props}
    >
      {children}
    </div>
  );
}
