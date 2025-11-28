/**
 * Numerology Hook
 * 
 * Hook for fetching and managing Numerology data
 */

'use client';

import { useDataFetch } from './useDataFetch';
import { numerologyEngine, type NumerologyData } from '@/lib/engines/numerology-engine';
import { useUserStore } from '@/store/user-store';

export function useNumerology() {
  const { user } = useUserStore();

  const { data, loading, error, refetch } = useDataFetch<NumerologyData>({
    fetcher: async () => {
      if (!user?.name || !user?.dob) {
        throw new Error('Name and date of birth required');
      }
      return await numerologyEngine.calculateNumerology(user.name, user.dob);
    },
    dependencies: [user?.name, user?.dob],
    enabled: !!user?.name && !!user?.dob,
  });

  return {
    numerology: data,
    loading,
    error,
    refetch,
  };
}

