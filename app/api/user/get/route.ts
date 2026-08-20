import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { splitSubscriptionAndTickets } from '@/lib/payments/ticket-service'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Get session cookie
    const sessionCookie = request.cookies.get('session')?.value

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (!adminAuth) {
      return NextResponse.json(
        { error: 'Firebase Admin not initialized' },
        { status: 500 }
      )
    }

    // Verify session cookie
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true)
    const uid = decodedClaims.uid

    // Get user from Firestore
    if (!adminDb) {
      return NextResponse.json(
        { error: 'Firestore not initialized' },
        { status: 500 }
      )
    }

    const userRef = adminDb.collection('users').doc(uid)
    const userSnap = await userRef.get()

    if (!userSnap.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userData = userSnap.data()

    if (!userData) {
      return NextResponse.json({ error: 'User data unavailable' }, { status: 404 })
    }

    let entitlementSummary = null
    try {
      entitlementSummary = await splitSubscriptionAndTickets(uid)
    } catch (error) {
      console.error('Get user entitlement summary error:', error)
    }

    return NextResponse.json({
      success: true,
      user: {
        ...userData,
        settings: {
          notifications: userData.settings?.notifications ?? true,
          emailUpdates: userData.settings?.emailUpdates ?? true,
          soundEnabled: userData.settings?.soundEnabled ?? true,
        },
        entitlements: entitlementSummary
          ? {
              hasSubscription: entitlementSummary.hasSubscription,
              subscriptionPlan: entitlementSummary.subscriptionPlan || null,
              subscriptionExpiry: entitlementSummary.subscriptionExpiry?.toISOString?.() || null,
              tickets: entitlementSummary.tickets,
            }
          : null,
        createdAt: userData.createdAt?.toDate?.() || userData.createdAt,
        updatedAt: userData.updatedAt?.toDate?.() || userData.updatedAt,
        subscriptionExpiry: userData.subscriptionExpiry?.toDate?.() || userData.subscriptionExpiry,
      },
    })
  } catch (error: any) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get user' },
      { status: 500 }
    )
  }
}
