/**
 * Icon Component
 * 
 * Phase 3 — Section 11: ICONOGRAPHY SYSTEM
 * Phase 3 — Section 1: UI Atoms (Iconography)
 * Reference: Icon Families, Stroke/Size/Spacing Rules, Icon Animation System
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { JyotiComponentProps } from './types';

export interface IconProps extends Omit<JyotiComponentProps, 'motion'>, React.SVGProps<SVGSVGElement> {
  /** Icon variant */
  variant?: 'default' | 'astro' | 'chakra' | 'planet' | 'element' | 'festival' | 'arrow' | 'mandala' | 'rune';
  
  /** Icon size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  /** Animate on hover */
  animated?: boolean;
  
  /** Show orbital float animation */
  orbital?: boolean;
  
  /** Show light pulse */
  pulse?: boolean;
  
  /** Rotate on hover */
  rotateOnHover?: boolean;
}

const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  (
    {
      variant = 'default',
      size = 'md',
      animated = false,
      orbital = false,
      pulse = false,
      rotateOnHover = false,
      className,
      children,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      xs: 'w-3 h-3',
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
      xl: 'w-8 h-8',
    };
    
    const variantClasses = {
      default: 'text-white/80',
      astro: 'text-white/90',
      chakra: 'text-[#FDD835]',
      planet: 'text-white',
      element: 'text-white/70',
      festival: 'text-[#F4CE65]',
      arrow: 'text-white/60',
      mandala: 'text-white/80',
      rune: 'text-white/70',
    };
    
    const baseClasses = cn(
      'flex-shrink-0',
      'transition-colors duration-200',
      sizeClasses[size],
      variantClasses[variant],
      disabled && 'opacity-40',
      className
    );
    
    return (
      <motion.svg
        ref={ref}
        className={baseClasses}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        whileHover={
          animated && !disabled
            ? {
                scale: 1.1,
                rotate: rotateOnHover ? 15 : 0,
              }
            : undefined
        }
        animate={
          orbital
            ? {
                y: [0, -4, 0, 4, 0],
                x: [0, 2, 0, -2, 0],
              }
            : pulse
            ? {
                opacity: [0.7, 1, 0.7],
              }
            : undefined
        }
        transition={
          orbital || pulse
            ? {
                duration: 3,
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
      </motion.svg>
    );
  }
);

Icon.displayName = 'Icon';

export { Icon };
