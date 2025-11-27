/**
 * KundaliRegenerateCard Organism
 * 
 * Phase 3 — Section 3.18: Profile Organism
 * Card for regenerating kundali
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export interface KundaliRegenerateCardProps {
  /** Last generated date */
  lastGenerated?: string;
  
  /** On regenerate handler */
  onRegenerate?: () => void;
  
  /** Is regenerating */
  regenerating?: boolean;
  
  /** Custom class */
  className?: string;
}

export const KundaliRegenerateCard: React.FC<KundaliRegenerateCardProps> = ({
  lastGenerated,
  onRegenerate,
  regenerating = false,
  className,
}) => {
  return (
    <Card variant="interactive" className={cn('space-y-4', className)}>
      <div className="flex items-start gap-4">
        <div className="text-3xl">🔯</div>
        <div className="flex-1 space-y-2">
          <h3 className="text-lg font-semibold text-white">Regenerate Kundali</h3>
          <p className="text-sm text-white/70">
            Generate a new kundali based on your current birth details.
          </p>
          {lastGenerated && (
            <p className="text-xs text-white/50">
              Last generated: {new Date(lastGenerated).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
      
      <Button
        variant="primary"
        onClick={onRegenerate}
        disabled={regenerating}
        loading={regenerating}
        iconLeft={
          !regenerating && (
            <Icon size="sm" className="w-4 h-4">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </Icon>
          )
        }
        className="w-full"
      >
        {regenerating ? 'Regenerating...' : 'Regenerate Kundali'}
      </Button>
    </Card>
  );
};

