/**
 * PredictionDetailPanel Organism
 * 
 * Phase 3 — Section 3.6: Predictions Engine Organism
 * Main content panel for detailed predictions
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface PredictionDetail {
  title: string;
  content: string;
  category: string;
  date?: string;
  tags?: string[];
}

export interface PredictionDetailPanelProps {
  /** Prediction details */
  prediction?: PredictionDetail;
  
  /** Loading state */
  loading?: boolean;
  
  /** Custom class */
  className?: string;
}

export const PredictionDetailPanel: React.FC<PredictionDetailPanelProps> = ({
  prediction,
  loading = false,
  className,
}) => {
  if (loading) {
    return (
      <Card className={cn('space-y-4', className)}>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="h-4 bg-white/10 rounded animate-pulse"
              style={{ width: `${80 - i * 10}%` }}
            />
          ))}
        </div>
      </Card>
    );
  }
  
  if (!prediction) {
    return (
      <Card className={cn('text-center py-12', className)}>
        <p className="text-white/60">Select a category to view predictions</p>
      </Card>
    );
  }
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={prediction.title}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card variant="gradient" className={cn('space-y-6', className)}>
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">{prediction.title}</h2>
              {prediction.date && (
                <Badge variant="default" size="sm">
                  {prediction.date}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="info" size="sm">
                {prediction.category}
              </Badge>
              {prediction.tags?.map((tag, i) => (
                <Badge key={i} variant="default" size="sm">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          
          {/* Content */}
          <div className="prose prose-invert max-w-none">
            <p className="text-white/90 leading-relaxed whitespace-pre-line">
              {prediction.content}
            </p>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

