/**
 * Planets View Component
 * 
 * Batch 3 - App Internal Screens Part 1
 * 
 * Displays all planets with their positions, signs, houses, and details
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PlanetCard } from '@/components/astro/PlanetCard';
import { cn } from '@/lib/utils';

export interface PlanetData {
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

interface PlanetsViewProps {
  planets: PlanetData[];
  className?: string;
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

export const PlanetsView: React.FC<PlanetsViewProps> = ({ planets, className }) => {
  return (
    <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-3', className)}>
      {planets.map((planet, index) => (
        <motion.div
          key={planet.planet}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
        >
          <PlanetCard {...planet} />
        </motion.div>
      ))}
    </div>
  );
};

