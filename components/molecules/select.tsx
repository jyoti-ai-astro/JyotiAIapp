/**
 * Select Molecule
 * 
 * Phase 3 — Section 2: FORM MOLECULES (Select Block)
 * Reference: Mandala border, Soft glow, Dropdown grows with fade
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/icon';
import type { JyotiComponentProps } from '@/components/ui/types';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<JyotiComponentProps, 'motion'> {
  /** Select options */
  options: SelectOption[];
  
  /** Selected value */
  value?: string;
  
  /** Default value */
  defaultValue?: string;
  
  /** Placeholder text */
  placeholder?: string;
  
  /** Label */
  label?: string;
  
  /** Error message */
  error?: string;
  
  /** Helper text */
  helperText?: string;
  
  /** Disabled state */
  disabled?: boolean;
  
  /** Change handler */
  onValueChange?: (value: string) => void;
  
  /** Custom class */
  className?: string;
}

const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      options,
      value,
      defaultValue,
      placeholder = 'Select an option',
      label,
      error,
      helperText,
      disabled = false,
      size = 'md',
      className,
      onValueChange,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(value || defaultValue || '');
    const selectRef = useRef<HTMLDivElement>(null);
    
    const selectedOption = options.find(opt => opt.value === selectedValue);
    
    useEffect(() => {
      if (value !== undefined) {
        setSelectedValue(value);
      }
    }, [value]);
    
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      
      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [isOpen]);
    
    const handleSelect = (optionValue: string) => {
      if (options.find(opt => opt.value === optionValue)?.disabled) return;
      setSelectedValue(optionValue);
      setIsOpen(false);
      onValueChange?.(optionValue);
    };
    
    const sizeClasses = {
      sm: 'h-9 px-3 text-sm',
      md: 'h-12 px-4 text-base',
      lg: 'h-14 px-5 text-lg',
      xl: 'h-16 px-6 text-xl',
    };
    
    const baseClasses = cn(
      'w-full',
      'bg-white/8 backdrop-blur-md',
      'border rounded-xl',
      'text-white',
      'transition-all duration-240',
      'focus:outline-none',
      'disabled:opacity-40 disabled:cursor-not-allowed',
      sizeClasses[size],
      !error && !isOpen && 'border-white/20',
      !error && isOpen && 'border-[#F4CE65] shadow-[0_0_12px_rgba(244,206,101,0.3)]',
      error && 'border-[#e85555] shadow-[0_0_8px_rgba(232,85,85,0.3)]',
      className
    );
    
    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="block text-sm font-medium text-white/90">
            {label}
          </label>
        )}
        
        <div ref={selectRef} className="relative">
          <motion.button
            ref={ref}
            type="button"
            className={baseClasses}
            disabled={disabled}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-invalid={error ? 'true' : undefined}
            whileHover={!disabled ? { scale: 1.01 } : undefined}
            whileTap={!disabled ? { scale: 0.99 } : undefined}
            {...props}
          >
            <div className="flex items-center justify-between">
              <span className={cn(
                selectedValue ? 'text-white' : 'text-white/40'
              )}>
                {selectedOption?.label || placeholder}
              </span>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <Icon size="sm" className="w-4 h-4">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </Icon>
              </motion.div>
            </div>
          </motion.button>
          
          {/* Mandala border effect when open */}
          {isOpen && (
            <motion.div
              className="absolute inset-0 rounded-xl pointer-events-none"
              style={{
                border: '2px solid rgba(244,206,101,0.3)',
                background: 'radial-gradient(circle at center, rgba(244,206,101,0.1) 0%, transparent 70%)',
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            />
          )}
          
          {/* Dropdown */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                className="absolute z-50 w-full mt-2 bg-[#1A1F3C] backdrop-blur-md border border-white/20 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.5)] overflow-hidden"
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <div className="max-h-60 overflow-y-auto">
                  {options.map((option, index) => (
                    <motion.button
                      key={option.value}
                      type="button"
                      className={cn(
                        'w-full px-4 py-3 text-left text-white/90',
                        'hover:bg-white/10 hover:text-white',
                        'transition-colors duration-150',
                        'disabled:opacity-40 disabled:cursor-not-allowed',
                        selectedValue === option.value && 'bg-white/10 text-white',
                        option.disabled && 'opacity-40 cursor-not-allowed'
                      )}
                      onClick={() => handleSelect(option.value)}
                      disabled={option.disabled}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      whileHover={!option.disabled ? { x: 4 } : undefined}
                    >
                      {option.label}
                      {selectedValue === option.value && (
                        <motion.span
                          className="ml-2 text-[#F4CE65]"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 200 }}
                        >
                          ✓
                        </motion.span>
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {error && (
          <motion.p
            className="text-sm text-[#e85555]"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            role="alert"
          >
            {error}
          </motion.p>
        )}
        
        {helperText && !error && (
          <p className="text-sm text-white/60">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };

