/**
 * FestivalTodayCard Organism
 * 
 * Phase 3 — Section 3.2: Dashboard Overview Organism
 * Festival energy card with icon, energy description, ritual suggestion, golden shimmer animation
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface FestivalTodayCardProps {
  /** Festival name */
  name: string;
  
  /** Festival icon/emoji */
  icon?: string;
  
  /** Energy description */
  energyDescription: string;
  
  /** Ritual suggestion */
  ritualSuggestion?: string;
  
  /** Energy level */
  energyLevel?: 'high' | 'medium' | 'low';
  
  /** View details handler */
  onViewDetails?: () => void;
  
  /** Custom class */
  className?: string;
}

export const FestivalTodayCard: React.FC<FestivalTodayCardProps> = ({
  name,
  icon = '🕯️',
  energyDescription,
  ritualSuggestion,
  energyLevel = 'medium',
  onViewDetails,
  className,
}) => {
  const energyColors = {
    high: '#F4CE65',
    medium: '#9D4EDD',
    low: '#4e9df3',
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      <Card variant="glow" className={cn('relative overflow-hidden', className)}>
        {/* Golden shimmer animation */}
        <motion.div
          className="absolute inset-0 opacity-0"
          style={{
            background: 'linear-gradient(45deg, transparent 30%, rgba(244,206,101,0.3) 50%, transparent 70%)',
          }}
          animate={{
            opacity: [0, 0.5, 0],
            x: ['-100%', '200%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 2,
            ease: 'linear',
          }}
        />
        
        <div className="relative z-10 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                className="text-3xl"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                {icon}
              </motion.div>
              <div>
                <h3 className="text-lg font-semibold text-white">{name}</h3>
                <p className="text-sm text-white/60">Today's Festival</p>
              </div>
            </div>
            <Badge
              variant="premium"
              size="sm"
              style={{
                backgroundColor: `${energyColors[energyLevel]}20`,
                borderColor: `${energyColors[energyLevel]}40`,
                color: energyColors[energyLevel],
              }}
            >
              {energyLevel}
            </Badge>
          </div>
          
          {/* Energy description */}
          <p className="text-white/90 leading-relaxed">{energyDescription}</p>
          
          {/* Ritual suggestion */}
          {ritualSuggestion && (
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <p className="text-sm font-medium text-white/80 mb-1">Ritual Suggestion</p>
              <p className="text-sm text-white/70">{ritualSuggestion}</p>
            </div>
          )}
          
          {onViewDetails && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onViewDetails}
              className="w-full"
            >
              View Details
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

