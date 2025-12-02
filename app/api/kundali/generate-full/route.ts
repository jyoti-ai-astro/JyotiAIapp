import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { generateFullKundali } from '@/lib/engines/kundali/generator'
import type { BirthDetails } from '@/lib/engines/kundali/swisseph-wrapper'
import { ensureFeatureAccess, consumeFeatureTicket } from '@/lib/payments/ticket-service'
import type { FeatureKey } from '@/lib/payments/feature-access'

export const dynamic = 'force-dynamic'

/**
 * Generate Full Kundali
 * Part B - Section 4: Step 8
 */
export async function POST(request: NextRequest) {
  try {
    // Verify session
    const sessionCookie = request.cookies.get('session')?.value
    if (!sessionCookie || !adminAuth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true)
    const uid = decodedClaims.uid

    // Phase S: Ticket enforcement
    const featureKey: FeatureKey = 'kundali'
    try {
      await ensureFeatureAccess(uid, featureKey)
    } catch (err: any) {
      if (err.code === 'NO_TICKETS') {
        return NextResponse.json(
          { error: 'NO_TICKETS', message: 'You have no credits left for this feature.' },
          { status: 403 }
        )
      }
      throw err
    }

    // Get user birth details
    if (!adminDb) {
      return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
    }

    const userRef = adminDb.collection('users').doc(uid)
    const userSnap = await userRef.get()

    if (!userSnap.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userData = userSnap.data()
    if (!userData?.dob || !userData?.tob || !userData?.lat || !userData?.lng) {
      return NextResponse.json(
        { error: 'Birth details incomplete. Please complete onboarding first.' },
        { status: 400 }
      )
    }

    // Parse birth details
    const dob = new Date(userData.dob)
    const [hours, minutes] = userData.tob.split(':').map(Number)

    const birthDetails: BirthDetails = {
      year: dob.getFullYear(),
      month: dob.getMonth() + 1,
      day: dob.getDate(),
      hour: hours,
      minute: minutes,
      second: 0,
      lat: userData.lat,
      lng: userData.lng,
      timezone: userData.timezone || 'Asia/Kolkata',
    }

    // Generate full kundali
    const kundali = await generateFullKundali(birthDetails)

    // Save to Firestore
    const kundaliRef = adminDb.collection('kundali').doc(uid)
    
    // Save meta
    await kundaliRef.set({
      meta: {
        ...kundali.meta,
        generatedAt: adminDb.Timestamp.fromDate(kundali.meta.generatedAt),
      },
    }, { merge: true })

    // Save D1 chart
    await kundaliRef.collection('D1').doc('chart').set({
      chartType: kundali.D1.chartType,
      grahas: kundali.D1.grahas,
      bhavas: kundali.D1.bhavas,
      lagna: kundali.D1.lagna,
      aspects: kundali.D1.aspects,
    })

    // Save Dasha
    await kundaliRef.collection('dasha').doc('vimshottari').set({
      currentMahadasha: {
        ...kundali.dasha.currentMahadasha,
        startDate: adminDb.Timestamp.fromDate(kundali.dasha.currentMahadasha.startDate),
        endDate: adminDb.Timestamp.fromDate(kundali.dasha.currentMahadasha.endDate),
      },
      currentAntardasha: {
        ...kundali.dasha.currentAntardasha,
        startDate: adminDb.Timestamp.fromDate(kundali.dasha.currentAntardasha.startDate),
        endDate: adminDb.Timestamp.fromDate(kundali.dasha.currentAntardasha.endDate),
      },
      currentPratyantardasha: {
        ...kundali.dasha.currentPratyantardasha,
        startDate: adminDb.Timestamp.fromDate(kundali.dasha.currentPratyantardasha.startDate),
        endDate: adminDb.Timestamp.fromDate(kundali.dasha.currentPratyantardasha.endDate),
      },
    })

    // Phase S: Consume ticket after successful generation
    try {
      await consumeFeatureTicket(uid, featureKey)
    } catch (err: any) {
      console.error('Ticket consumption error:', err)
    }

    return NextResponse.json({
      success: true,
      kundali: {
        ...kundali,
        meta: {
          ...kundali.meta,
          generatedAt: kundali.meta.generatedAt.toISOString(),
        },
      },
    })
  } catch (error: any) {
    console.error('Kundali generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate kundali' },
      { status: 500 }
    )
  }
}

