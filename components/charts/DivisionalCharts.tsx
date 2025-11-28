/**
 * Divisional Charts Component
 * 
 * Batch 3 - App Internal Screens Part 1
 * 
 * Displays D1, D9, D10 charts with toggle
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChartWheel } from '@/components/astro/ChartWheel';
import { MandalaOverlay } from '@/components/astro/MandalaOverlay';
import { cn } from '@/lib/utils';

export type ChartType = 'D1' | 'D9' | 'D10';

interface DivisionalChartsProps {
  d1Data?: any;
  d9Data?: any;
  d10Data?: any;
  className?: string;
}

const chartInfo: Record<ChartType, { name: string; description: string }> = {
  D1: {
    name: 'D1 - Birth Chart',
    description: 'Main birth chart showing planetary positions at birth',
  },
  D9: {
    name: 'D9 - Navamsa Chart',
    description: 'Marriage, relationships, and spiritual evolution',
  },
  D10: {
    name: 'D10 - Dashamsa Chart',
    description: 'Career, profession, and public life',
  },
};

export const DivisionalCharts: React.FC<DivisionalChartsProps> = ({
  d1Data,
  d9Data,
  d10Data,
  className,
}) => {
  const [selectedChart, setSelectedChart] = useState<ChartType>('D1');

  const getChartData = (type: ChartType) => {
    switch (type) {
      case 'D1':
        return d1Data;
      case 'D9':
        return d9Data;
      case 'D10':
        return d10Data;
      default:
        return null;
    }
  };

  const currentData = getChartData(selectedChart);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Chart Type Selector */}
      <div className="flex gap-2 justify-center">
        {(['D1', 'D9', 'D10'] as ChartType[]).map((type) => (
          <Button
            key={type}
            onClick={() => setSelectedChart(type)}
            variant={selectedChart === type ? 'default' : 'outline'}
            className={cn(
              selectedChart === type
                ? 'bg-gold text-cosmic-navy hover:bg-gold-light'
                : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
            )}
          >
            {type}
          </Button>
        ))}
      </div>

      {/* Chart Info */}
      <Card className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30 text-white">
        <CardHeader>
          <CardTitle className="text-gold">{chartInfo[selectedChart].name}</CardTitle>
          <CardDescription className="text-white/70">
            {chartInfo[selectedChart].description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentData ? (
            <div className="space-y-4">
              <div className="relative">
                <ChartWheel chartType={selectedChart} grahas={currentData.grahas} />
                <MandalaOverlay intensity={0.2} />
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-white/60">Chart data not available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

