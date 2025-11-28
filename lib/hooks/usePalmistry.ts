/**
 * Palmistry Hook
 * 
 * Hook for palmistry analysis
 */

'use client';

import { useState } from 'react';
import { palmistryEngine, type PalmistryAnalysis } from '@/lib/engines/palmistry-engine';

export function usePalmistry() {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<PalmistryAnalysis | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const analyze = async (leftImageUrl: string, rightImageUrl: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await palmistryEngine.analyzePalms(leftImageUrl, rightImageUrl);
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

