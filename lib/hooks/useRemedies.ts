/**
 * Remedies Hook
 * 
 * Hook for fetching spiritual remedies
 */

'use client';

import { useState, useCallback } from 'react';
import { remedyEngine, type RemedyPackage } from '@/lib/engines/remedy-engine';

export function useRemedies() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getRemedies = useCallback(async (
    category: 'love' | 'career' | 'money' | 'health' | 'spiritual',
    userData?: any
  ): Promise<RemedyPackage | null> => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const remedies = await remedyEngine.getRemediesForCategory(category, userData);
      return remedies;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch remedies');
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getRemediesForPrediction = useCallback(async (
    predictionCategory: string,
    intensity: string
  ): Promise<RemedyPackage | null> => {
    try {
      setLoading(true);
      setError(null);

      await new Promise(resolve => setTimeout(resolve, 800));

      const remedies = await remedyEngine.getRemediesForPrediction(predictionCategory, intensity);
      return remedies;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch remedies');
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getRemedies,
    getRemediesForPrediction,
  };
}

