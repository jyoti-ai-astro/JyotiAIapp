// components/auth/DatePickerInput.tsx

/**
 * Date Picker Input Component
 *
 * Better date picker with separate year/month/day inputs
 * to avoid the year input issue with native date input
 */

'use client';

import React, { useState, useEffect, useRef, useId } from 'react';
import { Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DatePickerInputProps {
  value: string; // ISO date string (YYYY-MM-DD)
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
  label?: string;
}

export const DatePickerInput: React.FC<DatePickerInputProps> = ({
  value,
  onChange,
  required = false,
  className = '',
  label = 'Date of Birth',
}) => {
  const reactId = useId();
  const dayId = `${reactId}-day`;
  const monthId = `${reactId}-month`;
  const yearId = `${reactId}-year`;

  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const isEditingRef = useRef(false);
  const lastValueRef = useRef<string>('');

  const dayRef = useRef<HTMLInputElement | null>(null);
  const monthRef = useRef<HTMLInputElement | null>(null);
  const yearRef = useRef<HTMLInputElement | null>(null);

  // Parse initial value - only when value prop changes externally (not from our own onChange)
  useEffect(() => {
    // Don't update if we're currently editing or if value hasn't actually changed
    if (isEditingRef.current || value === lastValueRef.current) {
      return;
    }

    if (value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        const newDay = String(date.getDate()).padStart(2, '0');
        const newMonth = String(date.getMonth() + 1).padStart(2, '0');
        const newYear = String(date.getFullYear());

        // Only update if different from current values
        if (newDay !== day || newMonth !== month || newYear !== year) {
          setDay(newDay);
          setMonth(newMonth);
          setYear(newYear);
          lastValueRef.current = value;
        }
      }
    } else if (day || month || year) {
      // Clear if value is empty
      setDay('');
      setMonth('');
      setYear('');
      lastValueRef.current = '';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]); // Only depend on value, not day/month/year to prevent loops

  // Update parent when any field changes - but only when we have a complete valid date
  useEffect(() => {
    // Skip if we don't have all fields
    if (!day || !month || !year || year.length < 4) {
      return;
    }

    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);

    // Validate date
    if (
      dayNum >= 1 &&
      dayNum <= 31 &&
      monthNum >= 1 &&
      monthNum <= 12 &&
      yearNum >= 1900 &&
      yearNum <= new Date().getFullYear()
    ) {
      const date = new Date(yearNum, monthNum - 1, dayNum);
      // Check if date is valid (handles leap years, month boundaries, etc.)
      if (
        date.getDate() === dayNum &&
        date.getMonth() === monthNum - 1 &&
        date.getFullYear() === yearNum
      ) {
        const isoString = date.toISOString().split('T')[0];

        // Only call onChange if the value actually changed
        if (isoString !== lastValueRef.current) {
          isEditingRef.current = true;
          lastValueRef.current = isoString;
          onChange(isoString);
          // Reset editing flag after a short delay
          setTimeout(() => {
            isEditingRef.current = false;
          }, 100);
        }
      }
    }
  }, [day, month, year, onChange]);

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 2);
    isEditingRef.current = true;
    setDay(val);
    // Auto-advance to month when 2 digits entered
    if (val.length === 2) {
      monthRef.current?.focus();
    }
    // Reset editing flag after a delay
    setTimeout(() => {
      isEditingRef.current = false;
    }, 200);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 2);
    const n = parseInt(raw || '0', 10);
    const val =
      raw === '' || (n >= 1 && n <= 12) ? raw : month; // keep previous if invalid

    isEditingRef.current = true;
    setMonth(val);
    // Auto-advance to year when 2 digits entered
    if (val.length === 2) {
      yearRef.current?.focus();
    }
    // Reset editing flag after a delay
    setTimeout(() => {
      isEditingRef.current = false;
    }, 200);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    isEditingRef.current = true;
    // Allow partial input - only validate when all 4 digits are entered
    setYear(val);
    // Reset editing flag after a delay
    setTimeout(() => {
      isEditingRef.current = false;
    }, 200);
  };

  return (
    <div className={className}>
      {label && (
        <Label
          className="text-white/80 mb-2 flex items-center gap-2"
          htmlFor={dayId}
        >
          <Calendar className="h-4 w-4" />
          {label}
          {required && <span className="text-red-400">*</span>}
        </Label>
      )}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            id={dayId}
            name="dob-day"
            type="text"
            inputMode="numeric"
            value={day}
            onChange={handleDayChange}
            placeholder="DD"
            maxLength={2}
            required={required}
            ref={dayRef}
            autoComplete="bday-day"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:ring-2 focus:ring-gold text-center"
          />
          <span className="text-xs text-white/60 mt-1 block text-center">Day</span>
        </div>
        <div className="flex-1">
          <Input
            id={monthId}
            name="dob-month"
            type="text"
            inputMode="numeric"
            value={month}
            onChange={handleMonthChange}
            placeholder="MM"
            maxLength={2}
            required={required}
            ref={monthRef}
            autoComplete="bday-month"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:ring-2 focus:ring-gold text-center"
          />
          <span className="text-xs text-white/60 mt-1 block text-center">Month</span>
        </div>
        <div className="flex-1">
          <Input
            id={yearId}
            name="dob-year"
            type="text"
            inputMode="numeric"
            value={year}
            onChange={handleYearChange}
            placeholder="YYYY"
            maxLength={4}
            required={required}
            ref={yearRef}
            autoComplete="bday-year"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:ring-2 focus:ring-gold text-center"
          />
          <span className="text-xs text-white/60 mt-1 block text-center">Year</span>
        </div>
      </div>
    </div>
  );
};