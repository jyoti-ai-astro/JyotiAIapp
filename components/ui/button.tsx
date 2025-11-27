/**
 * Button Component
 * 
 * Phase 3 — Section 1: UI Atoms (Buttons)
 * Phase 3 — Section 7: Component States & Variants (Buttons)
 * Phase 3 — Section 12: Motion Design System (Micro-Interactions)
 * Phase 3 — Section 15: Component API Standards
 */

'use client';

import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';
import { colors, states, durations, easing } from '@/styles/tokens';
import type { JyotiComponentProps } from './types';

export interface ButtonProps extends Omit<JyotiComponentProps, 'motion'>, React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'ghost' | 'text' | 'icon' | 'floating';
  
  /** Icon to display on the left */
  iconLeft?: React.ReactNode;
  
  /** Icon to display on the right */
  iconRight?: React.ReactNode;
  
  /** Show loading spinner */
  loading?: boolean;
  
  /** Full width button */
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      disabled = false,
      loading = false,
      className,
      children,
      iconLeft,
      iconRight,
      fullWidth = false,
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    
    // Magnetic effect for floating/icon buttons
    const springConfig = { stiffness: 120, damping: 18 };
    const x = useSpring(mouseX, springConfig);
    const y = useSpring(mouseY, springConfig);
    
    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!buttonRef.current || variant !== 'floating') return;
      const rect = buttonRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      mouseX.set((e.clientX - centerX) * 0.1);
      mouseY.set((e.clientY - centerY) * 0.1);
    };
    
    const handleMouseLeave = () => {
      mouseX.set(0);
      mouseY.set(0);
      setIsHovered(false);
    };
    
    const isDisabled = disabled || loading;
    
    // Size classes
    const sizeClasses = {
      sm: 'h-9 px-3 text-sm',
      md: 'h-12 px-6 text-base',
      lg: 'h-14 px-8 text-lg',
      xl: 'h-16 px-10 text-xl',
    };
    
    // Variant classes
    const variantClasses = {
      primary: cn(
        'relative overflow-hidden',
        'bg-gradient-to-r from-[#6A32FF] via-[#B43CFF] to-[#FF7AE0]',
        'backdrop-blur-sm bg-opacity-40',
        'border border-[#F4CE65]/30',
        'text-white font-medium',
        'shadow-[0_0_20px_rgba(123,44,191,0.3)]',
        'hover:shadow-[0_0_30px_rgba(123,44,191,0.5)]',
        'hover:scale-[1.02]',
        'active:scale-[0.98]',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none',
        'transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#8ab4f8] focus-visible:ring-offset-3'
      ),
      secondary: cn(
        'relative',
        'bg-transparent',
        'border border-[#3E4E8C]',
        'text-[#E0E7FF]',
        'hover:border-[#4e9df3] hover:text-white',
        'hover:shadow-[0_0_12px_rgba(78,157,243,0.4)]',
        'active:scale-[0.98]',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        'transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#8ab4f8] focus-visible:ring-offset-3'
      ),
      ghost: cn(
        'relative',
        'bg-transparent',
        'text-white/70',
        'hover:text-white',
        'hover:bg-white/5',
        'active:scale-[0.98]',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        'transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#8ab4f8] focus-visible:ring-offset-3'
      ),
      text: cn(
        'relative',
        'bg-transparent',
        'text-white/70',
        'hover:text-white',
        'underline-offset-4',
        'hover:underline',
        'active:scale-[0.98]',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        'transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#8ab4f8] focus-visible:ring-offset-3'
      ),
      icon: cn(
        'relative',
        'bg-white/5',
        'border border-white/10',
        'text-white',
        'hover:bg-white/10',
        'hover:border-white/20',
        'hover:shadow-[0_0_12px_rgba(255,255,255,0.2)]',
        'active:scale-[0.95]',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        'transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#8ab4f8] focus-visible:ring-offset-3',
        'rounded-lg'
      ),
      floating: cn(
        'relative',
        'bg-gradient-to-br from-[#7B2CBF] to-[#9D4EDD]',
        'text-white',
        'shadow-[0_8px_24px_rgba(123,44,191,0.4)]',
        'hover:shadow-[0_12px_32px_rgba(123,44,191,0.6)]',
        'active:scale-[0.95]',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        'transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#8ab4f8] focus-visible:ring-offset-3',
        'rounded-full'
      ),
    };
    
    const baseClasses = cn(
      'inline-flex items-center justify-center gap-2',
      'rounded-xl',
      'font-medium',
      'cursor-pointer',
      'select-none',
      sizeClasses[size],
      variantClasses[variant],
      fullWidth && 'w-full',
      isDisabled && 'pointer-events-none',
      className
    );
    
    return (
      <motion.button
        ref={(node) => {
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
          buttonRef.current = node;
        }}
        className={baseClasses}
        disabled={isDisabled}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseMove={handleMouseMove}
        style={
          variant === 'floating'
            ? {
                x: isHovered ? x : 0,
                y: isHovered ? y : 0,
              }
            : undefined
        }
        whileHover={!isDisabled ? { scale: variant === 'floating' ? 1.05 : 1.02 } : undefined}
        whileTap={!isDisabled ? { scale: 0.98 } : undefined}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 20,
        }}
        {...props}
      >
        {/* Shine sweep effect for primary button */}
        {variant === 'primary' && isHovered && !isDisabled && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{
              duration: 0.6,
              ease: 'easeInOut',
            }}
          />
        )}
        
        {/* Ripple effect on click */}
        {variant === 'primary' && isPressed && !isDisabled && (
          <motion.div
            className="absolute inset-0 rounded-xl bg-white/30"
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
        )}
        
        {/* Loading spinner */}
        {loading && (
          <motion.div
            className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full"
            animate={{ rotate: 360 }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        )}
        
        {/* Icon left */}
        {iconLeft && !loading && (
          <span className="flex-shrink-0">{iconLeft}</span>
        )}
        
        {/* Button text */}
        {children && (
          <span className={cn(loading && 'opacity-70')}>{children}</span>
        )}
        
        {/* Icon right */}
        {iconRight && !loading && (
          <span className="flex-shrink-0">{iconRight}</span>
        )}
        
        {/* Particle burst for floating button */}
        {variant === 'floating' && isPressed && !isDisabled && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                initial={{
                  x: 0,
                  y: 0,
                  opacity: 1,
                  scale: 1,
                }}
                animate={{
                  x: [0, (i - 1) * 20],
                  y: [0, -20],
                  opacity: [1, 0],
                  scale: [1, 0],
                }}
                transition={{
                  duration: 0.4,
                  delay: i * 0.05,
                }}
              />
            ))}
          </>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
