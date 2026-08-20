/**
 * Canonical Timeline API Route
 *
 * Launch v1 timeline generation uses authenticated, canonical AstroContext only.
 */

import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { AstroContextError, buildAstroContext } from '@/lib/engines/astro-context-builder'
import { runTimelineEngine, type TimelineEngineResult } from '@/lib/engines/timeline-engine-v2'
import { consumeFeatureTicket, ensureFeatureAccess } from '@/lib/payments/ticket-service'
import type { FeatureKey } from '@/lib/payments/feature-access'

export const dynamic = 'force-dynamic'

type TimelineRecord = {
  status: 'generating' | 'ready' | 'failed' | 'stale'
  result?: TimelineEngineResult
  months?: number
  failureReason?: string
  updatedAt?: any
  generatedAt?: any
}

async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`TIMEOUT:${label}`))
    }, ms)
  })

  return Promise.race([promise, timeout])
}

async function getAuthenticatedUid(request: NextRequest): Promise<string | NextResponse> {
  const sessionCookie = request.cookies.get('session')?.value
  if (!sessionCookie || !adminAuth) {
    return NextResponse.json(
      {
        status: 'error',
        code: 'UNAUTHENTICATED',
        message: 'Please log in to generate timeline.',
      },
      { status: 401 }
    )
  }

  try {
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true)
    return decodedClaims.uid
  } catch {
    return NextResponse.json(
      {
        status: 'error',
        code: 'UNAUTHENTICATED',
        message: 'Please log in to generate timeline.',
      },
      { status: 401 }
    )
  }
}

function timelineRef(uid: string) {
  if (!adminDb) {
    throw new Error('Firestore not initialized')
  }

  return adminDb.collection('users').doc(uid).collection('timeline').doc('current')
}

async function isAstrologyStale(uid: string): Promise<boolean> {
  if (!adminDb) {
    throw new Error('Firestore not initialized')
  }

  const [userSnap, kundaliSnap] = await Promise.all([
    adminDb.collection('users').doc(uid).get(),
    adminDb.collection('kundali').doc(uid).get(),
  ])

  const userData = userSnap.data()
  const kundaliData = kundaliSnap.data()
  return userData?.derivedAstrologyStatus === 'stale' || kundaliData?.meta?.stale === true
}

async function markTimelineStale(uid: string) {
  await timelineRef(uid).set(
    {
      status: 'stale',
      failureReason: 'Birth details or Kundali changed. Regenerate Kundali before creating a new timeline.',
      updatedAt: new Date(),
    },
    { merge: true }
  )
}

function responseForAstroContextError(error: any) {
  const code = error?.code || 'KUNDALI_REQUIRED'
  return NextResponse.json(
    {
      status: 'error',
      code,
      message:
        error?.message ||
        'Complete your birth profile and generate your Kundali before creating a timeline.',
    },
    { status: 409 }
  )
}

function getTimelinePayload(record: TimelineRecord, cached: boolean) {
  return {
    status: record.result?.status || 'ok',
    data: record.result,
    cached,
    generatedAt: record.generatedAt?.toDate?.()?.toISOString?.() || record.generatedAt || null,
  }
}

