/**
 * FormField Molecule
 * 
 * Phase 3 — Section 2: FORM MOLECULES (Input + Label + Helper Group)
 * Reference: Label, Input, HelperText, FocusOrbit effect
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Input, InputProps } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface FormFieldProps extends Omit<InputProps, 'label' | 'helperText'> {
  /** Field label */
  label: string;
  
  /** Helper text shown below input */
  helperText?: string;
  
  /** Whether field is required */
  required?: boolean;
  
  /** Custom label class */
  labelClassName?: string;
}

const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      label,
      helperText,
      required = false,
      labelClassName,
      error,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full space-y-2">
        <motion.label
          htmlFor={props.id}
          className={cn(
            'block text-sm font-medium text-white/90',
            error && 'text-[#e85555]',
            labelClassName
          )}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {label}
          {required && (
            <span className="ml-1 text-[#e85555]" aria-label="required">
              *
            </span>
          )}
        </motion.label>
        
        <Input
          ref={ref}
          label={undefined}
          helperText={undefined}
          error={error}
          className={className}
          aria-required={required}
          {...props}
        />
        
        {helperText && !error && (
          <motion.p
            className="text-sm text-white/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.1 }}
          >
            {helperText}
          </motion.p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

export { FormField };

