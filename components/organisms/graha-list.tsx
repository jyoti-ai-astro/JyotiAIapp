/**
 * GrahaList Organism
 * 
 * Phase 3 — Section 3.4: Kundali Viewer Organism
 * List of planets with degrees, sign, house, retrograde indicator
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export interface Graha {
  planet: string;
  degrees: number;
  sign: string;
  house: number;
  retrograde: boolean;
  icon?: string;
}

export interface GrahaListProps {
  /** List of grahas */
  grahas: Graha[];
  
  /** On graha click handler */
  onGrahaClick?: (graha: Graha) => void;
  
  /** Custom class */
  className?: string;
}

export const GrahaList: React.FC<GrahaListProps> = ({
  grahas,
  onGrahaClick,
  className,
}) => {
  const planetColors: Record<string, string> = {
    Sun: '#FFB347',
    Moon: '#E0E7FF',
    Mars: '#E57373',
    Mercury: '#AED581',
    Jupiter: '#FFD54F',
    Venus: '#F8BBD0',
    Saturn: '#90A4AE',
    Rahu: '#7E57C2',
    Ketu: '#B39DDB',
  };
  
  return (
    <Card variant="base" className={cn('space-y-2', className)}>
      <h3 className="text-lg font-semibold text-white mb-4">Planetary Positions</h3>
      
      <div className="space-y-2">
        {grahas.map((graha, index) => (
          <motion.div
            key={graha.planet}
            className={cn(
              'flex items-center gap-4 p-3 rounded-lg',
              'bg-white/5 border border-white/10',
              'hover:bg-white/10 hover:border-white/20',
              'transition-all duration-200',
              onGrahaClick && 'cursor-pointer'
            )}
            onClick={() => onGrahaClick?.(graha)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ x: 4 }}
          >
            {/* Planet icon/color */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
              style={{
                backgroundColor: `${planetColors[graha.planet] || '#9D4EDD'}20`,
                border: `2px solid ${planetColors[graha.planet] || '#9D4EDD'}40`,
              }}
            >
              {graha.icon || '🪐'}
            </div>
            
            {/* Planet info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-white">{graha.planet}</span>
                {graha.retrograde && (
                  <Badge variant="warning" size="sm">
                    R
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-white/70">
                <span>{graha.degrees.toFixed(2)}°</span>
                <span className="text-white/40">•</span>
                <span>{graha.sign}</span>
                <span className="text-white/40">•</span>
                <span>House {graha.house}</span>
              </div>
            </div>
            
            {/* Shimmering line divider effect */}
            <motion.div
              className="w-px h-8 bg-gradient-to-b from-transparent via-white/20 to-transparent"
              animate={{
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />
          </motion.div>
        ))}
      </div>
    </Card>
  );
};

