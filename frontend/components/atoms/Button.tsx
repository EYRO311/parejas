import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md';
}

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 ' +
  'active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background';

const VARIANTS: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-primary text-primary-foreground shadow-md shadow-primary/25 hover:opacity-90 hover:shadow-lg hover:shadow-primary/30',
  secondary: 'border border-border-soft bg-surface/50 text-foreground hover:border-foreground/40 hover:bg-surface',
  outline: 'border border-border-soft text-foreground hover:border-foreground/40 hover:bg-surface/50',
  danger: 'bg-danger text-white shadow-md shadow-danger/25 hover:opacity-90',
  ghost: 'text-foreground hover:text-primary hover:bg-primary/10',
};

const SIZES: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'min-h-9 px-3 py-1.5 text-xs',
  md: 'min-h-11 px-4 py-2 text-sm',
};

export function Button({ children, variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  return (
    <button className={cn(BASE, VARIANTS[variant], SIZES[size], className)} {...props}>
      {children}
    </button>
  );
}
