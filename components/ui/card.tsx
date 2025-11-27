/**
 * Card Component
 * 
 * Phase 3 — Section 1: UI Atoms (Cards)
 * Phase 3 — Section 7: Component States & Variants (Cards)
 * Reference: Hover lift, Soft shadow bloom, Content reveal fade
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { JyotiComponentProps } from './types';

export interface CardProps extends JyotiComponentProps, React.HTMLAttributes<HTMLDivElement> {
  /** Card variant */
  variant?: 'base' | 'glow' | 'gradient' | 'minimal' | 'interactive' | 'icon' | 'energy-pulse';
  
  /** Make card clickable */
  clickable?: boolean;
  
  /** Show hover effects */
  hoverable?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'base',
      size = 'md',
      disabled = false,
      className,
      children,
      clickable = false,
      hoverable = true,
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      base: cn(
        'bg-white/8 backdrop-blur-md',
        'border border-white/10',
        'shadow-[0_10px_25px_rgba(0,0,0,0.25)]',
        hoverable && 'hover:shadow-[0_15px_35px_rgba(0,0,0,0.35)]',
        hoverable && 'hover:border-white/20'
      ),
      glow: cn(
        'bg-white/10 backdrop-blur-md',
        'border border-[#7B2CBF]/30',
        'shadow-[0_0_20px_rgba(123,44,191,0.3)]',
        hoverable && 'hover:shadow-[0_0_30px_rgba(123,44,191,0.5)]',
        hoverable && 'hover:border-[#7B2CBF]/50'
      ),
      gradient: cn(
        'bg-gradient-to-br from-[#1D0F3A]/80 via-[#493B8A]/60 to-[#7F5AD7]/40',
        'backdrop-blur-md',
        'border border-white/10',
        'shadow-[0_10px_25px_rgba(0,0,0,0.3)]',
        hoverable && 'hover:shadow-[0_15px_35px_rgba(0,0,0,0.4)]'
      ),
      minimal: cn(
        'bg-transparent',
        'border border-white/5',
        hoverable && 'hover:border-white/10'
      ),
      interactive: cn(
        'bg-white/8 backdrop-blur-md',
        'border border-white/10',
        'cursor-pointer',
        'transition-all duration-300',
        hoverable && 'hover:bg-white/12',
        hoverable && 'hover:border-[#F4CE65]/30',
        hoverable && 'hover:shadow-[0_0_20px_rgba(244,206,101,0.2)]',
        'active:scale-[0.98]'
      ),
      icon: cn(
        'bg-white/5 backdrop-blur-sm',
        'border border-white/10',
        'flex flex-col items-center justify-center',
        'text-center',
        hoverable && 'hover:bg-white/8',
        hoverable && 'hover:border-white/20'
      ),
      'energy-pulse': cn(
        'bg-white/8 backdrop-blur-md',
        'border border-[#9D4EDD]/30',
        'shadow-[0_0_15px_rgba(157,78,221,0.2)]',
        hoverable && 'hover:shadow-[0_0_25px_rgba(157,78,221,0.4)]',
        hoverable && 'hover:border-[#9D4EDD]/50'
      ),
    };
    
    const sizeClasses = {
      sm: 'p-3 rounded-lg',
      md: 'p-4 rounded-xl',
      lg: 'p-6 rounded-2xl',
      xl: 'p-8 rounded-3xl',
    };
    
    const baseClasses = cn(
      'relative overflow-hidden',
      'transition-all duration-300',
      variantClasses[variant],
      sizeClasses[size],
      disabled && 'opacity-40 pointer-events-none',
      clickable && 'cursor-pointer',
      className
    );
    
    return (
      <motion.div
        ref={ref}
        className={baseClasses}
        whileHover={hoverable && !disabled ? { y: -4, scale: 1.01 } : undefined}
        whileTap={clickable && !disabled ? { scale: 0.98 } : undefined}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 25,
        }}
        {...props}
      >
        {/* Ambient gradient shift on hover */}
        {hoverable && variant === 'gradient' && (
          <motion.div
            className="absolute inset-0 opacity-0 hover:opacity-100 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at center, rgba(244,206,101,0.1) 0%, transparent 70%)',
            }}
            transition={{ duration: 0.3 }}
          />
        )}
        
        {/* Energy pulse effect */}
        {variant === 'energy-pulse' && hoverable && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at center, rgba(157,78,221,0.2) 0%, transparent 70%)',
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
        
        {/* Content */}
        <div className="relative z-10">{children}</div>
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

// Card sub-components (for compatibility with shadcn/ui pattern)
const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-2xl font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-white/60', className)}
      {...props}
    />
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
    <div
      ref={ref}
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
