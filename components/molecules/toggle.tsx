/**
 * Toggle Molecule
 * 
 * Phase 3 — Section 1: UI Atoms (Toggle Switches)
 * Phase 3 — Section 2: FORM MOLECULES
 * Reference: Sound ON/OFF, Motion ON/OFF, Theme Toggle, Emit soft pulse when activated
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { JyotiComponentProps } from '@/components/ui/types';

export interface ToggleProps extends Omit<JyotiComponentProps, 'motion'> {
  /** Toggle variant */
  variant?: 'default' | 'sound' | 'motion' | 'theme';
  
  /** Checked state */
  checked?: boolean;
  
  /** Default checked state */
  defaultChecked?: boolean;
  
  /** Label */
  label?: string;
  
  /** Disabled state */
  disabled?: boolean;
  
  /** Change handler */
  onCheckedChange?: (checked: boolean) => void;
  
  /** Custom class */
  className?: string;
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  (
    {
      variant = 'default',
      checked: controlledChecked,
      defaultChecked = false,
      label,
      disabled = false,
      size = 'md',
      className,
      onCheckedChange,
      ...props
    },
    ref
  ) => {
    const [uncontrolledChecked, setUncontrolledChecked] = useState(defaultChecked);
    const isControlled = controlledChecked !== undefined;
    const checked = isControlled ? controlledChecked : uncontrolledChecked;
    
    const handleToggle = () => {
      if (disabled) return;
      const newChecked = !checked;
      if (!isControlled) {
        setUncontrolledChecked(newChecked);
      }
      onCheckedChange?.(newChecked);
    };
    
    const sizeClasses = {
      sm: 'w-9 h-5',
      md: 'w-11 h-6',
      lg: 'w-14 h-7',
      xl: 'w-16 h-8',
    };
    
    const thumbSizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
      xl: 'w-7 h-7',
    };
    
    const variantClasses = {
      default: checked
        ? 'bg-gradient-to-r from-[#7B2CBF] to-[#9D4EDD]'
        : 'bg-white/20',
      sound: checked
        ? 'bg-gradient-to-r from-[#4e9df3] to-[#4ef3c3]'
        : 'bg-white/20',
      motion: checked
        ? 'bg-gradient-to-r from-[#F4CE65] to-[#FDD835]'
        : 'bg-white/20',
      theme: checked
        ? 'bg-gradient-to-r from-[#9D4EDD] to-[#7B2CBF]'
        : 'bg-white/20',
    };
    
    const baseClasses = cn(
      'relative inline-flex items-center rounded-full transition-colors duration-300',
      'focus:outline-none focus:ring-3 focus:ring-[#8ab4f8] focus:ring-offset-2',
      'disabled:opacity-40 disabled:cursor-not-allowed',
      sizeClasses[size],
      variantClasses[variant],
      className
    );
    
    return (
      <div className="flex items-center gap-3">
        <motion.button
          ref={ref}
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={label || 'Toggle'}
          disabled={disabled}
          onClick={handleToggle}
          className={baseClasses}
          whileTap={!disabled ? { scale: 0.95 } : undefined}
          {...props}
        >
          {/* Pulse effect when activated */}
          {checked && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: variantClasses[variant],
                boxShadow: `0 0 20px ${variant === 'default' ? '#9D4EDD' : variant === 'sound' ? '#4ef3c3' : variant === 'motion' ? '#FDD835' : '#9D4EDD'}40`,
              }}
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                repeatDelay: 2,
              }}
            />
          )}
          
          {/* Thumb */}
          <motion.div
            className={cn(
              'absolute rounded-full bg-white shadow-lg',
              thumbSizeClasses[size]
            )}
            animate={{
              x: checked
                ? size === 'sm'
                  ? 16
                  : size === 'md'
                  ? 20
                  : size === 'lg'
                  ? 28
                  : 32
                : 2,
            }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 30,
            }}
          />
        </motion.button>
        
        {label && (
          <label
            className={cn(
              'text-sm font-medium text-white/90 cursor-pointer',
              disabled && 'opacity-40 cursor-not-allowed'
            )}
            onClick={() => !disabled && handleToggle()}
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Toggle.displayName = 'Toggle';

export { Toggle };

