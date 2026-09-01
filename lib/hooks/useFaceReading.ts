/**
 * Face Reading Hook
 * 
 * Hook for face reading analysis
 */

'use client';

import { useState } from 'react';
import type { FaceReadingAnalysis } from '@/lib/engines/face-reading-engine';

export function useFaceReading() {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<FaceReadingAnalysis | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const analyze = async (imageUrl: string) => {
    try {
      setLoading(true);
      setError(null);
      void imageUrl;
      throw new Error(
        'Face reading is temporarily unavailable while image analysis is being upgraded. No credit has been used.'
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

