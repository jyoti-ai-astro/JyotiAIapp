'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'default'
    | 'secondary'
    | 'outline'
    | 'destructive'
    | 'success'
    | 'warning'
    | 'error'
    | 'info'
    | 'premium'
    | 'guru'
    | 'verified'
    | 'chakra';
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  clickable?: boolean;
  disabled?: boolean;
}

const variantClasses: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'border-transparent bg-primary text-primary-foreground',
  secondary: 'border-transparent bg-secondary text-secondary-foreground',
  outline: 'border-border bg-transparent text-primary',
  destructive: 'border-transparent bg-danger text-white',
  success: 'border-success/25 bg-success/10 text-success',
  warning: 'border-warning/25 bg-warning/10 text-warning',
  error: 'border-danger/25 bg-danger/10 text-danger',
  info: 'border-primary/20 bg-primary/10 text-primary',
  premium: 'border-jyoti-gold/35 bg-jyoti-gold/15 text-primary',
  guru: 'border-saffron/35 bg-saffron/12 text-primary',
  verified: 'border-success/25 bg-success/10 text-success',
  chakra: 'border-jyoti-lotus/30 bg-jyoti-lotus/10 text-jyoti-lotus',
};

const sizeClasses: Record<NonNullable<BadgeProps['size']>, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'default',
      size = 'md',
      pulse,
      clickable,
      disabled,
      className,
      ...props
    },
    ref
  ) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-full border font-medium',
        'transition-colors duration-200',
        variantClasses[variant],
        sizeClasses[size],
        pulse && 'animate-pulse',
        clickable && !disabled && 'cursor-pointer hover:border-saffron',
        disabled && 'pointer-events-none opacity-50',
        className
      )}
      {...props}
    />
  )
);

Badge.displayName = 'Badge';

export { Badge };
