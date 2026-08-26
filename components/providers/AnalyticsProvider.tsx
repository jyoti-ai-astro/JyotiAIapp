'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { captureAttribution } from '@/lib/analytics/attribution'
import { getAnonymousId, getSessionId } from '@/lib/analytics/client-identity'

const SESSION_SENT_KEY = 'jyotiai.analytics.session_started.sent'

function send(eventName: 'session_started' | 'landing_viewed', currentPath: string) {
  const anonymousId = getAnonymousId()
  const sessionId = getSessionId()
  if (!anonymousId || !sessionId) return
  const attribution = captureAttribution()
  const firstTouch = attribution.firstTouch
  const body = {
    eventId: crypto.randomUUID(),
    eventName,
    occurredAt: new Date().toISOString(),
    anonymousId,
    sessionId,
    currentPath,
    landingPath: firstTouch?.landingPath || currentPath,
    attribution,
    schemaVersion: 1,
  }
  fetch('/api/analytics/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    keepalive: true,
  }).catch(() => null)
}

export default function AnalyticsProvider() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const suffix = searchParams?.toString()
    const currentPath = `${pathname || '/'}${suffix ? `?${suffix}` : ''}`
    if (!window.sessionStorage.getItem(SESSION_SENT_KEY)) {
      window.sessionStorage.setItem(SESSION_SENT_KEY, '1')
      send('session_started', currentPath)
    }
    send('landing_viewed', currentPath)
  }, [pathname, searchParams])

  return null
}
