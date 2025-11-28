/**
 * Profile Setup Form Component
 * 
 * Batch 2 - Auth Components
 * 
 * Form for initial profile setup
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { User, Calendar, MapPin } from 'lucide-react';

interface ProfileSetupFormProps {
  onSubmit: (data: { name: string; dob: string; pob: string }) => Promise<void>;
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
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
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
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Your full name"
          required
          className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-2 focus:ring-gold"
        />
      </div>

      <div>
        <Label htmlFor="dob" className="text-white/80 mb-2 flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Date of Birth
        </Label>
        <Input
          id="dob"
          type="date"
          value={formData.dob}
          onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
          required
          max={new Date().toISOString().split('T')[0]}
          className="bg-white/10 border-white/20 text-white focus:ring-2 focus:ring-gold"
        />
      </div>

      <div>
        <Label htmlFor="pob" className="text-white/80 mb-2 flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Place of Birth
        </Label>
        <Input
          id="pob"
          type="text"
          value={formData.pob}
          onChange={(e) => setFormData({ ...formData, pob: e.target.value })}
          placeholder="City, Country"
          required
          className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-2 focus:ring-gold"
        />
      </div>

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

