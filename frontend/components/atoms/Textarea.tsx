import type { TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        'w-full rounded-lg border border-border-soft bg-surface/40 px-3 py-2 text-sm text-foreground resize-none',
        'placeholder:text-muted transition-all focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25',
        'disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}
