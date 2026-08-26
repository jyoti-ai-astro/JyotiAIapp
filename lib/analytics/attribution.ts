'use client'

import type { AttributionTouch } from './event-schema'

const FIRST_KEY = 'jyotiai.analytics.first_touch'
const LATEST_KEY = 'jyotiai.analytics.latest_touch'

const PARAMS = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','gclid','wbraid','gbraid','fbclid'] as const

function readTouch(): AttributionTouch {
  const url = new URL(window.location.href)
  const touch: AttributionTouch = {
    capturedAt: new Date().toISOString(),
    landingPath: `${url.pathname}${url.search}`,
  }
  if (document.referrer) touch.referrer = document.referrer.slice(0, 500)
  for (const key of PARAMS) {
    const value = url.searchParams.get(key)
    if (value) touch[key] = value.slice(0, 300)
  }
  return touch
}

function hasAcquisitionSignal(touch: AttributionTouch) {
  return Boolean(touch.referrer || PARAMS.some((key) => touch[key]))
}

export function captureAttribution() {
  if (typeof window === 'undefined') return { firstTouch: undefined, latestTouch: undefined }
  const touch = readTouch()
  const existingFirst = window.localStorage.getItem(FIRST_KEY)
  if (!existingFirst) window.localStorage.setItem(FIRST_KEY, JSON.stringify(touch))
  if (hasAcquisitionSignal(touch) || !window.localStorage.getItem(LATEST_KEY)) {
    window.localStorage.setItem(LATEST_KEY, JSON.stringify(touch))
  }
  return getAttribution()
}

export function getAttribution(): { firstTouch?: AttributionTouch; latestTouch?: AttributionTouch } {
  if (typeof window === 'undefined') return {}
  const parse = (key: string) => {
    try { return JSON.parse(window.localStorage.getItem(key) || 'null') || undefined } catch { return undefined }
  }
  return { firstTouch: parse(FIRST_KEY), latestTouch: parse(LATEST_KEY) }
}
