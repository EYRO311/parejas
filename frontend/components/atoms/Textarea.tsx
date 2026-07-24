import type { TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        'w-full rounded-md border border-border-soft bg-transparent px-3 py-2 text-sm text-foreground resize-none',
        'placeholder:text-muted transition-colors focus:outline-none focus:border-primary',
        'disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}
