/**
 * HouseDetails Organism
 * 
 * Phase 3 — Section 3.4: Kundali Viewer Organism
 * House grid with details
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface HouseDetail {
  house: number;
  sign: string;
  lord: string;
  planets: string[];
  description?: string;
}

export interface HouseDetailsProps {
  /** House details */
  houses: HouseDetail[];
  
  /** On house click handler */
  onHouseClick?: (house: HouseDetail) => void;
  
  /** Custom class */
  className?: string;
}

export const HouseDetails: React.FC<HouseDetailsProps> = ({
  houses,
  onHouseClick,
  className,
}) => {
  return (
    <Card variant="base" className={cn('space-y-4', className)}>
      <h3 className="text-lg font-semibold text-white">Houses</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {houses.map((house, index) => (
          <motion.div
            key={house.house}
            className={cn(
              'p-3 rounded-lg',
              'bg-white/5 border border-white/10',
              'hover:bg-white/10 hover:border-[#F4CE65]/30',
              'transition-all duration-200',
              onHouseClick && 'cursor-pointer'
            )}
            onClick={() => onHouseClick?.(house)}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">House {house.house}</span>
                <Badge variant="default" size="sm">
                  {house.sign}
                </Badge>
              </div>
              <div className="text-xs text-white/60">
                <div>Lord: {house.lord}</div>
                {house.planets.length > 0 && (
                  <div className="mt-1">
                    Planets: {house.planets.join(', ')}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
};

