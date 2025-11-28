/**
 * Houses Grid Component
 * 
 * Batch 3 - App Internal Screens Part 1
 * 
 * Displays 12 houses in a grid with planets in each house
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { HouseCard } from '@/components/astro/HouseCard';
import { cn } from '@/lib/utils';

export interface HouseData {
  houseNumber: number;
  sign: string;
  cuspLongitude: number;
  planets: string[];
}

interface HousesGridProps {
  houses: HouseData[];
  className?: string;
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

export const HousesGrid: React.FC<HousesGridProps> = ({ houses, className }) => {
  // Sort houses by number
  const sortedHouses = [...houses].sort((a, b) => a.houseNumber - b.houseNumber);

  return (
    <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4', className)}>
      {sortedHouses.map((house, index) => (
        <motion.div
          key={house.houseNumber}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05, duration: 0.4 }}
        >
          <HouseCard {...house} />
        </motion.div>
      ))}
    </div>
  );
};

