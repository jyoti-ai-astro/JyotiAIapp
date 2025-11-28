/**
 * Compatibility Hook
 * 
 * Hook for compatibility analysis
 */

'use client';

import { useState, useCallback } from 'react';
import { compatibilityEngine, type CompatibilityAnalysis, type PartnerData } from '@/lib/engines/compatibility-engine';
import { useEngineResultsStore } from '@/store/engine-results-store';

export function useCompatibility() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [analysis, setAnalysis] = useState<CompatibilityAnalysis | null>(null);
  const { setCompatibility } = useEngineResultsStore();

  const analyzeCompatibility = useCallback(async (
    partner1: PartnerData,
    partner2: PartnerData
  ): Promise<CompatibilityAnalysis | null> => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const result = await compatibilityEngine.analyzeCompatibility(partner1, partner2);
      setAnalysis(result);
      setCompatibility(result);

      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to analyze compatibility');
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [setCompatibility]);

  return {
    analysis,
    loading,
    error,
    analyzeCompatibility,
  };
}

