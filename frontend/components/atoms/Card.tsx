import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border-soft bg-surface/70 p-4 shadow-sm shadow-black/20 backdrop-blur-sm sm:p-5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
