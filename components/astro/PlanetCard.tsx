/**
 * Planet Card Component
 * 
 * Batch 3 - Astro Components
 * 
 * Individual planet card with cosmic styling
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface PlanetCardProps {
  planet: string;
  sign: string;
  nakshatra: string;
  pada: number;
  house: number;
  longitude: number;
  latitude: number;
  retrograde?: boolean;
  degreesInSign?: number;
}

const planetColors: Record<string, string> = {
  Sun: 'text-yellow-400',
  Moon: 'text-blue-300',
  Mars: 'text-red-400',
  Mercury: 'text-green-400',
  Jupiter: 'text-orange-400',
  Venus: 'text-pink-400',
  Saturn: 'text-gray-400',
  Rahu: 'text-purple-400',
  Ketu: 'text-indigo-400',
};

const planetIcons: Record<string, string> = {
  Sun: '☉',
  Moon: '☽',
  Mars: '♂',
  Mercury: '☿',
  Jupiter: '♃',
  Venus: '♀',
  Saturn: '♄',
  Rahu: '☊',
  Ketu: '☋',
};

export const PlanetCard: React.FC<PlanetCardProps> = ({
  planet,
  sign,
  nakshatra,
  pada,
  house,
  longitude,
  latitude,
  retrograde,
  degreesInSign,
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30 text-white hover:border-gold/50 transition-colors">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">{planetIcons[planet] || '●'}</span>
              <span className={planetColors[planet] || 'text-white'}>
                {planet}
              </span>
            </CardTitle>
            {retrograde && (
              <Badge variant="destructive" className="text-xs">R</Badge>
            )}
          </div>
          <CardDescription className="text-white/70">
            {sign} • House {house}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-white/60">Nakshatra:</span>
            <span className="text-gold">{nakshatra}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Pada:</span>
            <span className="text-white/80">{pada}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Longitude:</span>
            <span className="text-white/80">{longitude.toFixed(2)}°</span>
          </div>
          {degreesInSign !== undefined && (
            <div className="flex justify-between">
              <span className="text-white/60">Degrees in Sign:</span>
              <span className="text-white/80">{degreesInSign.toFixed(2)}°</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

