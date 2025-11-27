/**
 * TimePicker Molecule
 * 
 * Phase 3 — Section 2: FORM MOLECULES (Date-Time Group)
 * Phase 1 — Section 15 — Part 2: Inputs (Time Picker)
 * Reference: Analog + digital hybrid, Clock hand animates on change
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/icon';
import type { JyotiComponentProps } from '@/components/ui/types';

export interface TimePickerProps extends Omit<JyotiComponentProps, 'motion'> {
  /** Selected time (HH:MM format) */
  value?: string;
  
  /** Default time */
  defaultValue?: string;
  
  /** Label */
  label?: string;
  
  /** Error message */
  error?: string;
  
  /** Helper text */
  helperText?: string;
  
  /** Disabled state */
  disabled?: boolean;
  
  /** 12-hour format */
  use12Hour?: boolean;
  
  /** Change handler */
  onTimeChange?: (time: string) => void;
  
  /** Custom class */
  className?: string;
}

const TimePicker = React.forwardRef<HTMLButtonElement, TimePickerProps>(
  (
    {
      value,
      defaultValue,
      label,
      error,
      helperText,
      disabled = false,
      size = 'md',
      use12Hour = false,
      className,
      onTimeChange,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [time, setTime] = useState(value || defaultValue || '12:00');
    const [mode, setMode] = useState<'hour' | 'minute'>('hour');
    const pickerRef = useRef<HTMLDivElement>(null);
    
    const [hours, minutes] = time.split(':').map(Number);
    const displayHours = use12Hour ? (hours % 12 || 12) : hours;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    useEffect(() => {
      if (value !== undefined) {
        setTime(value);
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
    
    const handleTimeChange = (newHours: number, newMinutes: number) => {
      const formattedTime = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
      setTime(formattedTime);
      onTimeChange?.(formattedTime);
    };
    
    const formatTime = () => {
      if (use12Hour) {
        return `${displayHours}:${String(minutes).padStart(2, '0')} ${ampm}`;
      }
      return time;
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
    
    const hoursList = use12Hour ? Array.from({ length: 12 }, (_, i) => i + 1) : Array.from({ length: 24 }, (_, i) => i);
    const minutesList = Array.from({ length: 60 }, (_, i) => i);
    
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
              <span className="text-white">{formatTime()}</span>
              <Icon size="sm" className="w-4 h-4">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
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
                {/* Mode selector */}
                <div className="flex gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setMode('hour')}
                    className={cn(
                      'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      mode === 'hour'
                        ? 'bg-[#F4CE65] text-[#060B1B]'
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                    )}
                  >
                    Hour
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('minute')}
                    className={cn(
                      'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      mode === 'minute'
                        ? 'bg-[#F4CE65] text-[#060B1B]'
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                    )}
                  >
                    Minute
                  </button>
                </div>
                
                {/* Time selector */}
                <div className="max-h-48 overflow-y-auto">
                  <div className="grid grid-cols-6 gap-2">
                    {(mode === 'hour' ? hoursList : minutesList).map((val) => {
                      const isSelected = mode === 'hour' ? val === displayHours : val === minutes;
                      
                      return (
                        <motion.button
                          key={val}
                          type="button"
                          className={cn(
                            'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                            isSelected
                              ? 'bg-[#F4CE65] text-[#060B1B] shadow-[0_0_12px_rgba(244,206,101,0.5)]'
                              : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
                          )}
                          onClick={() => {
                            if (mode === 'hour') {
                              const newHours = use12Hour
                                ? (ampm === 'PM' ? (val === 12 ? 12 : val + 12) : (val === 12 ? 0 : val))
                                : val;
                              handleTimeChange(newHours, minutes);
                            } else {
                              handleTimeChange(hours, val);
                            }
                            if (mode === 'hour') setMode('minute');
                            else setIsOpen(false);
                          }}
                          whileHover={!isSelected ? { scale: 1.05 } : undefined}
                          whileTap={{ scale: 0.95 }}
                        >
                          {String(val).padStart(2, '0')}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
                
                {/* AM/PM selector for 12-hour format */}
                {use12Hour && (
                  <div className="flex gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        const newHours = ampm === 'PM' ? hours - 12 : hours;
                        handleTimeChange(newHours >= 0 ? newHours : newHours + 12, minutes);
                      }}
                      className={cn(
                        'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        ampm === 'AM'
                          ? 'bg-[#F4CE65] text-[#060B1B]'
                          : 'bg-white/10 text-white/80 hover:bg-white/20'
                      )}
                    >
                      AM
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const newHours = ampm === 'AM' ? hours + 12 : hours;
                        handleTimeChange(newHours < 24 ? newHours : newHours - 24, minutes);
                      }}
                      className={cn(
                        'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        ampm === 'PM'
                          ? 'bg-[#F4CE65] text-[#060B1B]'
                          : 'bg-white/10 text-white/80 hover:bg-white/20'
                      )}
                    >
                      PM
                    </button>
                  </div>
                )}
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

TimePicker.displayName = 'TimePicker';

export { TimePicker };

