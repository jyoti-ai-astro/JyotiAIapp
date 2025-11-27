/**
 * RemedyPanel Organism
 * 
 * Phase 3 — Section 3.6: Predictions Engine Organism
 * Remedy recommendations panel with particle sparkles
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export interface Remedy {
  id: string;
  title: string;
  description: string;
  type: 'mantra' | 'ritual' | 'gemstone' | 'yantra' | 'other';
  priority: 'high' | 'medium' | 'low';
}

export interface RemedyPanelProps {
  /** Remedies list */
  remedies: Remedy[];
  
  /** Custom class */
  className?: string;
}

export const RemedyPanel: React.FC<RemedyPanelProps> = ({
  remedies,
  className,
}) => {
  const typeIcons = {
    mantra: '🕉️',
    ritual: '🕯️',
    gemstone: '💎',
    yantra: '🔯',
    other: '✨',
  };
  
  const priorityColors = {
    high: '#e85555',
    medium: '#f7c948',
    low: '#42d87c',
  };
  
  return (
    <Card variant="glow" className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Remedies</h3>
        <Badge variant="premium" size="sm">
          {remedies.length} Recommendations
        </Badge>
      </div>
      
      <div className="space-y-3">
        {remedies.map((remedy, index) => (
          <motion.div
            key={remedy.id}
            className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            {/* Particle sparkles */}
            <div className="relative">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-[#F4CE65] rounded-full"
                  style={{
                    left: `${20 + i * 10}%`,
                    top: `${10 + i * 5}%`,
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                />
              ))}
            </div>
            
            <div className="flex items-start gap-3">
              <div className="text-2xl">{typeIcons[remedy.type]}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-base font-medium text-white">{remedy.title}</h4>
                  <Badge
                    size="sm"
                    style={{
                      backgroundColor: `${priorityColors[remedy.priority]}20`,
                      borderColor: `${priorityColors[remedy.priority]}40`,
                      color: priorityColors[remedy.priority],
                    }}
                  >
                    {remedy.priority}
                  </Badge>
                </div>
                <p className="text-sm text-white/70">{remedy.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
};

