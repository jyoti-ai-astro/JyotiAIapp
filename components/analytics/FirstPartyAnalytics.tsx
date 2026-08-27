'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

type Touch = {
  utmSource?: string | null
  utmMedium?: string | null
  utmCampaign?: string | null
  utmContent?: string | null
  utmTerm?: string | null
  referrer?: string | null
}

const FIRST_TOUCH_KEY = 'jyotiai.analytics.firstTouch.v1'
const ANON_KEY = 'jyotiai.analytics.anonymousId.v1'
const SESSION_KEY = 'jyotiai.analytics.sessionId.v1'
const SESSION_STARTED_KEY = 'jyotiai.analytics.sessionStarted.v1'
const LANDING_SENT_KEY = 'jyotiai.analytics.landingSent.v1'

function uuid() {
  return crypto.randomUUID()
}

function getOrCreate(storage: Storage, key: string) {
  const existing = storage.getItem(key)
  if (existing) return existing
  const value = uuid()
  storage.setItem(key, value)
  return value
}

function currentTouch(): Touch & Record<string, string | null> {
  const params = new URLSearchParams(window.location.search)
  return {
    utmSource: params.get('utm_source'),
    utmMedium: params.get('utm_medium'),
    utmCampaign: params.get('utm_campaign'),
    utmContent: params.get('utm_content'),
    utmTerm: params.get('utm_term'),
    referrer: document.referrer || null,
    gclid: params.get('gclid'),
    wbraid: params.get('wbraid'),
    gbraid: params.get('gbraid'),
    fbclid: params.get('fbclid'),
  }
}

function getFirstTouch(touch: Touch) {
  try {
    const existing = localStorage.getItem(FIRST_TOUCH_KEY)
    if (existing) return JSON.parse(existing)
    localStorage.setItem(FIRST_TOUCH_KEY, JSON.stringify(touch))
  } catch {
    // Analytics must never block the site if storage is unavailable.
  }
  return touch
}

function deviceClass() {
  const width = window.innerWidth
  if (width < 768) return 'mobile'
  if (width < 1180) return 'tablet'
  return 'desktop'
}

async function send(eventName: string, currentPath: string, landingPath: string) {
  try {
    const anonymousId = getOrCreate(localStorage, ANON_KEY)
    const sessionId = getOrCreate(sessionStorage, SESSION_KEY)
    const touch = currentTouch()
    const firstTouch = getFirstTouch(touch)

    await fetch('/api/analytics/event', {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId: uuid(),
        eventName,
        anonymousId,
        sessionId,
        landingPath,
        currentPath,
        ...touch,
        firstTouch,
        deviceClass: deviceClass(),
      }),
    })
  } catch {
    // Telemetry is deliberately best-effort and must never degrade UX.
  }
}

export function FirstPartyAnalytics() {
  const pathname = usePathname()

  useEffect(() => {
    const landingPath = sessionStorage.getItem('jyotiai.analytics.landingPath.v1') || pathname || '/'
    sessionStorage.setItem('jyotiai.analytics.landingPath.v1', landingPath)

    if (!sessionStorage.getItem(SESSION_STARTED_KEY)) {
      sessionStorage.setItem(SESSION_STARTED_KEY, '1')
      void send('session_started', pathname || '/', landingPath)
    }

    if (!sessionStorage.getItem(LANDING_SENT_KEY)) {
      sessionStorage.setItem(LANDING_SENT_KEY, '1')
      void send('landing_viewed', pathname || '/', landingPath)
    }

    if ((pathname || '').includes('/pricing')) {
      void send('pricing_viewed', pathname || '/', landingPath)
    }
  }, [pathname])

  return null
}
