export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { isAllowedClientEventName, sanitizeProperties } from '@/lib/analytics/event-schema'

const MAX_BODY_BYTES = 16_000

function cleanString(value: unknown, max = 500) {
  return typeof value === 'string' ? value.slice(0, max) : undefined
}

export async function POST(request: NextRequest) {
  if (!adminDb) return NextResponse.json({ error: 'Analytics storage unavailable' }, { status: 503 })

  const contentLength = Number(request.headers.get('content-length') || 0)
  if (contentLength > MAX_BODY_BYTES) return NextResponse.json({ error: 'Payload too large' }, { status: 413 })

  let body: any
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  if (!cleanString(body?.eventId, 128) || !isAllowedClientEventName(body?.eventName)) {
    return NextResponse.json({ error: 'Invalid event' }, { status: 400 })
  }
  if (!cleanString(body?.anonymousId, 128) || !cleanString(body?.sessionId, 128)) {
    return NextResponse.json({ error: 'Missing analytics identity' }, { status: 400 })
  }

  const eventId = cleanString(body.eventId, 128)!
  const eventRef = adminDb.collection('analyticsEvents').doc(eventId)
  const payload = {
    eventId,
    eventName: body.eventName,
    occurredAt: cleanString(body.occurredAt, 64) || new Date().toISOString(),
    receivedAt: new Date(),
    anonymousId: cleanString(body.anonymousId, 128),
    sessionId: cleanString(body.sessionId, 128),
    userUid: cleanString(body.userUid, 128),
    currentPath: cleanString(body.currentPath, 500),
    landingPath: cleanString(body.landingPath, 500),
    attribution: body.attribution && typeof body.attribution === 'object' ? body.attribution : undefined,
    properties: sanitizeProperties(body.properties),
    source: 'client',
    schemaVersion: 1,
  }

  try {
    await eventRef.create(payload)
    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error: any) {
    const code = String(error?.code || '')
    if (code === '6' || code.includes('already-exists')) return NextResponse.json({ success: true, duplicate: true }, { status: 200 })
    console.error('Analytics event write failed:', error)
    return NextResponse.json({ error: 'Failed to record analytics event' }, { status: 500 })
  }
}
