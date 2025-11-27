/**
 * DivisionalChartsPanel Organism
 * 
 * Phase 3 — Section 3.4: Kundali Viewer Organism
 * Panel for switching between divisional charts (D1, D9, D10, etc.)
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type DivisionalChartType = 'D1' | 'D2' | 'D3' | 'D4' | 'D7' | 'D9' | 'D10' | 'D12' | 'D16' | 'D20' | 'D24' | 'D27' | 'D30' | 'D40' | 'D45' | 'D60';

export interface DivisionalChart {
  type: DivisionalChartType;
  name: string;
  description: string;
  available: boolean;
}

export interface DivisionalChartsPanelProps {
  /** Available charts */
  charts: DivisionalChart[];
  
  /** Selected chart */
  selectedChart?: DivisionalChartType;
  
  /** On chart select handler */
  onChartSelect?: (chart: DivisionalChartType) => void;
  
  /** Custom class */
  className?: string;
}

export const DivisionalChartsPanel: React.FC<DivisionalChartsPanelProps> = ({
  charts,
  selectedChart,
  onChartSelect,
  className,
}) => {
  return (
    <Card variant="base" className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Divisional Charts</h3>
        <Badge variant="info" size="sm">
          {charts.filter(c => c.available).length} Available
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {charts.map((chart) => (
          <motion.button
            key={chart.type}
            type="button"
            className={cn(
              'p-3 rounded-lg text-left',
              'bg-white/5 border border-white/10',
              'hover:bg-white/10 hover:border-[#F4CE65]/30',
              'transition-all duration-200',
              selectedChart === chart.type && 'bg-white/10 border-[#F4CE65]/50',
              !chart.available && 'opacity-40 cursor-not-allowed'
            )}
            onClick={() => chart.available && onChartSelect?.(chart.type)}
            disabled={!chart.available}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={chart.available ? { scale: 1.05 } : undefined}
            whileTap={chart.available ? { scale: 0.95 } : undefined}
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-white">{chart.type}</span>
                {selectedChart === chart.type && (
                  <Badge variant="premium" size="sm">
                    Active
                  </Badge>
                )}
              </div>
              <p className="text-xs text-white/60">{chart.name}</p>
              {chart.description && (
                <p className="text-xs text-white/40 line-clamp-2">{chart.description}</p>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </Card>
  );
};

