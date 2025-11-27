/**
 * CoreNumbersPanel Organism
 * 
 * Phase 3 — Section 3.5: Numerology Block Card
 * Life Path number, Destiny number, Compatibility meter, Micro pulse
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface CoreNumber {
  type: 'lifePath' | 'destiny' | 'soul' | 'personality';
  value: number;
  description: string;
  significance: string;
}

export interface CoreNumbersPanelProps {
  /** Core numbers */
  numbers: CoreNumber[];
  
  /** Custom class */
  className?: string;
}

export const CoreNumbersPanel: React.FC<CoreNumbersPanelProps> = ({
  numbers,
  className,
}) => {
  const typeLabels = {
    lifePath: 'Life Path',
    destiny: 'Destiny',
    soul: 'Soul',
    personality: 'Personality',
  };
  
  const typeColors = {
    lifePath: '#9D4EDD',
    destiny: '#F4CE65',
    soul: '#4e9df3',
    personality: '#42d87c',
  };
  
  return (
    <Card variant="gradient" className={cn('space-y-4', className)}>
      <h3 className="text-lg font-semibold text-white">Core Numbers</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {numbers.map((number, index) => (
          <motion.div
            key={number.type}
            className="p-4 rounded-lg bg-white/5 border border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            {/* Micro pulse effect */}
            <motion.div
              className="absolute inset-0 rounded-lg"
              style={{
                background: `radial-gradient(circle at center, ${typeColors[number.type]}20 0%, transparent 70%)`,
              }}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            
            <div className="relative z-10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white/80">
                  {typeLabels[number.type]}
                </span>
                <motion.div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
                  style={{
                    backgroundColor: `${typeColors[number.type]}20`,
                    border: `2px solid ${typeColors[number.type]}40`,
                    color: typeColors[number.type],
                  }}
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  {number.value}
                </motion.div>
              </div>
              <p className="text-sm text-white/70">{number.description}</p>
              <p className="text-xs text-white/50">{number.significance}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
};

