/**
 * Badge/Tag/Chip Component
 * 
 * Phase 3 — Section 1: UI Atoms (Badges + Tags + Chips)
 * Phase 3 — Section 7: Component States & Variants (Status Badges)
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { JyotiComponentProps } from './types';

export interface BadgeProps extends JyotiComponentProps, React.HTMLAttributes<HTMLSpanElement> {
  /** Badge variant */
  variant?: 'premium' | 'guru' | 'verified' | 'chakra' | 'default' | 'success' | 'warning' | 'error' | 'info';
  
  /** Badge size */
  size?: 'sm' | 'md' | 'lg';
  
  /** Show pulse animation */
  pulse?: boolean;
  
  /** Make badge clickable */
  clickable?: boolean;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'default',
      size = 'md',
      pulse = false,
      clickable = false,
      className,
      children,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      premium: cn(
        'bg-gradient-to-r from-[#F4CE65]/20 to-[#F4CE65]/10',
        'border border-[#F4CE65]/40',
        'text-[#F4CE65]',
        'shadow-[0_0_12px_rgba(244,206,101,0.3)]'
      ),
      guru: cn(
        'bg-gradient-to-r from-[#9D4EDD]/20 to-[#7B2CBF]/20',
        'border border-[#9D4EDD]/40',
        'text-[#9D4EDD]',
        'shadow-[0_0_12px_rgba(157,78,221,0.3)]'
      ),
      verified: cn(
        'bg-[#1E88E5]/20',
        'border border-[#1E88E5]/40',
        'text-[#4e9df3]',
        'shadow-[0_0_12px_rgba(78,157,243,0.3)]'
      ),
      chakra: cn(
        'bg-gradient-to-r from-[#FDD835]/20 to-[#43A047]/20',
        'border border-[#FDD835]/40',
        'text-[#FDD835]',
        'shadow-[0_0_12px_rgba(253,216,53,0.3)]'
      ),
      default: cn(
        'bg-white/10',
        'border border-white/20',
        'text-white/80'
      ),
      success: cn(
        'bg-[#42d87c]/20',
        'border border-[#42d87c]/40',
        'text-[#42d87c]',
        'shadow-[0_0_8px_rgba(66,216,124,0.3)]'
      ),
      warning: cn(
        'bg-[#f7c948]/20',
        'border border-[#f7c948]/40',
        'text-[#f7c948]',
        'shadow-[0_0_8px_rgba(247,201,72,0.3)]'
      ),
      error: cn(
        'bg-[#e85555]/20',
        'border border-[#e85555]/40',
        'text-[#e85555]',
        'shadow-[0_0_8px_rgba(232,85,85,0.3)]'
      ),
      info: cn(
        'bg-[#4e9df3]/20',
        'border border-[#4e9df3]/40',
        'text-[#4e9df3]',
        'shadow-[0_0_8px_rgba(78,157,243,0.3)]'
      ),
    };
    
    const sizeClasses = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-3 py-1 text-sm',
      lg: 'px-4 py-1.5 text-base',
    };
    
    const baseClasses = cn(
      'inline-flex items-center justify-center',
      'rounded-full',
      'font-medium',
      'backdrop-blur-sm',
      'transition-all duration-200',
      variantClasses[variant],
      sizeClasses[size],
      clickable && !disabled && 'cursor-pointer hover:scale-105',
      disabled && 'opacity-40 pointer-events-none',
      className
    );
    
    return (
      <motion.span
        ref={ref}
        className={baseClasses}
        whileHover={clickable && !disabled ? { scale: 1.05 } : undefined}
        whileTap={clickable && !disabled ? { scale: 0.95 } : undefined}
        animate={
          pulse
            ? {
                scale: [1, 1.05, 1],
              }
            : undefined
        }
        transition={
          pulse
            ? {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }
            : {
                type: 'spring',
                stiffness: 300,
                damping: 20,
              }
        }
        {...props}
      >
        {children}
      </motion.span>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
