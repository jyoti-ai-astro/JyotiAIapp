import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'

export const dynamic = 'force-dynamic'

function formatNakshatraForDisplay(value: any): string | null {
  if (!value) return null
  if (typeof value === 'string') return value
  if (typeof value !== 'object') return null

  const name =
    typeof value.nakshatra === 'string'
      ? value.nakshatra.trim()
      : typeof value.name === 'string'
        ? value.name.trim()
        : typeof value.label === 'string'
          ? value.label.trim()
          : null

  if (!name) return null

  const pada = value.pada
  if (typeof pada === 'number' && Number.isFinite(pada) && pada > 0) {
    return `${name} · Pada ${pada}`
  }

  if (typeof pada === 'string' && pada.trim() && pada.trim() !== '0') {
    return `${name} · Pada ${pada.trim()}`
  }

  return name
}

/**
 * Dashboard Summary API
 * Part B - Section 4: Milestone 3 - Step 1
 * 
 * Returns all data needed for dashboard display
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

    // Check if kundali exists
    const kundaliRef = adminDb.collection('kundali').doc(uid)
    const kundaliSnap = await kundaliRef.get()
    const hasKundali = kundaliSnap.exists

    // Get Dasha if kundali exists
    let currentMahadasha = null
    let currentAntardasha = null
    let dashaSummary = null

    if (hasKundali) {
      const dashaSnap = await kundaliRef.collection('dasha').doc('vimshottari').get()
      if (dashaSnap.exists) {
        const dashaData = dashaSnap.data()
        currentMahadasha = {
          planet: dashaData?.currentMahadasha?.planet || null,
          startDate: dashaData?.currentMahadasha?.startDate?.toDate?.()?.toISOString() || null,
          endDate: dashaData?.currentMahadasha?.endDate?.toDate?.()?.toISOString() || null,
        }
        currentAntardasha = {
          planet: dashaData?.currentAntardasha?.planet || null,
          startDate: dashaData?.currentAntardasha?.startDate?.toDate?.()?.toISOString() || null,
          endDate: dashaData?.currentAntardasha?.endDate?.toDate?.()?.toISOString() || null,
        }
        dashaSummary = {
          mahadasha: currentMahadasha,
          antardasha: currentAntardasha,
        }
      }
    }

    // Canonical chart identity comes from D1, not duplicated profile fields.
    let lagna = null
    let canonicalMoonSign: string | null = null
    let canonicalNakshatra: string | null = null
    let canonicalD1Available = false

    if (hasKundali) {
      const D1Snap = await kundaliRef.collection('D1').doc('chart').get()
      if (D1Snap.exists) {
        const d1 = D1Snap.data()
        lagna = d1?.lagna || null
        const moon = d1?.grahas?.moon || d1?.grahas?.Moon || d1?.grahas?.Chandra
        canonicalMoonSign = typeof moon?.sign === 'string' ? moon.sign : null
        canonicalNakshatra = formatNakshatraForDisplay(moon?.nakshatra)
        canonicalD1Available = !!d1?.grahas && !!d1?.bhavas && !!d1?.lagna
      }
    }

    // Profile completeness must reflect verified birth data + a usable canonical chart.
    const profileComplete = Boolean(
      userData?.dob &&
      userData?.tob &&
      userData?.pob &&
      userData?.locationVerified === true &&
      Number.isFinite(Number(userData?.lat)) &&
      Number.isFinite(Number(userData?.lng)) &&
      userData?.timezone &&
      hasKundali &&
      canonicalD1Available &&
      canonicalMoonSign &&
      canonicalNakshatra
    )

    return NextResponse.json({
      success: true,
      user: {
        name: userData?.name || 'User',
        photo: userData?.photo || null,
        rashi: canonicalMoonSign || userData?.rashi || null,
        nakshatra: canonicalNakshatra || formatNakshatraForDisplay(userData?.nakshatra),
        lagna: lagna?.sign || null,
        lagnaDetails: lagna,
      },
      kundali: {
        available: hasKundali,
        generatedAt: kundaliSnap.exists
          ? kundaliSnap.data()?.meta?.generatedAt?.toDate?.()?.toISOString() || null
          : null,
      },
      dasha: dashaSummary,
      profileComplete,
      derivedAstrologyStatus: userData?.derivedAstrologyStatus || 'current',
    })
  } catch (error: any) {
    console.error('Dashboard summary error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get dashboard summary' },
      { status: 500 }
    )
  }
}
