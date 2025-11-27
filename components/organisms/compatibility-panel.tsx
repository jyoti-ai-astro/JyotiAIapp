/**
 * CompatibilityPanel Organism
 * 
 * Phase 3 — Section 3.12: Relationship Matching Organism
 * Compatibility meter with chakra bars and percentage
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface CompatibilityPanelProps {
  /** Compatibility percentage */
  percentage: number;
  
  /** Compatibility aspects */
  aspects?: {
    name: string;
    score: number;
  }[];
  
  /** Overall description */
  description?: string;
  
  /** Custom class */
  className?: string;
}

export const CompatibilityPanel: React.FC<CompatibilityPanelProps> = ({
  percentage,
  aspects = [],
  description,
  className,
}) => {
  const getCompatibilityColor = (percent: number) => {
    if (percent >= 80) return '#42d87c';
    if (percent >= 60) return '#f7c948';
    return '#e85555';
  };
  
  const color = getCompatibilityColor(percentage);
  
  return (
    <Card variant="glow" className={cn('space-y-6', className)}>
      {/* Main compatibility meter */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Compatibility</h3>
          <Badge
            size="lg"
            style={{
              backgroundColor: `${color}20`,
              borderColor: `${color}40`,
              color: color,
            }}
          >
            {percentage}%
          </Badge>
        </div>
        
        {/* Circular progress (Yin-Yang concept) */}
        <div className="relative w-32 h-32 mx-auto">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="8"
            />
            <motion.circle
              cx="64"
              cy="64"
              r="56"
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 56}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - percentage / 100) }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </svg>
          
          {/* Animated glow wave */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle, ${color}30 0%, transparent 70%)`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>
        
        {description && (
          <p className="text-center text-white/80">{description}</p>
        )}
      </div>
      
      {/* Compatibility aspects */}
      {aspects.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-white/10">
          <h4 className="text-sm font-medium text-white/80">Aspect Breakdown</h4>
          {aspects.map((aspect, index) => (
            <motion.div
              key={aspect.name}
              className="space-y-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/70">{aspect.name}</span>
                <span className="text-white/60">{aspect.score}%</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    width: `${aspect.score}%`,
                    backgroundColor: getCompatibilityColor(aspect.score),
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${aspect.score}%` }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </Card>
  );
};

