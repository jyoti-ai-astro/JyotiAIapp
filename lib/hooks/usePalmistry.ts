/**
 * Palmistry Hook
 * 
 * Hook for palmistry analysis
 */

'use client';

import { useState } from 'react';
import type { PalmistryAnalysis } from '@/lib/engines/palmistry-engine';

export function usePalmistry() {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<PalmistryAnalysis | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const analyze = async (leftImageUrl: string, rightImageUrl: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/palmistry/analyze', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leftImageUrl,
          rightImageUrl,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          typeof payload?.error === 'string'
            ? payload.error
            : 'Palmistry analysis failed. Please try again.'
        );
      }

      const result = payload?.analysis as PalmistryAnalysis | undefined;

      if (!result) {
        throw new Error('Palmistry analysis returned no usable result.');
      }
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

