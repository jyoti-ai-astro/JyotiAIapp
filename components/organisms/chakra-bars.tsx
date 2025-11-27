/**
 * ChakraBars Organism
 * 
 * Phase 3 — Section 3.15: Chakra Deep Scan Organism
 * 7 chakra bars animated with glow pulsing
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { chakra } from '@/styles/tokens/colors';

export interface ChakraData {
  name: string;
  level: number; // 0-100
  color: string;
  description?: string;
}

export interface ChakraBarsProps {
  /** Chakra data */
  chakras: ChakraData[];
  
  /** Custom class */
  className?: string;
}

const chakraNames = [
  'Root',
  'Sacral',
  'Solar Plexus',
  'Heart',
  'Throat',
  'Third Eye',
  'Crown',
];

const chakraColors = [
  chakra.root,
  chakra.sacral,
  chakra.solar,
  chakra.heart,
  chakra.throat,
  chakra.thirdEye,
  chakra.crown,
];

export const ChakraBars: React.FC<ChakraBarsProps> = ({
  chakras,
  className,
}) => {
  return (
    <Card variant="glow" className={cn('space-y-4', className)}>
      <h3 className="text-lg font-semibold text-white">Chakra Balance</h3>
      
      <div className="space-y-4">
        {chakras.map((chakra, index) => (
          <motion.div
            key={chakra.name}
            className="space-y-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: chakra.color }}
                />
                <span className="text-sm font-medium text-white">{chakra.name}</span>
              </div>
              <span className="text-sm text-white/60">{chakra.level}%</span>
            </div>
            
            <div className="h-3 bg-white/10 rounded-full overflow-hidden relative">
              <motion.div
                className="h-full rounded-full relative"
                style={{
                  width: `${chakra.level}%`,
                  backgroundColor: chakra.color,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${chakra.level}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
              >
                {/* Glow pulse effect */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)`,
                  }}
                  animate={{
                    x: ['-100%', '200%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              </motion.div>
            </div>
            
            {chakra.description && (
              <p className="text-xs text-white/50">{chakra.description}</p>
            )}
          </motion.div>
        ))}
      </div>
    </Card>
  );
};

