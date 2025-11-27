/**
 * Autocomplete Molecule
 * 
 * Phase 3 — Section 2: FORM MOLECULES
 * Phase 1 — Section 15 — Part 2: Inputs (Autocomplete)
 * Reference: Place of Birth dropdown, Floating cards, Parallax shift
 */

'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input, InputProps } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface AutocompleteOption {
  value: string;
  label: string;
  description?: string;
}

export interface AutocompleteProps extends Omit<InputProps, 'onChange' | 'value'> {
  /** Options list */
  options: AutocompleteOption[];
  
  /** Selected value */
  value?: string;
  
  /** Default value */
  defaultValue?: string;
  
  /** Minimum characters to trigger search */
  minChars?: number;
  
  /** Maximum results to show */
  maxResults?: number;
  
  /** Change handler */
  onValueChange?: (value: string) => void;
  
  /** Custom filter function */
  filterFn?: (query: string, options: AutocompleteOption[]) => AutocompleteOption[];
}

const Autocomplete = React.forwardRef<HTMLInputElement, AutocompleteProps>(
  (
    {
      options,
      value,
      defaultValue,
      minChars = 2,
      maxResults = 10,
      onValueChange,
      filterFn,
      className,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState(value || defaultValue || '');
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const autocompleteRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => {
      if (value !== undefined) {
        setQuery(value);
      }
    }, [value]);
    
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      
      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [isOpen]);
    
    const filteredOptions = useMemo(() => {
      if (!query || query.length < minChars) return [];
      
      if (filterFn) {
        return filterFn(query, options).slice(0, maxResults);
      }
      
      return options
        .filter(option =>
          option.label.toLowerCase().includes(query.toLowerCase()) ||
          option.value.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, maxResults);
    }, [query, options, minChars, maxResults, filterFn]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setQuery(newValue);
      setIsOpen(newValue.length >= minChars);
      setHighlightedIndex(-1);
      props.onChange?.(e);
    };
    
    const handleSelect = (option: AutocompleteOption) => {
      setQuery(option.label);
      setIsOpen(false);
      setHighlightedIndex(-1);
      onValueChange?.(option.value);
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen || filteredOptions.length === 0) {
        props.onKeyDown?.(e);
        return;
      }
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex(prev =>
            prev < filteredOptions.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1));
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightedIndex >= 0) {
            handleSelect(filteredOptions[highlightedIndex]);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          break;
        default:
          props.onKeyDown?.(e);
      }
    };
    
    return (
      <div ref={autocompleteRef} className="relative w-full">
        <Input
          ref={(node) => {
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
            inputRef.current = node;
          }}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= minChars && setIsOpen(true)}
          className={className}
          {...props}
        />
        
        <AnimatePresence>
          {isOpen && filteredOptions.length > 0 && (
            <motion.div
              className="absolute z-50 w-full mt-2 bg-[#1A1F3C] backdrop-blur-md border border-white/20 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.5)] overflow-hidden"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className="max-h-60 overflow-y-auto">
                {filteredOptions.map((option, index) => (
                  <motion.button
                    key={option.value}
                    type="button"
                    className={cn(
                      'w-full px-4 py-3 text-left transition-colors',
                      'hover:bg-white/10',
                      highlightedIndex === index && 'bg-white/10',
                      index === 0 && 'rounded-t-xl',
                      index === filteredOptions.length - 1 && 'rounded-b-xl'
                    )}
                    onClick={() => handleSelect(option)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    whileHover={{ x: 4 }}
                  >
                    <div className="text-white font-medium">{option.label}</div>
                    {option.description && (
                      <div className="text-sm text-white/60 mt-1">{option.description}</div>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Autocomplete.displayName = 'Autocomplete';

export { Autocomplete };

