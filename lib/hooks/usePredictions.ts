/**
 * Predictions Hook
 * 
 * Hook for fetching daily, weekly, monthly predictions
 */

'use client';

import { useState, useEffect } from 'react';
import { useDataFetch } from './useDataFetch';
import {
  predictionEngine,
  type DailyPrediction,
  type WeeklyPrediction,
  type MonthlyPrediction,
} from '@/lib/engines/prediction-engine';
import { useUserStore } from '@/store/user-store';
import { useEngineResultsStore } from '@/store/engine-results-store';

export function usePredictions() {
  const { user } = useUserStore();
  const { setPredictions } = useEngineResultsStore();
  const [daily, setDaily] = useState<DailyPrediction | null>(null);
  const [weekly, setWeekly] = useState<WeeklyPrediction | null>(null);
  const [monthly, setMonthly] = useState<MonthlyPrediction | null>(null);

  const { loading: dailyLoading, refetch: refetchDaily } = useDataFetch<DailyPrediction>({
    fetcher: async () => {
      if (!user?.rashi) throw new Error('Rashi required');
      return await predictionEngine.getDailyPrediction(user.rashi);
    },
    dependencies: [user?.rashi],
    enabled: !!user?.rashi,
    onSuccess: (data) => {
      setDaily(data);
      setPredictions({ daily: data });
    },
  });

  const { loading: weeklyLoading, refetch: refetchWeekly } = useDataFetch<WeeklyPrediction>({
    fetcher: async () => {
      if (!user?.rashi) throw new Error('Rashi required');
      return await predictionEngine.getWeeklyPrediction(user.rashi);
    },
    dependencies: [user?.rashi],
    enabled: !!user?.rashi,
    onSuccess: (data) => {
      setWeekly(data);
      setPredictions({ weekly: data });
    },
  });

  const { loading: monthlyLoading, refetch: refetchMonthly } = useDataFetch<MonthlyPrediction>({
    fetcher: async () => {
      if (!user?.rashi) throw new Error('Rashi required');
      return await predictionEngine.getMonthlyPrediction(user.rashi);
    },
    dependencies: [user?.rashi],
    enabled: !!user?.rashi,
    onSuccess: (data) => {
      setMonthly(data);
      setPredictions({ monthly: data });
    },
  });

  return {
    daily,
    weekly,
    monthly,
    loading: dailyLoading || weeklyLoading || monthlyLoading,
    refetch: () => {
      refetchDaily();
      refetchWeekly();
      refetchMonthly();
    },
  };
}

