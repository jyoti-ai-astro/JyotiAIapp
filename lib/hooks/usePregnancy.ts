/**
 * Pregnancy Hook
 * 
 * Hook for pregnancy insights
 */

'use client';

import { useDataFetch } from './useDataFetch';
import { pregnancyEngine, type PregnancyInsight } from '@/lib/engines/pregnancy-engine';
import { useUserStore } from '@/store/user-store';

export function usePregnancy() {
  const { user } = useUserStore();

  const { data, loading, error, refetch } = useDataFetch<PregnancyInsight>({
    fetcher: async () => {
      if (!user?.dob) {
        throw new Error('Date of birth required');
      }
      return await pregnancyEngine.generateInsights(user.dob);
    },
    dependencies: [user?.dob],
    enabled: !!user?.dob,
  });

  return {
    insights: data,
    loading,
    error,
    refetch,
  };
}

