/**
 * RashiPreferenceSelector Organism
 * 
 * Phase 3 — Section 3.18: Profile Organism
 * Selector for Rashi preference (Moon, Ascendant, Sun)
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioItem } from '@/components/molecules/radio-group';
import { cn } from '@/lib/utils';

export type RashiPreference = 'moon' | 'ascendant' | 'sun';

export interface RashiPreferenceSelectorProps {
  /** Current preference */
  preference?: RashiPreference;
  
  /** Moon sign */
  moonSign?: string;
  
  /** Ascendant sign */
  ascendantSign?: string;
  
  /** Sun sign */
  sunSign?: string;
  
  /** On preference change handler */
  onPreferenceChange?: (preference: RashiPreference) => void;
  
  /** Custom class */
  className?: string;
}

export const RashiPreferenceSelector: React.FC<RashiPreferenceSelectorProps> = ({
  preference = 'moon',
  moonSign,
  ascendantSign,
  sunSign,
  onPreferenceChange,
  className,
}) => {
  const options = [
    {
      value: 'moon',
      label: `Moon Sign${moonSign ? ` (${moonSign})` : ''}`,
      description: 'Based on your Moon position',
    },
    {
      value: 'ascendant',
      label: `Ascendant${ascendantSign ? ` (${ascendantSign})` : ''}`,
      description: 'Based on your Lagna',
    },
    {
      value: 'sun',
      label: `Sun Sign${sunSign ? ` (${sunSign})` : ''}`,
      description: 'Based on your Sun position',
    },
  ];
  
  return (
    <Card variant="base" className={cn('space-y-4', className)}>
      <div>
        <h3 className="text-lg font-semibold text-white mb-1">Rashi Preference</h3>
        <p className="text-sm text-white/60">
          Choose which sign to use for predictions and horoscopes
        </p>
      </div>
      
      <RadioGroup
        value={preference}
        onValueChange={(value) => onPreferenceChange?.(value as RashiPreference)}
        orientation="vertical"
      >
        {options.map((option) => (
          <RadioItem
            key={option.value}
            value={option.value}
            label={
              <div>
                <div className="font-medium">{option.label}</div>
                <div className="text-xs text-white/50">{option.description}</div>
              </div>
            }
          />
        ))}
      </RadioGroup>
    </Card>
  );
};

