import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { generateDailyHoroscope } from '@/lib/engines/horoscope/daily-horoscope'
import { logEvent } from '@/lib/logging/log-event'
import { getAIErrorStatus } from '@/lib/ai/provider-errors'
import { isValidCoordinate, isValidTimezone } from '@/lib/services/geocoding'

export const dynamic = 'force-dynamic'

function buildDegradedHoroscope(
  rashi: string,
  moonSign: string,
  sunSign?: string,
  ascendant?: string
) {
  const date = new Date().toISOString().split('T')[0]

  return {
    date,
    rashi,
    moonSign,
    sunSign,
    ascendant,
    general:
      'Use today for steady progress, reflection, and deliberate choices. Your personalized AI interpretation is temporarily limited.',
    love:
      'Keep communication simple and sincere. Listening carefully will be more useful than forcing conclusions.',
    career:
      'Prioritize one meaningful task and complete it methodically before taking on additional commitments.',
    money:
      'Favor clarity and restraint today. Review important financial decisions before acting.',
    health:
      'Maintain a balanced routine with adequate rest, hydration, and regular movement.',
    luckyColor: 'Gold',
    luckyNumber: 7,
    dos: [
      'Focus on one clear priority',
      'Keep communication thoughtful',
      'Review important decisions',
    ],
    donts: [
      'Rush major commitments',
      'React impulsively',
      'Ignore rest and recovery',
    ],
    energyLevel: 'medium' as const,
  }
}

/**
 * Get Today's Horoscope
 * Part B - Section 8: Notifications & Daily Insights
 * Milestone 7 - Step 2
 *
 * Design:
 * - Auth + Firestore failures still return proper error codes.
 * - Personalized horoscope requires the canonical, current Kundali.
 * - AI failures return explicit retryable error semantics.
 */
export async function GET(request: NextRequest) {
  try {
    // Verify session
    const sessionCookie = request.cookies.get('session')?.value
    if (!sessionCookie || !adminAuth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true)
    const uid = decodedClaims.uid

    if (!adminDb) {
      return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
    }

    // Get user profile
    const userRef = adminDb.collection('users').doc(uid)
    const userSnap = await userRef.get()

    if (!userSnap.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userData = userSnap.data()
    if (userData?.derivedAstrologyStatus === 'stale') {
      return NextResponse.json(
        {
          success: false,
          error: 'KUNDALI_STALE',
          message: 'Your birth details changed. Regenerate your Kundali before requesting a personalized horoscope.',
        },
        { status: 409 }
      )
    }

    if (
      userData?.locationVerified !== true ||
      !isValidCoordinate(userData?.lat, userData?.lng) ||
      !isValidTimezone(userData?.timezone)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'LOCATION_NOT_VERIFIED',
          message: 'Verify your birth location before requesting a personalized horoscope.',
        },
        { status: 409 }
      )
    }

    const kundaliRef = adminDb.collection('kundali').doc(uid)
    const [kundaliSnap, D1Snap] = await Promise.all([
      kundaliRef.get(),
      kundaliRef.collection('D1').doc('chart').get(),
    ])

    if (!kundaliSnap.exists || kundaliSnap.data()?.meta?.stale === true) {
      return NextResponse.json(
        {
          success: false,
          error: 'KUNDALI_REQUIRED',
          message: 'Generate your Kundali before requesting a personalized horoscope.',
        },
        { status: 409 }
      )
    }

    if (!D1Snap.exists) {
      return NextResponse.json(
        {
          success: false,
          error: 'KUNDALI_INCOMPLETE',
          message: 'Your Kundali is incomplete. Regenerate it before requesting a personalized horoscope.',
        },
        { status: 409 }
      )
    }

    const D1Data = D1Snap.data()
    const moonSign = D1Data?.grahas?.moon?.sign
    const sunSign = D1Data?.grahas?.sun?.sign
    const ascendant = D1Data?.lagna?.sign
    const rashiPreference = userData?.rashiPreferred || 'moon'
    const rashi =
      rashiPreference === 'sun'
        ? sunSign
        : rashiPreference === 'ascendant'
          ? ascendant
          : moonSign

    if (!rashi || !moonSign) {
      return NextResponse.json(
        {
          success: false,
          error: 'KUNDALI_INCOMPLETE',
          message: 'Your Kundali is missing required sign data. Regenerate it before requesting a personalized horoscope.',
        },
        { status: 409 }
      )
    }

    try {
      const generated = await generateDailyHoroscope(rashi, moonSign, sunSign, ascendant)
      return NextResponse.json({
        success: true,
        mode: 'live',
        horoscope: generated,
      })
    } catch (engineError: any) {
      console.error('Daily horoscope generation error:', engineError)
      try {
        await logEvent(
          'horoscope.error',
          {
            endpoint: '/api/horoscope/today',
            errorCode: engineError?.code || 'UNKNOWN',
          },
          uid
        )
      } catch (logErr) {
        console.error('Failed to log horoscope error:', logErr)
      }

      const aiStatus = getAIErrorStatus(engineError)

      // Authentication, Firestore, location and canonical-Kundali gates are
      // handled before this point. Once canonical astrology is available,
      // provider/network/quota failures should degrade the experience rather
      // than break the dashboard.
      if (aiStatus >= 429 || String(engineError?.code || '').startsWith('AI_')) {
        return NextResponse.json({
          success: true,
          mode: 'degraded',
          degraded: true,
          reason: engineError?.code || 'AI_TEMPORARILY_UNAVAILABLE',
          message:
            'Live AI interpretation is temporarily unavailable. Showing limited guidance from your verified astrology profile.',
          horoscope: buildDegradedHoroscope(
            rashi,
            moonSign,
            sunSign,
            ascendant
          ),
        })
      }

      return NextResponse.json(
        {
          success: false,
          error:
            engineError?.code ||
            'HOROSCOPE_GENERATION_FAILED',
          message:
            engineError?.clientMessage ||
            'Daily horoscope generation is temporarily unavailable. Please retry.',
        },
        { status: aiStatus }
      )
    }
  } catch (error: any) {
    console.error('Get horoscope error (outer):', error)
    return NextResponse.json(
      {
        success: false,
        error: 'HOROSCOPE_UNAVAILABLE',
        message: 'Daily horoscope is temporarily unavailable. Please retry.',
      },
      { status: 500 }
    )
  }
}
