import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'w-full rounded-md border border-border-soft bg-transparent px-3 py-2 text-sm text-foreground',
        'placeholder:text-muted transition-colors focus:outline-none focus:border-primary',
        'disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}
