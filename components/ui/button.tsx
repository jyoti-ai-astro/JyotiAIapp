'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type ButtonMotionProps = Omit<HTMLMotionProps<'button'>, 'ref' | 'size' | 'children'>;

export interface ButtonProps extends ButtonMotionProps {
  variant?:
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'destructive'
    | 'icon'
    | 'default'
    | 'text'
    | 'floating';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon';
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  children?: React.ReactNode;
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'border-transparent bg-primary text-primary-foreground shadow-[0_8px_20px_rgba(24,33,63,0.16)] hover:bg-primary/90',
  secondary: 'border-border bg-secondary text-secondary-foreground hover:bg-secondary/80',
  outline: 'border-border bg-surface-raised text-primary hover:border-saffron hover:bg-surface-sunken',
  ghost: 'border-transparent bg-transparent text-primary hover:bg-secondary',
  destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90',
  icon: 'border-border bg-surface-raised text-primary hover:border-saffron hover:bg-surface-sunken',
  default:
    'border-transparent bg-primary text-primary-foreground shadow-[0_8px_20px_rgba(24,33,63,0.16)] hover:bg-primary/90',
  text: 'border-transparent bg-transparent text-primary underline-offset-4 hover:underline',
  floating:
    'rounded-full border-transparent bg-primary text-primary-foreground shadow-[0_14px_34px_rgba(24,33,63,0.2)] hover:bg-primary/90',
};

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'min-h-10 px-3 text-sm',
  md: 'min-h-11 px-5 text-sm',
  lg: 'min-h-12 px-6 text-base',
  xl: 'min-h-14 px-8 text-lg',
  icon: 'h-11 w-11 p-0',
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = variant === 'icon' ? 'icon' : 'md',
      disabled,
      loading,
      className,
      children,
      iconLeft,
      iconRight,
      fullWidth,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg border font-medium',
          'transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:pointer-events-none disabled:opacity-50',
          'select-none',
          sizeClasses[size],
          variantClasses[variant],
          fullWidth && 'w-full',
          className
        )}
        whileTap={!isDisabled ? { scale: 0.98 } : undefined}
        {...props}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : iconLeft}
        {children}
        {iconRight}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
