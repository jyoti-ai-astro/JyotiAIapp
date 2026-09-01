import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'

export const dynamic = 'force-dynamic'

const ALLOWED_EVENTS = new Set([
  'session_started',
  'landing_viewed',
  'pricing_viewed',
  'signup_started',
  'signup_completed',
  'login_completed',
  'checkout_started',
  'report_purchase_started',
  'kundali_started',
  'guru_session_started',
])

const MAX_VALUE_LENGTH = 500

function clean(value: unknown, max = MAX_VALUE_LENGTH) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed ? trimmed.slice(0, max) : null
}

function safePath(value: unknown) {
  const path = clean(value, 300)
  return path?.startsWith('/') ? path : null
}

function isUuid(value: unknown) {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

export async function POST(request: NextRequest) {
  if (!adminDb) {
    return NextResponse.json({ error: 'Analytics store unavailable' }, { status: 503 })
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const eventId = body?.eventId
  const eventName = clean(body?.eventName, 80)
  if (!isUuid(eventId) || !eventName || !ALLOWED_EVENTS.has(eventName)) {
    return NextResponse.json({ error: 'Invalid analytics event' }, { status: 400 })
  }

  const anonymousId = isUuid(body?.anonymousId) ? body.anonymousId : null
  const sessionId = isUuid(body?.sessionId) ? body.sessionId : null
  if (!anonymousId || !sessionId) {
    return NextResponse.json({ error: 'Missing analytics identity' }, { status: 400 })
  }

  const utmSource = clean(body?.utmSource, 120)
  const utmMedium = clean(body?.utmMedium, 120)
  const utmCampaign = clean(body?.utmCampaign, 160)
  const utmContent = clean(body?.utmContent, 160)
  const utmTerm = clean(body?.utmTerm, 160)
  const referrer = clean(body?.referrer, 500)

  const touch = {
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: utmCampaign,
    utm_content: utmContent,
    utm_term: utmTerm,
    referrer,
    gclid: clean(body?.gclid, 200),
    wbraid: clean(body?.wbraid, 200),
    gbraid: clean(body?.gbraid, 200),
    fbclid: clean(body?.fbclid, 200),
  }

  const event = {
    eventId,
    eventName,
    occurredAt: new Date().toISOString(),
    receivedAt: new Date(),
    anonymousId,
    sessionId,
    landingPath: safePath(body?.landingPath),
    currentPath: safePath(body?.currentPath),
    referrer,
    utmSource,
    utmMedium,
    utmCampaign,
    utmContent,
    utmTerm,
    gclid: touch.gclid,
    wbraid: touch.wbraid,
    gbraid: touch.gbraid,
    fbclid: touch.fbclid,
    deviceClass: clean(body?.deviceClass, 40),
    browser: clean(body?.browser, 80),
    os: clean(body?.os, 80),
    appEnvironment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'unknown',
    release: process.env.VERCEL_GIT_COMMIT_SHA || null,
    attribution: {
      firstTouch: body?.firstTouch && typeof body.firstTouch === 'object' ? {
        utm_source: clean(body.firstTouch.utmSource, 120),
        utm_medium: clean(body.firstTouch.utmMedium, 120),
        utm_campaign: clean(body.firstTouch.utmCampaign, 160),
        utm_content: clean(body.firstTouch.utmContent, 160),
        utm_term: clean(body.firstTouch.utmTerm, 160),
        referrer: clean(body.firstTouch.referrer, 500),
      } : touch,
      latestTouch: touch,
    },
  }

  try {
    await adminDb.collection('analyticsEvents').doc(eventId).create(event)
    return NextResponse.json({ accepted: true }, { status: 202 })
  } catch (error: any) {
    if (error?.code === 6 || error?.code === 'already-exists') {
      return NextResponse.json({ accepted: true, duplicate: true }, { status: 200 })
    }
    console.error('Analytics ingestion failed', error)
    return NextResponse.json({ error: 'Analytics ingestion failed' }, { status: 500 })
  }
}
