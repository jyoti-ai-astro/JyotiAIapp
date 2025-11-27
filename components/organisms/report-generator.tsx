/**
 * ReportGenerator Organism
 * 
 * Phase 3 — Section 3.8: Reports Center Organism
 * Generation modal with progress indicator
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export interface ReportGeneratorProps {
  /** Report type */
  reportType: string;
  
  /** Is generating */
  generating?: boolean;
  
  /** Progress (0-100) */
  progress?: number;
  
  /** Status message */
  statusMessage?: string;
  
  /** On cancel handler */
  onCancel?: () => void;
  
  /** Custom class */
  className?: string;
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  reportType,
  generating = false,
  progress = 0,
  statusMessage,
  onCancel,
  className,
}) => {
  return (
    <Card variant="glow" className={cn('space-y-6', className)}>
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-white">Generating {reportType}</h3>
        {statusMessage && (
          <p className="text-sm text-white/60">{statusMessage}</p>
        )}
      </div>
      
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/80">Progress</span>
          <span className="text-white/60">{progress}%</span>
        </div>
        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#7B2CBF] to-[#9D4EDD] rounded-full relative"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          >
            {/* Shimmering bar effect */}
            <motion.div
              className="absolute inset-0 bg-white/30"
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
      </div>
      
      {/* Generating animation */}
      {generating && (
        <div className="flex items-center justify-center gap-2 text-white/60">
          <motion.div
            className="w-2 h-2 bg-[#F4CE65] rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: 0,
            }}
          />
          <motion.div
            className="w-2 h-2 bg-[#F4CE65] rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: 0.2,
            }}
          />
          <motion.div
            className="w-2 h-2 bg-[#F4CE65] rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: 0.4,
            }}
          />
        </div>
      )}
      
      {onCancel && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="w-full"
        >
          Cancel
        </Button>
      )}
    </Card>
  );
};

