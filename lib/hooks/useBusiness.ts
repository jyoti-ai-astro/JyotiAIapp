/**
 * Business Hook
 * 
 * Hook for business compatibility analysis
 */

'use client';

import { useState } from 'react';
import type { BusinessAnalysis } from '@/lib/engines/business-engine';
import { useUserStore } from '@/store/user-store';

export function useBusiness() {
  const { user } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<BusinessAnalysis | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const analyze = async (idea: string) => {
    try {
      setLoading(true);
      setError(null);
      void idea;
      void user;
      throw new Error(
        'Business analysis is temporarily unavailable while the calculation engine is being upgraded. No credit has been used.'
      );
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Analysis failed');
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    analysis,
    loading,
    error,
    analyze,
  };
}

