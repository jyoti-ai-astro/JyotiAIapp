'use client'

import { useState, useCallback } from 'react'
import type { AuraAnalysis } from '@/lib/engines/aura/types'

type AuraApiSuccess = {
  success: true
  analysis: AuraAnalysis
}

type AuraApiError = {
  error?: string
  message?: string
}

export function useAuraScan() {
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<AuraAnalysis | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const scan = useCallback(async (imageUrl: string) => {
    try {
      setLoading(true)
      setError(null)

      if (!imageUrl || !imageUrl.trim()) {
        throw new Error('Image URL is required')
      }

      const response = await fetch('/api/aura/analyze', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl }),
      })

      const payload = (await response.json().catch(() => null)) as
        | AuraApiSuccess
        | AuraApiError
        | null

      if (!response.ok) {
        const apiError = payload as AuraApiError | null
        throw new Error(
          apiError?.message ||
            apiError?.error ||
            `Aura analysis failed (${response.status})`
        )
      }

      const successPayload = payload as AuraApiSuccess | null

      if (
        !successPayload ||
        successPayload.success !== true ||
        !successPayload.analysis
      ) {
        throw new Error('Aura analysis returned an invalid response')
      }

      setAnalysis(successPayload.analysis)
    } catch (err) {
      const scanError =
        err instanceof Error ? err : new Error('Aura analysis failed')
      setError(scanError)
      setAnalysis(null)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    analysis,
    loading,
    error,
    scan,
  }
}
