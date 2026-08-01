import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'w-full min-h-11 rounded-lg border border-border-soft bg-surface/40 px-3 py-2 text-sm text-foreground',
        'placeholder:text-muted transition-all focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25',
        'disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}
