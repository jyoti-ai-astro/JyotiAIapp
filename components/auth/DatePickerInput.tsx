/**
 * Date Picker Input Component
 * 
 * Better date picker with separate year/month/day inputs
 * to avoid the year input issue with native date input
 */

'use client';

import React, { useState, useEffect } from 'react';
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
  label,
}) => {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  // Parse initial value
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        setDay(String(date.getDate()).padStart(2, '0'));
        setMonth(String(date.getMonth() + 1).padStart(2, '0'));
        setYear(String(date.getFullYear()));
      }
    }
  }, [value]);

  // Update parent when any field changes
  useEffect(() => {
    if (day && month && year) {
      const dayNum = parseInt(day, 10);
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt(year, 10);

      // Validate date
      if (
        dayNum >= 1 && dayNum <= 31 &&
        monthNum >= 1 && monthNum <= 12 &&
        yearNum >= 1900 && yearNum <= new Date().getFullYear()
      ) {
        const date = new Date(yearNum, monthNum - 1, dayNum);
        // Check if date is valid (handles leap years, month boundaries, etc.)
        if (
          date.getDate() === dayNum && 
          date.getMonth() === monthNum - 1 &&
          date.getFullYear() === yearNum
        ) {
          const isoString = date.toISOString().split('T')[0];
          onChange(isoString);
        }
      }
    } else if (!day && !month && !year) {
      // Clear value if all fields are empty
      onChange('');
    }
  }, [day, month, year, onChange]);

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 2);
    setDay(val);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 2);
    if (val === '' || (parseInt(val, 10) >= 1 && parseInt(val, 10) <= 12)) {
      setMonth(val);
    }
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    // Allow partial input - only validate when all 4 digits are entered
    if (val === '' || val.length < 4) {
      setYear(val);
    } else {
      const yearNum = parseInt(val, 10);
      if (yearNum >= 1900 && yearNum <= new Date().getFullYear()) {
        setYear(val);
      }
    }
  };

  return (
    <div className={className}>
      {label && (
        <Label className="text-white/80 mb-2 flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {label}
        </Label>
      )}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            type="text"
            value={day}
            onChange={handleDayChange}
            placeholder="DD"
            maxLength={2}
            required={required}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:ring-2 focus:ring-gold text-center"
          />
          <span className="text-xs text-white/60 mt-1 block text-center">Day</span>
        </div>
        <div className="flex-1">
          <Input
            type="text"
            value={month}
            onChange={handleMonthChange}
            placeholder="MM"
            maxLength={2}
            required={required}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:ring-2 focus:ring-gold text-center"
          />
          <span className="text-xs text-white/60 mt-1 block text-center">Month</span>
        </div>
        <div className="flex-1">
          <Input
            type="text"
            value={year}
            onChange={handleYearChange}
            placeholder="YYYY"
            maxLength={4}
            required={required}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:ring-2 focus:ring-gold text-center"
          />
          <span className="text-xs text-white/60 mt-1 block text-center">Year</span>
        </div>
      </div>
    </div>
  );
};

