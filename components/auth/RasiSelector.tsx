// components/auth/RasiSelector.tsx

/**
 * Rasi Selector Component
 *
 * Batch 2 - Auth Components
 *
 * Rashi selection with radio buttons
 */

'use client';

import React, { useId } from 'react';
import { motion } from 'framer-motion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

type RashiChoice = 'moon' | 'sun' | 'ascendant';

type NakshatraValue =
  | string
  | {
      nakshatra: string;
      pada?: string | number;
    };

interface RasiSelectorProps {
  rashiData: {
    moon: string;
    sun: string;
    ascendant: string;
    nakshatra: NakshatraValue;
  };
  selectedRashi: RashiChoice;
  onRashiChange: (rashi: RashiChoice) => void;
}

export const RasiSelector: React.FC<RasiSelectorProps> = ({
  rashiData,
  selectedRashi,
  onRashiChange,
}) => {
  const baseId = useId();
  const moonId = `${baseId}-moon`;
  const sunId = `${baseId}-sun`;
  const ascId = `${baseId}-asc`;

  const nakshatraDisplay =
    typeof rashiData.nakshatra === 'string'
      ? rashiData.nakshatra
      : `${rashiData.nakshatra.nakshatra}${
          rashiData.nakshatra.pada
            ? ` (Pada ${rashiData.nakshatra.pada})`
            : ''
        }`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white/5 border-white/20">
          <CardContent className="p-4">
            <p className="text-sm text-white/60 mb-1">Moon Sign</p>
            <p className="text-2xl font-bold text-gold">{rashiData.moon}</p>
            <p className="text-xs text-white/50 mt-1">Chandra Rashi</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/20">
          <CardContent className="p-4">
            <p className="text-sm text-white/60 mb-1">Sun Sign</p>
            <p className="text-2xl font-bold text-aura-cyan">{rashiData.sun}</p>
            <p className="text-xs text-white/50 mt-1">Western</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/20">
          <CardContent className="p-4">
            <p className="text-sm text-white/60 mb-1">Ascendant</p>
            <p className="text-2xl font-bold text-cosmic-purple">
              {rashiData.ascendant}
            </p>
            <p className="text-xs text-white/50 mt-1">Lagna</p>
          </CardContent>
        </Card>
      </div>

      {/* Choice radios */}
      <div>
        <p className="text-white/80 mb-4 block">Which Rashi do you prefer?</p>
        <RadioGroup
          value={selectedRashi}
          onValueChange={(v) => onRashiChange(v as RashiChoice)}
        >
          <div className="space-y-3">
            {/* Moon option */}
            <Label
              htmlFor={moonId}
              className={`
                flex items-center space-x-3 cursor-pointer p-4 rounded-lg
                bg-white/5 border border-white/10 hover:border-gold/50 transition-colors
                ${selectedRashi === 'moon' ? 'border-gold bg-white/10' : ''}
              `}
            >
              <RadioGroupItem value="moon" id={moonId} className="text-gold" />
              <div className="flex-1">
                <p className="text-white font-medium">
                  Moon Sign ({rashiData.moon})
                </p>
                <p className="text-sm text-white/60">
                  Most common in India – Recommended
                </p>
              </div>
            </Label>

            {/* Sun option */}
            <Label
              htmlFor={sunId}
              className={`
                flex items-center space-x-3 cursor-pointer p-4 rounded-lg
                bg-white/5 border border-white/10 hover:border-gold/50 transition-colors
                ${selectedRashi === 'sun' ? 'border-gold bg-white/10' : ''}
              `}
            >
              <RadioGroupItem value="sun" id={sunId} className="text-gold" />
              <div className="flex-1">
                <p className="text-white font-medium">
                  Sun Sign ({rashiData.sun})
                </p>
                <p className="text-sm text-white/60">Western astrology</p>
              </div>
            </Label>

            {/* Ascendant option */}
            <Label
              htmlFor={ascId}
              className={`
                flex items-center space-x-3 cursor-pointer p-4 rounded-lg
                bg-white/5 border border-white/10 hover:border-gold/50 transition-colors
                ${selectedRashi === 'ascendant' ? 'border-gold bg-white/10' : ''}
              `}
            >
              <RadioGroupItem
                value="ascendant"
                id={ascId}
                className="text-gold"
              />
              <div className="flex-1">
                <p className="text-white font-medium">
                  Ascendant ({rashiData.ascendant})
                </p>
                <p className="text-sm text-white/60">Rising sign</p>
              </div>
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Nakshatra info */}
      <div className="bg-white/5 rounded-lg p-4">
        <p className="text-sm text-white/70">
          <span className="font-semibold text-gold">Nakshatra:</span>{' '}
          {nakshatraDisplay}
        </p>
      </div>
    </motion.div>
  );
};