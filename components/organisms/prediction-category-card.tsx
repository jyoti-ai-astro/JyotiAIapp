/**
 * PredictionCategoryCard Organism
 * 
 * Phase 3 — Section 3.6: Predictions Engine Organism
 * Category card for predictions (Health, Finance, Love, Career, Business, etc.)
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export interface PredictionCategoryCardProps {
  /** Category name */
  category: string;
  
  /** Category icon */
  icon?: React.ReactNode;
  
  /** Short preview text */
  preview?: string;
  
  /** Click handler */
  onClick?: () => void;
  
  /** Is active/selected */
  active?: boolean;
  
  /** Custom class */
  className?: string;
}

export const PredictionCategoryCard: React.FC<PredictionCategoryCardProps> = ({
  category,
  icon,
  preview,
  onClick,
  active = false,
  className,
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        variant={active ? 'glow' : 'interactive'}
        clickable
        hoverable
        onClick={onClick}
        className={cn(
          'cursor-pointer transition-all duration-300',
          active && 'border-[#F4CE65]/50 shadow-[0_0_20px_rgba(244,206,101,0.3)]',
          className
        )}
      >
        <div className="flex items-start gap-4">
          {icon && (
            <motion.div
              animate={active ? { rotate: [0, 360] } : {}}
              transition={{ duration: 2, repeat: active ? Infinity : 0 }}
            >
              {icon}
            </motion.div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white mb-1">{category}</h3>
            {preview && (
              <p className="text-sm text-white/70 line-clamp-2">{preview}</p>
            )}
          </div>
          {active && (
            <Badge variant="premium" size="sm">
              Active
            </Badge>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

