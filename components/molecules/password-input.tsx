/**
 * PasswordInput Molecule
 * 
 * Phase 3 — Section 2: FORM MOLECULES
 * Password input with show/hide toggle
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input, InputProps } from '@/components/ui/input';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export interface PasswordInputProps extends Omit<InputProps, 'type'> {
  /** Show password strength indicator */
  showStrength?: boolean;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      showStrength = false,
      className,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value);
      props.onChange?.(e);
    };
    
    const getPasswordStrength = (pwd: string) => {
      if (pwd.length === 0) return { strength: 0, label: '', color: '' };
      if (pwd.length < 6) return { strength: 1, label: 'Weak', color: '#e85555' };
      if (pwd.length < 10) return { strength: 2, label: 'Medium', color: '#f7c948' };
      if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) {
        return { strength: 3, label: 'Strong', color: '#42d87c' };
      }
      return { strength: 2, label: 'Medium', color: '#f7c948' };
    };
    
    const strength = showStrength ? getPasswordStrength(password) : null;
    
    return (
      <div className="w-full">
        <div className="relative">
          <Input
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            className={cn('pr-12', className)}
            onChange={handleChange}
            {...props}
          />
          
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <AnimatePresence mode="wait">
              {showPassword ? (
                <motion.div
                  key="hide"
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon size="sm" className="w-5 h-5">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </Icon>
                </motion.div>
              ) : (
                <motion.div
                  key="show"
                  initial={{ opacity: 0, rotate: 90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: -90 }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon size="sm" className="w-5 h-5">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </Icon>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
        
        {/* Password strength indicator */}
        {showStrength && strength && password.length > 0 && (
          <motion.div
            className="mt-2 space-y-1"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: strength.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(strength.strength / 3) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className="text-xs text-white/60" style={{ color: strength.color }}>
                {strength.label}
              </span>
            </div>
          </motion.div>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };

