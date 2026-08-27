'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

type CardMotionProps = Omit<HTMLMotionProps<'div'>, 'ref'>;

export interface CardProps extends CardMotionProps {
  variant?: 'base' | 'glow' | 'gradient' | 'minimal' | 'interactive' | 'icon' | 'energy-pulse';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  clickable?: boolean;
  hoverable?: boolean;
}

const variantClasses: Record<NonNullable<CardProps['variant']>, string> = {
  base: 'border-border bg-card text-card-foreground shadow-[0_8px_24px_rgba(24,33,63,0.08)]',
  glow: 'border-jyoti-gold/45 bg-card text-card-foreground shadow-[0_10px_28px_rgba(231,184,78,0.14)]',
  gradient:
    'border-border bg-[linear-gradient(135deg,hsl(var(--card))_0%,hsl(var(--surface-sunken))_100%)] text-card-foreground shadow-[0_8px_24px_rgba(24,33,63,0.08)]',
  minimal: 'border-transparent bg-transparent text-card-foreground shadow-none',
  interactive:
    'cursor-pointer border-border bg-card text-card-foreground shadow-[0_8px_24px_rgba(24,33,63,0.08)] hover:border-saffron',
  icon: 'border-border bg-card text-card-foreground text-center shadow-[0_8px_24px_rgba(24,33,63,0.08)]',
  'energy-pulse':
    'border-jyoti-lotus/30 bg-card text-card-foreground shadow-[0_8px_24px_rgba(24,33,63,0.08)]',
};

const sizeClasses: Record<NonNullable<CardProps['size']>, string> = {
  sm: 'rounded-lg p-3',
  md: 'rounded-lg p-4',
  lg: 'rounded-xl p-6',
  xl: 'rounded-xl p-8',
};

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'base',
      size = 'md',
      disabled,
      className,
      children,
      clickable,
      hoverable = false,
      ...props
    },
    ref
  ) => (
    <motion.div
      ref={ref}
      className={cn(
        'relative overflow-hidden border transition-colors duration-200',
        variantClasses[variant],
        sizeClasses[size],
        disabled && 'pointer-events-none opacity-50',
        clickable && 'cursor-pointer',
        className
      )}
      whileHover={hoverable && !disabled ? { y: -2 } : undefined}
      whileTap={clickable && !disabled ? { scale: 0.99 } : undefined}
      {...props}
    >
      {children}
    </motion.div>
  )
);

Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('font-heading text-2xl font-semibold leading-tight text-primary', className)}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm leading-6 text-muted-foreground', className)} {...props} />
  )
);
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
