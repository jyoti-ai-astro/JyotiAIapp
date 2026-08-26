'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { captureAttribution } from '@/lib/analytics/attribution'
import { getAnonymousId, getSessionId } from '@/lib/analytics/client-identity'

function uuid() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function send(eventName: 'session_started' | 'landing_viewed', currentPath: string) {
  const anonymousId = getAnonymousId()
  const sessionId = getSessionId()
  if (!anonymousId || !sessionId) return
  const attribution = captureAttribution()
  const body = {
    eventId: uuid(),
    eventName,
    occurredAt: new Date().toISOString(),
    anonymousId,
    sessionId,
    currentPath,
    landingPath: attribution.firstTouch?.landingPath || currentPath,
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

  useEffect(() => {
    const sessionId = getSessionId()
    if (!sessionId) return
    const currentPath = `${window.location.pathname}${window.location.search}`
    const sessionKey = `jyotiai.analytics.session_started.${sessionId}`
    if (!window.sessionStorage.getItem(sessionKey)) {
      window.sessionStorage.setItem(sessionKey, '1')
      send('session_started', currentPath)
    }
  }, [])

  useEffect(() => {
    if (!pathname) return
    const sessionId = getSessionId()
    if (!sessionId) return
    const currentPath = `${window.location.pathname}${window.location.search}`
    const pageKey = `jyotiai.analytics.landing_viewed.${sessionId}.${currentPath}`
    if (window.sessionStorage.getItem(pageKey)) return
    window.sessionStorage.setItem(pageKey, '1')
    send('landing_viewed', currentPath)
  }, [pathname])

  return null
}
