/**
 * Profile Setup Form Component
 * 
 * Batch 2 - Auth Components
 * 
 * Form for initial profile setup with improved date picker and location autocomplete
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { DatePickerInput } from './DatePickerInput';
import { LocationAutocomplete } from './LocationAutocomplete';

interface ProfileSetupFormProps {
  onSubmit: (data: { name: string; dob: string; pob: string; lat?: number; lng?: number }) => Promise<void>;
  loading?: boolean;
  initialData?: {
    name?: string;
    dob?: string;
    pob?: string;
  };
}

export const ProfileSetupForm: React.FC<ProfileSetupFormProps> = ({
  onSubmit,
  loading = false,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    dob: initialData?.dob || '',
    pob: initialData?.pob || '',
    lat: undefined as number | undefined,
    lng: undefined as number | undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required';
    } else {
      const dob = new Date(formData.dob);
      const today = new Date();
      if (dob > today) {
        newErrors.dob = 'Date of birth cannot be in the future';
      }
    }

    if (!formData.pob.trim()) {
      newErrors.pob = 'Place of birth is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit({
        name: formData.name,
        dob: formData.dob,
        pob: formData.pob,
        lat: formData.lat,
        lng: formData.lng,
      });
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors({ submit: 'Failed to save profile. Please try again.' });
    }
  };

  const createRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.className = 'absolute rounded-full bg-gold/30 animate-ping pointer-events-none';
    button.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div>
        <Label htmlFor="name" className="text-white/80 mb-2 flex items-center gap-2">
          <User className="h-4 w-4" />
          Name
        </Label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => {
            setFormData({ ...formData, name: e.target.value });
            if (errors.name) setErrors({ ...errors, name: '' });
          }}
          placeholder="Your full name"
          required
          className={`bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-2 focus:ring-gold ${errors.name ? 'border-red-500' : ''}`}
        />
        {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
      </div>

      <DatePickerInput
        value={formData.dob}
        onChange={(value) => {
          setFormData({ ...formData, dob: value });
          if (errors.dob) setErrors({ ...errors, dob: '' });
        }}
        required
        label="Date of Birth"
        className={errors.dob ? 'mb-2' : ''}
      />
      {errors.dob && <p className="text-red-400 text-sm mt-1 mb-4">{errors.dob}</p>}

      <LocationAutocomplete
        value={formData.pob}
        onChange={(value, coordinates) => {
          setFormData({
            ...formData,
            pob: value,
            lat: coordinates?.lat,
            lng: coordinates?.lng,
          });
          if (errors.pob) setErrors({ ...errors, pob: '' });
        }}
        required
        label="Place of Birth"
        className={errors.pob ? 'mb-2' : ''}
      />
      {errors.pob && <p className="text-red-400 text-sm mt-1">{errors.pob}</p>}
      {errors.submit && <p className="text-red-400 text-sm mt-2">{errors.submit}</p>}

      <Button
        type="submit"
        onClick={createRipple}
        disabled={loading}
        className="w-full bg-gold text-cosmic-navy hover:bg-gold-light relative overflow-hidden"
        size="lg"
      >
        {loading ? 'Saving...' : 'Continue'}
      </Button>
    </motion.form>
  );
};

