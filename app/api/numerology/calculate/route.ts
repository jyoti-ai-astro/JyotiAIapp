import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { NumerologyCalculator } from '@/lib/engines/numerology/calculator'

export const dynamic = 'force-dynamic'

/**
 * Calculate Numerology
 * Part B - Section 4: Milestone 4 - Step 1
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

    const { fullName, birthDate, mobileNumber, vehicleNumber, houseNumber } = await request.json()

    if (!fullName || !birthDate) {
      return NextResponse.json(
        { error: 'Full name and birth date are required' },
        { status: 400 }
      )
    }

    // Calculate numerology
    const calculator = new NumerologyCalculator()
    const profile = calculator.calculate(
      fullName,
      birthDate,
      mobileNumber,
      vehicleNumber,
      houseNumber
    )

    // Save to Firestore
    if (adminDb) {
      const numerologyRef = adminDb.collection('users').doc(uid)
      await numerologyRef.update({
        numerology: profile,
        updatedAt: new Date(),
      })
    }

    return NextResponse.json({
      success: true,
      profile,
    })
  } catch (error: any) {
    console.error('Numerology calculation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to calculate numerology' },
      { status: 500 }
    )
  }
}
