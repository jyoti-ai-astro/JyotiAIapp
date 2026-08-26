export const CLIENT_EVENT_NAMES = [
  'session_started',
  'landing_viewed',
  'signup_started',
  'pricing_viewed',
  'checkout_started',
  'kundali_started',
  'report_viewed',
  'report_purchase_started',
  'guru_session_started',
  'guru_message_sent',
  'prediction_purchase_started',
  'face_reading_started',
  'palmistry_started',
  'aura_scan_started',
] as const

export type ClientAnalyticsEventName = (typeof CLIENT_EVENT_NAMES)[number]

export type AttributionTouch = {
  referrer?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  gclid?: string
  wbraid?: string
  gbraid?: string
  fbclid?: string
  capturedAt: string
  landingPath: string
}

export type ClientAnalyticsEvent = {
  eventId: string
  eventName: ClientAnalyticsEventName
  occurredAt: string
  anonymousId: string
  sessionId: string
  userUid?: string
  currentPath: string
  landingPath: string
  attribution?: {
    firstTouch?: AttributionTouch
    latestTouch?: AttributionTouch
  }
  properties?: Record<string, string | number | boolean | null>
  schemaVersion: 1
}

const MAX_PROPERTY_KEYS = 25
const MAX_STRING_LENGTH = 300

export function isAllowedClientEventName(value: unknown): value is ClientAnalyticsEventName {
  return typeof value === 'string' && (CLIENT_EVENT_NAMES as readonly string[]).includes(value)
}

export function sanitizeProperties(value: unknown): Record<string, string | number | boolean | null> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const output: Record<string, string | number | boolean | null> = {}
  for (const [key, raw] of Object.entries(value as Record<string, unknown>).slice(0, MAX_PROPERTY_KEYS)) {
    if (!/^[a-zA-Z0-9_.-]{1,64}$/.test(key)) continue
    if (typeof raw === 'string') output[key] = raw.slice(0, MAX_STRING_LENGTH)
    else if (typeof raw === 'number' && Number.isFinite(raw)) output[key] = raw
    else if (typeof raw === 'boolean' || raw === null) output[key] = raw
  }
  return output
}
