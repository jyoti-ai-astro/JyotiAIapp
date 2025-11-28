/**
 * Aura Scan Hook
 * 
 * Hook for aura scanning analysis
 */

'use client';

import { useState } from 'react';
import { auraEngine, type AuraAnalysis } from '@/lib/engines/aura-engine';

export function useAuraScan() {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AuraAnalysis | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const scan = async (imageUrl: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await auraEngine.scanAura(imageUrl);
      setAnalysis(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Scan failed');
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    analysis,
    loading,
    error,
    scan,
  };
}

