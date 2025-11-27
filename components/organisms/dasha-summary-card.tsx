/**
 * DashaSummaryCard Organism
 * 
 * Phase 3 — Section 3.2: Dashboard Overview Organism
 * Dasha period card with planet glyph, start/end dates, current energy level bar, energy pulse background
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export interface DashaSummaryCardProps {
  /** Planet name */
  planet: string;
  
  /** Planet glyph/icon */
  planetGlyph?: string;
  
  /** Start date */
  startDate: string;
  
  /** End date */
  endDate: string;
  
  /** Current energy level (0-100) */
  energyLevel: number;
  
  /** Energy description */
  energyDescription?: string;
  
  /** Custom class */
  className?: string;
}

export const DashaSummaryCard: React.FC<DashaSummaryCardProps> = ({
  planet,
  planetGlyph = '🪐',
  startDate,
  endDate,
  energyLevel,
  energyDescription,
  className,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card variant="energy-pulse" className={cn('relative overflow-hidden', className)}>
        {/* Energy pulse background */}
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(circle at center, rgba(157,78,221,0.3) 0%, transparent 70%)`,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        <div className="relative z-10 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                className="text-2xl"
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                {planetGlyph}
              </motion.div>
              <div>
                <h3 className="text-lg font-semibold text-white">{planet} Dasha</h3>
                <p className="text-sm text-white/60">
                  {startDate} - {endDate}
                </p>
              </div>
            </div>
          </div>
          
          {/* Energy level bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/80">Energy Level</span>
              <span className="text-white font-medium">{energyLevel}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#9D4EDD] to-[#7B2CBF] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${energyLevel}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              >
                <motion.div
                  className="h-full w-full bg-white/30"
                  animate={{
                    x: ['-100%', '100%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              </motion.div>
            </div>
          </div>
          
          {/* Energy description */}
          {energyDescription && (
            <p className="text-sm text-white/70">{energyDescription}</p>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

