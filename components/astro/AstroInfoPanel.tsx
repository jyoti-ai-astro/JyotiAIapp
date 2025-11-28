/**
 * Astro Info Panel Component
 * 
 * Batch 3 - Astro Components
 * 
 * Information panel for astrological data
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AstroInfoPanelProps {
  title: string;
  description?: string;
  data: Array<{ label: string; value: string | number }>;
  className?: string;
}

export const AstroInfoPanel: React.FC<AstroInfoPanelProps> = ({
  title,
  description,
  data,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30 text-white">
        <CardHeader>
          <CardTitle className="text-2xl font-display text-gold">{title}</CardTitle>
          {description && (
            <CardDescription className="text-white/70">{description}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex justify-between items-center border-b border-white/10 pb-2 last:border-b-0">
              <span className="text-white/60">{item.label}:</span>
              <span className="text-gold font-semibold">{item.value}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
};

