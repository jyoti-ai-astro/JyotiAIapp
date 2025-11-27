/**
 * Input Component
 * 
 * Phase 3 — Section 1: UI Atoms (Inputs & Fields)
 * Phase 3 — Section 7: Component States & Variants (Inputs)
 * Phase 3 — Section 13: Form & Input Accessibility
 */

'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { colors, states, durations, easing } from '@/styles/tokens';
import type { JyotiComponentProps } from './types';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    Omit<JyotiComponentProps, 'motion'> {
  /** Input label */
  label?: string;
  
  /** Error message */
  error?: string;
  
  /** Success state */
  success?: boolean;
  
  /** Helper text */
  helperText?: string;
  
  /** Icon to display on the left */
  iconLeft?: React.ReactNode;
  
  /** Icon to display on the right */
  iconRight?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      success,
      helperText,
      iconLeft,
      iconRight,
      disabled = false,
      className,
      size = 'md',
      variant = 'dark',
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value.length > 0);
      props.onChange?.(e);
    };
    
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };
    
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      props.onBlur?.(e);
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
      'text-white placeholder:text-white/40',
      'transition-all duration-240',
      'focus:outline-none',
      'disabled:opacity-40 disabled:cursor-not-allowed',
      sizeClasses[size],
      iconLeft && 'pl-10',
      iconRight && 'pr-10',
      // Border states
      !error && !success && !isFocused && 'border-white/20',
      !error && !success && isFocused && 'border-[#F4CE65] shadow-[0_0_12px_rgba(244,206,101,0.3)]',
      error && 'border-[#e85555] shadow-[0_0_8px_rgba(232,85,85,0.3)]',
      success && 'border-[#42d87c] shadow-[0_0_8px_rgba(66,216,124,0.3)]',
      className
    );
    
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={props.id}
            className={cn(
              'block text-sm font-medium text-white/90 mb-2',
              error && 'text-[#e85555]',
              success && 'text-[#42d87c]'
            )}
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {/* Left icon */}
          {iconLeft && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none">
              {iconLeft}
            </div>
          )}
          
          <motion.input
            ref={(node) => {
              if (typeof ref === 'function') ref(node);
              else if (ref) ref.current = node;
              inputRef.current = node;
            }}
            className={baseClasses}
            disabled={disabled}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={
              error || helperText
                ? `${props.id || 'input'}-${error ? 'error' : 'helper'}`
                : undefined
            }
            {...props}
            animate={
              error
                ? {
                    x: [0, -4, 4, -4, 4, 0],
                  }
                : {}
            }
            transition={{
              duration: 0.3,
              ease: 'easeInOut',
            }}
          />
          
          {/* Right icon */}
          {iconRight && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none">
              {iconRight}
            </div>
          )}
          
          {/* Focus mandala effect */}
          {isFocused && !error && !success && (
            <motion.div
              className="absolute inset-0 rounded-xl pointer-events-none"
              style={{
                background: 'radial-gradient(circle at center, rgba(244,206,101,0.1) 0%, transparent 70%)',
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            />
          )}
          
          {/* Success chakra spark */}
          {success && (
            <motion.div
              className="absolute right-3 top-1/2 -translate-y-1/2"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <div className="w-2 h-2 bg-[#42d87c] rounded-full shadow-[0_0_8px_#42d87c]" />
            </motion.div>
          )}
        </div>
        
        {/* Underline animation */}
        {isFocused && !error && !success && (
          <motion.div
            className="h-0.5 bg-gradient-to-r from-transparent via-[#F4CE65] to-transparent mt-1"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        )}
        
        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.p
              id={`${props.id || 'input'}-error`}
              className="mt-1 text-sm text-[#e85555]"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              role="alert"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
        
        {/* Helper text */}
        {helperText && !error && (
          <p
            id={`${props.id || 'input'}-helper`}
            className="mt-1 text-sm text-white/60"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
