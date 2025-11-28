/**
 * House Card Component
 * 
 * Batch 3 - Astro Components
 * 
 * Individual house card with cosmic styling
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface HouseCardProps {
  houseNumber: number;
  sign: string;
  cuspLongitude: number;
  planets: string[];
}

const houseMeanings: Record<number, { name: string; description: string }> = {
  1: { name: 'Self', description: 'Personality, appearance, self' },
  2: { name: 'Wealth', description: 'Money, family, speech' },
  3: { name: 'Siblings', description: 'Brothers, courage, communication' },
  4: { name: 'Mother', description: 'Home, mother, property' },
  5: { name: 'Children', description: 'Children, education, creativity' },
  6: { name: 'Health', description: 'Health, enemies, service' },
  7: { name: 'Marriage', description: 'Spouse, partnerships, business' },
  8: { name: 'Longevity', description: 'Longevity, transformation, secrets' },
  9: { name: 'Dharma', description: 'Religion, father, fortune' },
  10: { name: 'Career', description: 'Profession, status, karma' },
  11: { name: 'Gains', description: 'Income, friends, aspirations' },
  12: { name: 'Losses', description: 'Expenses, spirituality, isolation' },
};

export const HouseCard: React.FC<HouseCardProps> = ({
  houseNumber,
  sign,
  cuspLongitude,
  planets,
}) => {
  const meaning = houseMeanings[houseNumber];

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30 text-white hover:border-gold/50 transition-colors h-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="text-gold">House {houseNumber}</span>
            <Badge variant="outline" className="text-xs border-aura-cyan text-aura-cyan">
              {sign}
            </Badge>
          </CardTitle>
          <CardDescription className="text-white/70">
            {meaning?.name || 'Unknown'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-xs text-white/60 mb-1">Cusp:</p>
            <p className="text-sm text-white/80">{cuspLongitude.toFixed(2)}°</p>
          </div>
          {planets && planets.length > 0 && (
            <div>
              <p className="text-xs text-white/60 mb-2">Planets:</p>
              <div className="flex flex-wrap gap-1">
                {planets.map((planet) => (
                  <Badge
                    key={planet}
                    variant="secondary"
                    className="text-xs bg-cosmic-purple/30 text-gold border border-gold/30"
                  >
                    {planet}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          <p className="text-xs text-white/50 mt-2">
            {meaning?.description || ''}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

