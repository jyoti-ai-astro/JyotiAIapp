/**
 * Rasi Selector Component
 * 
 * Batch 2 - Auth Components
 * 
 * Rashi selection with radio buttons
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RasiSelectorProps {
  rashiData: {
    moon: string;
    sun: string;
    ascendant: string;
    nakshatra: string;
  };
  selectedRashi: 'moon' | 'sun' | 'ascendant';
  onRashiChange: (rashi: 'moon' | 'sun' | 'ascendant') => void;
}

export const RasiSelector: React.FC<RasiSelectorProps> = ({
  rashiData,
  selectedRashi,
  onRashiChange,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
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
            <p className="text-2xl font-bold text-cosmic-purple">{rashiData.ascendant}</p>
            <p className="text-xs text-white/50 mt-1">Lagna</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <Label className="text-white/80 mb-4 block">Which Rashi do you prefer?</Label>
        <RadioGroup value={selectedRashi} onValueChange={(v) => onRashiChange(v as any)}>
          <div className="space-y-3">
            <Label className="flex items-center space-x-3 cursor-pointer p-4 rounded-lg bg-white/5 border border-white/10 hover:border-gold/50 transition-colors">
              <RadioGroupItem value="moon" className="text-gold" />
              <div className="flex-1">
                <p className="text-white font-medium">Moon Sign ({rashiData.moon})</p>
                <p className="text-sm text-white/60">Most common in India - Recommended</p>
              </div>
            </Label>
            <Label className="flex items-center space-x-3 cursor-pointer p-4 rounded-lg bg-white/5 border border-white/10 hover:border-gold/50 transition-colors">
              <RadioGroupItem value="sun" className="text-gold" />
              <div className="flex-1">
                <p className="text-white font-medium">Sun Sign ({rashiData.sun})</p>
                <p className="text-sm text-white/60">Western astrology</p>
              </div>
            </Label>
            <Label className="flex items-center space-x-3 cursor-pointer p-4 rounded-lg bg-white/5 border border-white/10 hover:border-gold/50 transition-colors">
              <RadioGroupItem value="ascendant" className="text-gold" />
              <div className="flex-1">
                <p className="text-white font-medium">Ascendant ({rashiData.ascendant})</p>
                <p className="text-sm text-white/60">Rising sign</p>
              </div>
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="bg-white/5 rounded-lg p-4">
        <p className="text-sm text-white/70">
          <span className="font-semibold text-gold">Nakshatra:</span> {rashiData.nakshatra}
        </p>
      </div>
    </motion.div>
  );
};

