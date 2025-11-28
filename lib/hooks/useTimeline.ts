/**
 * Timeline Hook
 * 
 * Hook for 12-month timeline
 */

'use client';

import { useDataFetch } from './useDataFetch';
import { timelineEngine, type MonthTimeline } from '@/lib/engines/timeline-engine';
import { useUserStore } from '@/store/user-store';

export function useTimeline() {
  const { user } = useUserStore();

  const { data, loading, error, refetch } = useDataFetch<MonthTimeline[]>({
    fetcher: async () => {
      if (!user?.dob) {
        throw new Error('Date of birth required');
      }
      return await timelineEngine.generate12MonthTimeline(user.dob, user.rashi || undefined);
    },
    dependencies: [user?.dob, user?.rashi],
    enabled: !!user?.dob,
  });

  return {
    timeline: data || [],
    loading,
    error,
    refetch,
  };
}