export async function GET(request: NextRequest) {
  try {
    const uidOrResponse = await getAuthenticatedUid(request)
    if (typeof uidOrResponse !== 'string') return uidOrResponse

    const snap = await timelineRef(uidOrResponse).get()
    if (await isAstrologyStale(uidOrResponse)) {
      await markTimelineStale(uidOrResponse)
      return NextResponse.json(
        {
          status: 'stale',
          code: 'TIMELINE_STALE',
          message: 'Regenerate Kundali before creating a new timeline.',
        },
        { status: 409 }
      )
    }

    if (!snap.exists) {
      return NextResponse.json(
        {
          status: 'empty',
          code: 'TIMELINE_NOT_FOUND',
          message: 'No timeline has been generated yet.',
        },
        { status: 404 }
      )
    }

    const record = snap.data() as TimelineRecord
    if (record.status === 'ready' && record.result) {
      return NextResponse.json(getTimelinePayload(record, true))
    }

    return NextResponse.json(
      {
        status: record.status,
        code:
          record.status === 'generating'
            ? 'TIMELINE_GENERATING'
            : record.status === 'stale'
            ? 'TIMELINE_STALE'
            : 'TIMELINE_FAILED',
        message:
          record.failureReason ||
          (record.status === 'generating'
            ? 'Timeline generation is already in progress.'
            : 'Timeline is not ready.'),
      },
      { status: record.status === 'generating' ? 202 : 409 }
    )
  } catch (error: any) {
    console.error('Timeline GET error:', error)
    return NextResponse.json(
      {
        status: 'error',
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while loading timeline.',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const uidOrResponse = await getAuthenticatedUid(request)
    if (typeof uidOrResponse !== 'string') return uidOrResponse
    const uid = uidOrResponse

    let body: { startDate?: string; months?: number; force?: boolean } = {}
    try {
      body = await request.json()
    } catch {
      body = {}
    }

    const startDate = body.startDate ? new Date(body.startDate) : new Date()
    const months = body.months && body.months > 0 && body.months <= 24 ? body.months : 12
    const force = body.force === true
    const featureKey: FeatureKey = 'timeline'
    const currentTimelineRef = timelineRef(uid)

    const existingSnap = await currentTimelineRef.get()
    if (await isAstrologyStale(uid)) {
      await markTimelineStale(uid)
      return NextResponse.json(
        {
          status: 'error',
          code: 'KUNDALI_REQUIRED',
          message: 'Regenerate Kundali before creating a new timeline.',
        },
        { status: 409 }
      )
    }

    if (existingSnap.exists) {
      const existing = existingSnap.data() as TimelineRecord
      if (!force && existing.status === 'ready' && existing.result && existing.months === months) {
        return NextResponse.json(getTimelinePayload(existing, true))
      }

      if (existing.status === 'generating') {
        return NextResponse.json(
          {
            status: 'generating',
            code: 'TIMELINE_GENERATING',
            message: 'Timeline generation is already in progress.',
          },
          { status: 409 }
        )
      }
    }

    try {
      await ensureFeatureAccess(uid, featureKey)
    } catch (error: any) {
      if (error?.code === 'NO_TICKETS') {
        return NextResponse.json(
          {
            status: 'error',
            code: 'NO_TICKETS',
            message: 'Timeline credits or an active subscription are required.',
          },
          { status: 403 }
        )
      }

      console.error('Timeline access check failed:', error)
      return NextResponse.json(
        {
          status: 'error',
          code: 'ACCESS_CHECK_FAILED',
          message: 'Unable to verify Timeline access.',
        },
        { status: 500 }
      )
    }

    let astroContext
    try {
      astroContext = await buildAstroContext(uid, { forceRefresh: true })
    } catch (error: any) {
      if (error instanceof AstroContextError || error?.code === 'KUNDALI_REQUIRED' || error?.code === 'ASTRO_CONTEXT_MISSING') {
        return responseForAstroContextError(error)
      }

      console.error('Timeline AstroContext error:', error)
      return responseForAstroContextError({
        code: 'ASTRO_CONTEXT_MISSING',
        message: 'Unable to load your birth profile. Please try again.',
      })
    }

    await currentTimelineRef.set(
      {
        status: 'generating',
        months,
        failureReason: null,
        updatedAt: new Date(),
      },
      { merge: true }
    )

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    try {
      const result = await withTimeout(
        runTimelineEngine({
          astroContext,
          startDate,
          months,
          ragMode: 'light',
          signal: controller.signal,
        }),
        30000,
        'timeline-engine'
      )

      clearTimeout(timeoutId)

      if (result.status === 'error' || result.events.length === 0) {
        await currentTimelineRef.set(
          {
            status: 'failed',
            failureReason: 'Timeline engine did not produce a usable result.',
            updatedAt: new Date(),
          },
          { merge: true }
        )

        return NextResponse.json(
          {
            status: 'error',
            code: 'TIMELINE_GENERATION_FAILED',
            message: 'Timeline generation failed. Please try again.',
          },
          { status: 500 }
        )
      }

      try {
        await consumeFeatureTicket(uid, featureKey)
      } catch (error: any) {
        console.error('Timeline ticket consumption failed:', error)
        await currentTimelineRef.set(
          {
            status: 'failed',
            failureReason: 'Ticket consumption failed after generation.',
            updatedAt: new Date(),
          },
          { merge: true }
        )

        return NextResponse.json(
          {
            status: 'error',
            code: 'TICKET_CONSUMPTION_FAILED',
            message: 'Timeline could not confirm credit usage. Please retry.',
          },
          { status: 409 }
        )
      }

      await currentTimelineRef.set(
        {
          status: 'ready',
          result,
          months,
          failureReason: null,
          generatedAt: new Date(),
          updatedAt: new Date(),
        },
        { merge: true }
      )

      return NextResponse.json(getTimelinePayload({ status: 'ready', result, months, generatedAt: new Date() }, false))
    } catch (error: any) {
      clearTimeout(timeoutId)

      const isTimeout = error.message?.includes('TIMEOUT') || error.name === 'AbortError' || controller.signal.aborted
      await currentTimelineRef.set(
        {
          status: 'failed',
          failureReason: isTimeout
            ? 'Timeline generation timed out.'
            : 'Timeline generation failed.',
          updatedAt: new Date(),
        },
        { merge: true }
      )

      return NextResponse.json(
        {
          status: 'error',
          code: isTimeout ? 'TIMELINE_TIMEOUT' : 'INTERNAL_ERROR',
          message: isTimeout
            ? 'Timeline generation timed out. Please try again.'
            : 'An error occurred while generating timeline. Please try again.',
        },
        { status: isTimeout ? 504 : 500 }
      )
    }
  } catch (error: any) {
    console.error('Unhandled error in timeline API:', error)
    return NextResponse.json(
      {
        status: 'error',
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while generating timeline. Please try again.',
      },
      { status: 500 }
    )
  }
}
