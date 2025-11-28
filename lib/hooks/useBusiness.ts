/**
 * Business Hook
 * 
 * Hook for business compatibility analysis
 */

'use client';

import { useState } from 'react';
import { businessEngine, type BusinessAnalysis } from '@/lib/engines/business-engine';
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
      const result = await businessEngine.analyzeBusinessIdea(idea, user);
      setAnalysis(result);
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

