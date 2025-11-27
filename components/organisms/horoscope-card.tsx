/**
 * HoroscopeCard Organism
 * 
 * Phase 3 — Section 3.2: Dashboard Overview Organism
 * Daily horoscope card with Rashi icon, chakra gradient header, lucky number + color, mood indicator
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export interface HoroscopeCardProps {
  /** Rashi name */
  rashi: string;
  
  /** Rashi icon/emoji */
  rashiIcon?: string;
  
  /** Daily horoscope text */
  horoscope: string;
  
  /** Lucky number */
  luckyNumber?: number;
  
  /** Lucky color */
  luckyColor?: string;
  
  /** Mood indicator */
  mood?: 'positive' | 'neutral' | 'cautious';
  
  /** Chakra color for gradient */
  chakraColor?: string;
  
  /** Custom class */
  className?: string;
}

export const HoroscopeCard: React.FC<HoroscopeCardProps> = ({
  rashi,
  rashiIcon = '✨',
  horoscope,
  luckyNumber,
  luckyColor,
  mood = 'neutral',
  chakraColor = '#9D4EDD',
  className,
}) => {
  const moodColors = {
    positive: '#42d87c',
    neutral: '#4e9df3',
    cautious: '#f7c948',
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <Card variant="glow" className={cn('relative overflow-hidden', className)}>
        {/* Chakra gradient header */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-2"
          style={{
            background: `linear-gradient(90deg, ${chakraColor}40, ${chakraColor}80, ${chakraColor}40)`,
          }}
          animate={{
            backgroundPosition: ['0%', '100%', '0%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        
        <div className="pt-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                className="text-3xl"
                animate={{
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatDelay: 2,
                }}
              >
                {rashiIcon}
              </motion.div>
              <div>
                <h3 className="text-lg font-semibold text-white">{rashi}</h3>
                <p className="text-sm text-white/60">Today's Horoscope</p>
              </div>
            </div>
            
            {/* Mood indicator */}
            {mood && (
              <motion.div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: moodColors[mood] }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              />
            )}
          </div>
          
          {/* Horoscope text */}
          <p className="text-white/90 leading-relaxed">{horoscope}</p>
          
          {/* Lucky number and color */}
          {(luckyNumber || luckyColor) && (
            <div className="flex items-center gap-4 pt-2 border-t border-white/10">
              {luckyNumber && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white/60">Lucky Number:</span>
                  <Badge variant="premium" size="sm">
                    {luckyNumber}
                  </Badge>
                </div>
              )}
              {luckyColor && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white/60">Lucky Color:</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full border border-white/20"
                      style={{ backgroundColor: luckyColor }}
                    />
                    <span className="text-sm text-white/80">{luckyColor}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

