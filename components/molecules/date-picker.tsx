/**
 * DatePicker Molecule
 * 
 * Phase 3 — Section 2: FORM MOLECULES (Date-Time Group)
 * Phase 1 — Section 15 — Part 2: Inputs (Date Picker)
 * Reference: Calendar wheel, Hover: day glows gold, Selected: chakra ring
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/icon';
import type { JyotiComponentProps } from '@/components/ui/types';

export interface DatePickerProps extends Omit<JyotiComponentProps, 'motion'> {
  /** Selected date */
  value?: Date;
  
  /** Default date */
  defaultValue?: Date;
  
  /** Label */
  label?: string;
  
  /** Error message */
  error?: string;
  
  /** Helper text */
  helperText?: string;
  
  /** Disabled state */
  disabled?: boolean;
  
  /** Minimum date */
  minDate?: Date;
  
  /** Maximum date */
  maxDate?: Date;
  
  /** Change handler */
  onDateChange?: (date: Date | null) => void;
  
  /** Custom class */
  className?: string;
}

const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    {
      value,
      defaultValue,
      label,
      error,
      helperText,
      disabled = false,
      size = 'md',
      minDate,
      maxDate,
      className,
      onDateChange,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(value || defaultValue || null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const pickerRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
      if (value !== undefined) {
        setSelectedDate(value);
      }
    }, [value]);
    
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      
      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [isOpen]);
    
    const formatDate = (date: Date | null) => {
      if (!date) return '';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };
    
    const getDaysInMonth = (date: Date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDayOfWeek = firstDay.getDay();
      
      const days: (number | null)[] = [];
      for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(null);
      }
      for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
      }
      return days;
    };
    
    const handleDateSelect = (day: number) => {
      const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      setSelectedDate(newDate);
      setIsOpen(false);
      onDateChange?.(newDate);
    };
    
    const isDateDisabled = (day: number) => {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      if (minDate && date < minDate) return true;
      if (maxDate && date > maxDate) return true;
      return false;
    };
    
    const isDateSelected = (day: number) => {
      if (!selectedDate) return false;
      return (
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === currentMonth.getMonth() &&
        selectedDate.getFullYear() === currentMonth.getFullYear()
      );
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
    
    const days = getDaysInMonth(currentMonth);
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="block text-sm font-medium text-white/90">
            {label}
          </label>
        )}
        
        <div ref={pickerRef} className="relative">
          <motion.button
            ref={ref}
            type="button"
            className={baseClasses}
            disabled={disabled}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            whileHover={!disabled ? { scale: 1.01 } : undefined}
            whileTap={!disabled ? { scale: 0.99 } : undefined}
            {...props}
          >
            <div className="flex items-center justify-between">
              <span className={cn(
                selectedDate ? 'text-white' : 'text-white/40'
              )}>
                {selectedDate ? formatDate(selectedDate) : 'Select date'}
              </span>
              <Icon size="sm" className="w-4 h-4">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </Icon>
            </div>
          </motion.button>
          
          <AnimatePresence>
            {isOpen && (
              <motion.div
                className="absolute z-50 mt-2 bg-[#1A1F3C] backdrop-blur-md border border-white/20 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.5)] p-4"
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                {/* Calendar header */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                    className="p-2 text-white/60 hover:text-white transition-colors"
                  >
                    <Icon size="sm" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </Icon>
                  </button>
                  
                  <h3 className="text-white font-medium">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                  
                  <button
                    type="button"
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                    className="p-2 text-white/60 hover:text-white transition-colors"
                  >
                    <Icon size="sm" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </Icon>
                  </button>
                </div>
                
                {/* Week days */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {weekDays.map(day => (
                    <div key={day} className="text-center text-xs text-white/60 py-1">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-1">
                  {days.map((day, index) => {
                    if (day === null) {
                      return <div key={`empty-${index}`} className="aspect-square" />;
                    }
                    
                    const isSelected = isDateSelected(day);
                    const isDisabled = isDateDisabled(day);
                    
                    return (
                      <motion.button
                        key={day}
                        type="button"
                        className={cn(
                          'aspect-square rounded-lg',
                          'text-sm font-medium',
                          'transition-all duration-150',
                          isSelected
                            ? 'bg-[#F4CE65] text-[#060B1B] shadow-[0_0_12px_rgba(244,206,101,0.5)]'
                            : 'text-white/80 hover:bg-white/10 hover:text-white',
                          isDisabled && 'opacity-40 cursor-not-allowed'
                        )}
                        onClick={() => !isDisabled && handleDateSelect(day)}
                        disabled={isDisabled}
                        whileHover={!isDisabled && !isSelected ? { scale: 1.1, backgroundColor: 'rgba(244,206,101,0.2)' } : undefined}
                        whileTap={!isDisabled ? { scale: 0.95 } : undefined}
                      >
                        {day}
                      </motion.button>
                    );
                  })}
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

DatePicker.displayName = 'DatePicker';

export { DatePicker };

