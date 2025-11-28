/**
 * Kundali Hook
 * 
 * Hook for fetching and managing Kundali data
 */

'use client';

import { useDataFetch } from './useDataFetch';
import { kundaliEngine, type KundaliData } from '@/lib/engines/kundali-engine';
import { useUserStore } from '@/store/user-store';

export function useKundali() {
  const { user } = useUserStore();

  const { data, loading, error, refetch } = useDataFetch<KundaliData>({
    fetcher: async () => {
      if (!user?.dob || !user?.tob || !user?.pob) {
        throw new Error('Birth details required');
      }
      return await kundaliEngine.generateKundali(user.dob, user.tob, user.pob);
    },
    dependencies: [user?.dob, user?.tob, user?.pob],
    enabled: !!user?.dob && !!user?.tob && !!user?.pob,
  });

  return {
    kundali: data,
    loading,
    error,
    refetch,
  };
}

