/**
 * Pregnancy Insights Component
 * 
 * Batch 4 - Intelligence Engines
 * 
 * Pregnancy insights and predictions
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Baby, Sparkles } from 'lucide-react';

interface PregnancyInsightsProps {
  onInsightsLoaded?: (insights: any) => void;
}

export const PregnancyInsights: React.FC<PregnancyInsightsProps> = ({ onInsightsLoaded }) => {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<any>(null);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      // Placeholder for pregnancy insights API
      setTimeout(() => {
        const data = {
          favorablePeriods: ['2024-06-15', '2024-09-20'],
          predictions: 'Based on your chart, favorable periods for conception...',
        };
        setInsights(data);
        onInsightsLoaded?.(data);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Fetch insights error:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30 text-white">
        <CardContent className="pt-6 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="h-12 w-12 text-gold mx-auto" />
          </motion.div>
          <p className="mt-4 text-white/70">Loading insights...</p>
        </CardContent>
      </Card>
    );
  }

  if (!insights) {
    return (
      <Card className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30 text-white">
        <CardContent className="pt-6 text-center">
          <p className="text-white/70">No insights available yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30 text-white shadow-cosmic-glow">
      <CardHeader>
        <CardTitle className="text-2xl font-display text-gold">Pregnancy Predictions</CardTitle>
        <CardDescription className="text-white/70">Based on your astrological profile</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-white/80">{insights.predictions}</p>
        {insights.favorablePeriods && insights.favorablePeriods.length > 0 && (
          <div>
            <p className="text-gold font-semibold mb-2">Favorable Periods:</p>
            <ul className="list-disc list-inside space-y-1 text-white/70">
              {insights.favorablePeriods.map((period: string, index: number) => (
                <li key={index}>{new Date(period).toLocaleDateString()}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

