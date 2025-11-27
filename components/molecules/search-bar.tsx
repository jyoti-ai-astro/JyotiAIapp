/**
 * SearchBar Molecule
 * 
 * Phase 3 — Section 2: FORM MOLECULES
 * Search input with icon and clear button
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input, InputProps } from '@/components/ui/input';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export interface SearchBarProps extends Omit<InputProps, 'type' | 'iconLeft' | 'iconRight'> {
  /** Show clear button */
  showClear?: boolean;
  
  /** Placeholder text */
  placeholder?: string;
  
  /** Debounce delay in ms */
  debounceMs?: number;
  
  /** On search callback */
  onSearch?: (query: string) => void;
}

const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  (
    {
      showClear = true,
      placeholder = 'Search...',
      debounceMs = 300,
      onSearch,
      className,
      ...props
    },
    ref
  ) => {
    const [query, setQuery] = useState(props.value as string || props.defaultValue as string || '');
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setQuery(newValue);
      
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      
      const timer = setTimeout(() => {
        onSearch?.(newValue);
      }, debounceMs);
      
      setDebounceTimer(timer);
      props.onChange?.(e);
    };
    
    const handleClear = () => {
      setQuery('');
      onSearch?.('');
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
    
    return (
      <div className="relative w-full">
        <Input
          ref={ref}
          type="search"
          value={query}
          placeholder={placeholder}
          onChange={handleChange}
          iconLeft={
            <Icon size="sm" className="w-5 h-5">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </Icon>
          }
          iconRight={
            showClear && query ? (
              <AnimatePresence>
                <motion.button
                  type="button"
                  onClick={handleClear}
                  className="text-white/60 hover:text-white transition-colors"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 0.2 }}
                  aria-label="Clear search"
                >
                  <Icon size="sm" className="w-5 h-5">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </Icon>
                </motion.button>
              </AnimatePresence>
            ) : undefined
          }
          className={className}
          {...props}
        />
      </div>
    );
  }
);

SearchBar.displayName = 'SearchBar';

export { SearchBar };

