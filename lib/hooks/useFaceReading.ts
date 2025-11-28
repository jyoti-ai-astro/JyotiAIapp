/**
 * Face Reading Hook
 * 
 * Hook for face reading analysis
 */

'use client';

import { useState } from 'react';
import { faceReadingEngine, type FaceReadingAnalysis } from '@/lib/engines/face-reading-engine';

export function useFaceReading() {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<FaceReadingAnalysis | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const analyze = async (imageUrl: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await faceReadingEngine.analyzeFace(imageUrl);
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

