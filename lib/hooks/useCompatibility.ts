'use client'

import { useState, useCallback } from 'react'
import type {
  CompatibilityAnalysis,
  PartnerData,
} from '@/lib/engines/compatibility-engine'
import { useEngineResultsStore } from '@/store/engine-results-store'

const COMPATIBILITY_UNAVAILABLE_MESSAGE =
  'Compatibility analysis is temporarily unavailable while partner birth-chart generation is being upgraded. No credit has been used.'

export function useCompatibility() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [analysis, setAnalysis] = useState<CompatibilityAnalysis | null>(null)
  const { setCompatibility } = useEngineResultsStore()

  const analyzeCompatibility = useCallback(
    async (
      _partner1: PartnerData,
      _partner2: PartnerData
    ): Promise<CompatibilityAnalysis | null> => {
      setLoading(true)
      setError(null)
      setAnalysis(null)

      try {
        const unavailableError = new Error(COMPATIBILITY_UNAVAILABLE_MESSAGE)
        setError(unavailableError)
        return null
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return {
    analysis,
    loading,
    error,
    analyzeCompatibility,
  }
}
