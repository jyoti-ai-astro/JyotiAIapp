/**
 * Global Providers Wrapper
 *
 * Ensures global UX controllers and first-party analytics load once.
 */

'use client'

import React, { useEffect, useState } from 'react'
import { CosmicCursor } from '@/components/global/CosmicCursor'
import { SoundscapeController } from '@/components/global/SoundscapeController'
import { ResponsiveWrapper } from '@/components/global/ResponsiveWrapper'
import AnalyticsProvider from '@/components/providers/AnalyticsProvider'

let globalProvidersMounted = false

export function GlobalProviders({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (!globalProvidersMounted) {
      globalProvidersMounted = true
      setMounted(true)
    }
  }, [])

  if (!mounted) return <>{children}</>

  return (
    <ResponsiveWrapper>
      <AnalyticsProvider />
      <CosmicCursor />
      <SoundscapeController />
      {children}
    </ResponsiveWrapper>
  )
}
