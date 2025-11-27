/**
 * InputGroup Molecule
 * 
 * Phase 3 — Section 2: FORM MOLECULES
 * Group of related inputs with shared styling
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Group label */
  label?: string;
  
  /** Orientation */
  orientation?: 'horizontal' | 'vertical';
  
  /** Gap between inputs */
  gap?: 'sm' | 'md' | 'lg';
}

const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  (
    {
      label,
      orientation = 'vertical',
      gap = 'md',
      className,
      children,
      ...props
    },
    ref
  ) => {
    const gapClasses = {
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
    };
    
    const baseClasses = cn(
      'w-full',
      orientation === 'horizontal' ? 'flex items-end' : 'flex flex-col',
      gapClasses[gap],
      className
    );
    
    return (
      <motion.div
        ref={ref}
        className={baseClasses}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        {...props}
      >
        {label && (
          <label className="block text-sm font-medium text-white/90 mb-2">
            {label}
          </label>
        )}
        {children}
      </motion.div>
    );
  }
);

InputGroup.displayName = 'InputGroup';

export { InputGroup };

