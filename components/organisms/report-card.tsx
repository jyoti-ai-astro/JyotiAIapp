/**
 * ReportCard Organism
 * 
 * Phase 3 — Section 3.8: Reports Center Organism
 * Individual report card with preview
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export interface ReportCardProps {
  /** Report type */
  type: 'karma' | 'life' | 'marriage' | 'business' | 'child-name' | 'monthly';
  
  /** Report title */
  title: string;
  
  /** Description */
  description?: string;
  
  /** Is premium */
  premium?: boolean;
  
  /** Is locked */
  locked?: boolean;
  
  /** On click handler */
  onClick?: () => void;
  
  /** Custom class */
  className?: string;
}

export const ReportCard: React.FC<ReportCardProps> = ({
  type,
  title,
  description,
  premium = false,
  locked = false,
  onClick,
  className,
}) => {
  const typeIcons = {
    karma: '🕉️',
    marriage: '💍',
    business: '💼',
    'child-name': '👶',
    monthly: '📅',
    life: '🌟',
  };
  
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        variant={premium ? 'glow' : 'interactive'}
        clickable={!locked}
        hoverable
        onClick={locked ? undefined : onClick}
        className={cn('relative overflow-hidden', className)}
      >
        {/* Premium golden shimmer */}
        {premium && (
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
        )}
        
        <div className="relative z-10 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="text-4xl">{typeIcons[type]}</div>
              <div>
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                {description && (
                  <p className="text-sm text-white/60 mt-1">{description}</p>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              {premium && (
                <Badge variant="premium" size="sm">
                  Premium
                </Badge>
              )}
              {locked && (
                <Badge variant="default" size="sm">
                  <Icon size="sm" className="w-3 h-3 mr-1">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </Icon>
                  Locked
                </Badge>
              )}
            </div>
          </div>
          
          {!locked && (
            <Button
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onClick?.();
              }}
              className="w-full"
            >
              Generate Report
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

