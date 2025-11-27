/**
 * RadioGroup Molecule
 * 
 * Phase 3 — Section 1: UI Atoms (Radio Buttons)
 * Phase 3 — Section 2: FORM MOLECULES
 * Reference: Chakra pulses when selected, Perfect for Rashi selection
 */

'use client';

import React, { useState, createContext, useContext } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { JyotiComponentProps } from '@/components/ui/types';

interface RadioGroupContextValue {
  value: string;
  onChange: (value: string) => void;
  name: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export interface RadioGroupProps extends Omit<JyotiComponentProps, 'motion'> {
  /** Selected value */
  value?: string;
  
  /** Default value */
  defaultValue?: string;
  
  /** Group name */
  name?: string;
  
  /** Label */
  label?: string;
  
  /** Orientation */
  orientation?: 'horizontal' | 'vertical';
  
  /** Change handler */
  onValueChange?: (value: string) => void;
  
  /** Custom class */
  className?: string;
}

export interface RadioItemProps {
  /** Item value */
  value: string;
  
  /** Item label */
  label: string;
  
  /** Disabled state */
  disabled?: boolean;
  
  /** Custom class */
  className?: string;
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      value: controlledValue,
      defaultValue,
      name: nameProp,
      label,
      orientation = 'vertical',
      disabled = false,
      size = 'md',
      className,
      onValueChange,
      children,
      ...props
    },
    ref
  ) => {
    const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue || '');
    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : uncontrolledValue;
    const name = nameProp || `radio-group-${Math.random().toString(36).substr(2, 9)}`;
    
    const handleChange = (newValue: string) => {
      if (disabled) return;
      if (!isControlled) {
        setUncontrolledValue(newValue);
      }
      onValueChange?.(newValue);
    };
    
    const baseClasses = cn(
      'flex',
      orientation === 'horizontal' ? 'flex-row gap-4' : 'flex-col gap-3',
      className
    );
    
    return (
      <RadioGroupContext.Provider
        value={{
          value,
          onChange: handleChange,
          name,
          disabled,
          size,
        }}
      >
        <div ref={ref} className="w-full space-y-2" {...props}>
          {label && (
            <label className="block text-sm font-medium text-white/90">
              {label}
            </label>
          )}
          <div className={baseClasses}>{children}</div>
        </div>
      </RadioGroupContext.Provider>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';

const RadioItem = React.forwardRef<HTMLButtonElement, RadioItemProps>(
  ({ value, label, disabled: itemDisabled, className }, ref) => {
    const context = useContext(RadioGroupContext);
    
    if (!context) {
      throw new Error('RadioItem must be used within RadioGroup');
    }
    
    const { value: selectedValue, onChange, name, disabled: groupDisabled, size } = context;
    const disabled = groupDisabled || itemDisabled;
    const checked = selectedValue === value;
    
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
      xl: 'w-7 h-7',
    };
    
    const dotSizeClasses = {
      sm: 'w-2 h-2',
      md: 'w-2.5 h-2.5',
      lg: 'w-3 h-3',
      xl: 'w-3.5 h-3.5',
    };
    
    const baseClasses = cn(
      'relative flex items-center justify-center',
      'border-2 rounded-full',
      'transition-all duration-200',
      'focus:outline-none focus:ring-3 focus:ring-[#8ab4f8] focus:ring-offset-2',
      'disabled:opacity-40 disabled:cursor-not-allowed',
      sizeClasses[size],
      checked
        ? 'border-[#F4CE65] bg-transparent'
        : 'border-white/30 bg-transparent',
      className
    );
    
    return (
      <div className="flex items-center gap-3">
        <motion.button
          ref={ref}
          type="button"
          role="radio"
          aria-checked={checked}
          aria-label={label}
          disabled={disabled}
          onClick={() => !disabled && onChange(value)}
          className={baseClasses}
          whileHover={!disabled ? { scale: 1.1 } : undefined}
          whileTap={!disabled ? { scale: 0.95 } : undefined}
          animate={
            checked
              ? {
                  boxShadow: [
                    '0 0 0px rgba(244,206,101,0)',
                    '0 0 16px rgba(244,206,101,0.6)',
                    '0 0 12px rgba(244,206,101,0.4)',
                  ],
                }
              : {}
          }
          transition={{ duration: 0.4, repeat: checked ? Infinity : 0, repeatDelay: 1 }}
        >
          {/* Chakra pulse effect */}
          {checked && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(244,206,101,0.3) 0%, transparent 70%)',
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )}
          
          {/* Radio dot */}
          {checked && (
            <motion.div
              className={cn(
                'absolute rounded-full bg-[#F4CE65]',
                dotSizeClasses[size]
              )}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 20,
              }}
            />
          )}
        </motion.button>
        
        <label
          className={cn(
            'text-sm font-medium text-white/90 cursor-pointer',
            disabled && 'opacity-40 cursor-not-allowed'
          )}
          onClick={() => !disabled && onChange(value)}
        >
          {label}
        </label>
      </div>
    );
  }
);

RadioItem.displayName = 'RadioItem';

export { RadioGroup, RadioItem };

