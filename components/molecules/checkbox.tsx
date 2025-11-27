/**
 * Checkbox Molecule
 * 
 * Phase 3 — Section 1: UI Atoms (Checkbox)
 * Phase 3 — Section 2: FORM MOLECULES
 * Reference: Uses R3F mini-check animation (tiny orbit), Glow when active
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/icon';
import type { JyotiComponentProps } from '@/components/ui/types';

export interface CheckboxProps extends Omit<JyotiComponentProps, 'motion'> {
  /** Checked state */
  checked?: boolean;
  
  /** Default checked state */
  defaultChecked?: boolean;
  
  /** Indeterminate state */
  indeterminate?: boolean;
  
  /** Label */
  label?: string;
  
  /** Disabled state */
  disabled?: boolean;
  
  /** Change handler */
  onCheckedChange?: (checked: boolean) => void;
  
  /** Custom class */
  className?: string;
}

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  (
    {
      checked: controlledChecked,
      defaultChecked = false,
      indeterminate = false,
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
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
      xl: 'w-7 h-7',
    };
    
    const iconSizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5',
      xl: 'w-6 h-6',
    };
    
    const baseClasses = cn(
      'relative flex items-center justify-center',
      'border-2 rounded-md',
      'transition-all duration-200',
      'focus:outline-none focus:ring-3 focus:ring-[#8ab4f8] focus:ring-offset-2',
      'disabled:opacity-40 disabled:cursor-not-allowed',
      sizeClasses[size],
      checked || indeterminate
        ? 'bg-gradient-to-br from-[#7B2CBF] to-[#9D4EDD] border-[#9D4EDD]'
        : 'bg-transparent border-white/30',
      className
    );
    
    return (
      <div className="flex items-center gap-3">
        <motion.button
          ref={ref}
          type="button"
          role="checkbox"
          aria-checked={indeterminate ? 'mixed' : checked}
          aria-label={label || 'Checkbox'}
          disabled={disabled}
          onClick={handleToggle}
          className={baseClasses}
          whileHover={!disabled ? { scale: 1.05 } : undefined}
          whileTap={!disabled ? { scale: 0.95 } : undefined}
          animate={
            checked || indeterminate
              ? {
                  boxShadow: [
                    '0 0 0px rgba(157,78,221,0)',
                    '0 0 12px rgba(157,78,221,0.5)',
                    '0 0 8px rgba(157,78,221,0.3)',
                  ],
                }
              : {}
          }
          transition={{ duration: 0.3 }}
          {...props}
        >
          {/* Check icon */}
          <AnimatePresence>
            {checked && !indeterminate && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 20,
                }}
              >
                <Icon size="sm" className={cn('text-white', iconSizeClasses[size])}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </Icon>
              </motion.div>
            )}
            
            {/* Indeterminate icon */}
            {indeterminate && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 20,
                }}
              >
                <div className={cn('bg-white rounded-sm', iconSizeClasses[size])} />
              </motion.div>
            )}
          </AnimatePresence>
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

Checkbox.displayName = 'Checkbox';

export { Checkbox };

