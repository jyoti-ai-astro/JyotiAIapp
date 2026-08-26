'use client'

const ANON_KEY = 'jyotiai.analytics.anonymous_id'
const SESSION_KEY = 'jyotiai.analytics.session'
const SESSION_TTL_MS = 30 * 60 * 1000

type StoredSession = { id: string; touchedAt: number }

function uuid() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function getAnonymousId(): string {
  if (typeof window === 'undefined') return ''
  let value = window.localStorage.getItem(ANON_KEY)
  if (!value) {
    value = uuid()
    window.localStorage.setItem(ANON_KEY, value)
  }
  return value
}

export function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  const now = Date.now()
  let stored: StoredSession | null = null
  try { stored = JSON.parse(window.sessionStorage.getItem(SESSION_KEY) || 'null') } catch {}
  if (!stored || !stored.id || now - stored.touchedAt > SESSION_TTL_MS) stored = { id: uuid(), touchedAt: now }
  else stored.touchedAt = now
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(stored))
  return stored.id
}
