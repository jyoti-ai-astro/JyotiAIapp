/**
 * KundaliWheel3D Organism
 * 
 * Phase 3 — Section 3.4: Kundali Viewer Organism (D1 Chart)
 * 3D Kundali wheel using R3F - MUST BE 3D
 * Reference: Wheel rotates slightly on load, Planets pulse at different speeds
 */

'use client';

import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface GrahaPosition {
  planet: string;
  degrees: number;
  sign: string;
  house: number;
  longitude: number;
  latitude: number;
}

export interface KundaliWheel3DProps {
  /** Graha positions */
  grahas: GrahaPosition[];
  
  /** Chart type */
  chartType?: 'D1' | 'D9' | 'D10';
  
  /** Lagna (ascendant) */
  lagna: number;
  
  /** On planet hover handler */
  onPlanetHover?: (planet: string) => void;
  
  /** Custom class */
  className?: string;
}

// Import the actual R3F implementation
import { KundaliWheel3DCanvas } from '@/components/kundali/KundaliWheel3DCanvas';

export const KundaliWheel3D: React.FC<KundaliWheel3DProps> = ({
  grahas,
  chartType = 'D1',
  lagna,
  onPlanetHover,
  className,
}) => {
  return (
    <Card variant="glow" className={cn('relative overflow-hidden', className)}>
      {/* Chart type selector */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        {(['D1', 'D9', 'D10'] as const).map((type) => (
          <motion.button
            key={type}
            className={cn(
              'px-3 py-1 rounded-lg text-xs font-medium transition-colors',
              chartType === type
                ? 'bg-[#F4CE65] text-[#060B1B]'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {type}
          </motion.button>
        ))}
      </div>
      
      {/* 3D Wheel Canvas */}
      <div className="w-full h-[500px] relative">
        <Suspense
          fallback={
            <div className="w-full h-full flex items-center justify-center">
              <motion.div
                className="w-16 h-16 border-4 border-[#F4CE65] border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            </div>
          }
        >
          <KundaliWheel3DCanvas
            grahas={grahas}
            lagna={lagna}
            onPlanetHover={onPlanetHover}
          />
        </Suspense>
      </div>
      
      {/* Lagna indicator */}
      <div className="absolute bottom-4 left-4 bg-[#F4CE65]/20 border border-[#F4CE65]/40 rounded-lg px-3 py-1.5">
        <span className="text-xs text-[#F4CE65] font-medium">
          Lagna: {lagna}°
        </span>
      </div>
    </Card>
  );
};

