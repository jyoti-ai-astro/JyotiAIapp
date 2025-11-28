/**
 * Dasha Card Component
 * 
 * Batch 3 - Astro Components
 * 
 * Individual dasha period card
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface DashaCardProps {
  planet: string;
  startDate: string;
  endDate: string;
  type: 'mahadasha' | 'antardasha' | 'pratyantardasha';
}

export const DashaCard: React.FC<DashaCardProps> = ({
  planet,
  startDate,
  endDate,
  type,
}) => {
  const typeLabels = {
    mahadasha: 'Mahadasha',
    antardasha: 'Antar Dasha',
    pratyantardasha: 'Pratyantar Dasha',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30 text-white hover:border-gold/50 transition-colors">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-gold">{planet}</span>
            <Badge className="text-xs bg-gold/20 text-gold border border-gold/30">
              {typeLabels[type]}
            </Badge>
          </CardTitle>
          <CardDescription className="text-white/70">
            {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-white/10 rounded-full h-2">
            <motion.div
              className="bg-gold h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1, delay: 0.2 }}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

