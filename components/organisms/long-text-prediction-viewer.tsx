/**
 * LongTextPredictionViewer Organism
 * 
 * Phase 3 — Section 3.6: Predictions Engine Organism
 * Viewer for long-form prediction text with fade-in paragraphs
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export interface LongTextPredictionViewerProps {
  /** Prediction text (can be long) */
  text: string;
  
  /** Title */
  title?: string;
  
  /** Show expand/collapse */
  expandable?: boolean;
  
  /** Initial expanded state */
  defaultExpanded?: boolean;
  
  /** Custom class */
  className?: string;
}

export const LongTextPredictionViewer: React.FC<LongTextPredictionViewerProps> = ({
  text,
  title,
  expandable = false,
  defaultExpanded = true,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [paragraphs, setParagraphs] = useState<string[]>([]);
  
  useEffect(() => {
    // Split text into paragraphs
    const paras = text.split('\n\n').filter(p => p.trim());
    setParagraphs(paras);
  }, [text]);
  
  const displayParagraphs = expandable && !isExpanded ? paragraphs.slice(0, 2) : paragraphs;
  
  return (
    <Card variant="gradient" className={cn('space-y-4', className)}>
      {title && (
        <h3 className="text-xl font-semibold text-white">{title}</h3>
      )}
      
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {displayParagraphs.map((paragraph, index) => (
            <motion.p
              key={index}
              className="text-white/90 leading-relaxed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              {paragraph}
            </motion.p>
          ))}
        </AnimatePresence>
      </div>
      
      {expandable && paragraphs.length > 2 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full"
        >
          {isExpanded ? 'Show Less' : `Show ${paragraphs.length - 2} More Paragraphs`}
          <Icon size="sm" className="w-4 h-4">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d={isExpanded ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}
            />
          </Icon>
        </Button>
      )}
    </Card>
  );
};

