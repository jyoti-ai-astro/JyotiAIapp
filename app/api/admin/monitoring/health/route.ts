/**
 * Admin Monitoring - Subscription Health
 * 
 * Phase Z - Production Validation & Monitoring
 */

import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Verify admin session
    const sessionCookie = request.cookies.get('session')?.value
    if (!sessionCookie || !adminAuth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true)
    
    // Check if user is admin
    if (decodedClaims.isAdmin !== true) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    if (!adminDb) {
      return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
    }

    // Get all subscriptions
    const subscriptionsSnapshot = await adminDb
      .collectionGroup('subscriptions')
      .where('razorpaySubscriptionId', '!=', null)
      .get()

    let totalActive = 0
    let totalCancelled = 0
    let totalExpired = 0
    let totalPending = 0

    subscriptionsSnapshot.forEach((doc) => {
      const data = doc.data()
      const status = data.status || 'unknown'
      const active = data.active === true

      if (status === 'active' || status === 'authenticated' || active) {
        totalActive++
      } else if (status === 'cancelled') {
        totalCancelled++
      } else if (status === 'expired' || status === 'completed') {
        totalExpired++
      } else if (status === 'pending' || status === 'created') {
        totalPending++
      }
    })

    return NextResponse.json({
      totalActive,
      totalCancelled,
      totalExpired,
      totalPending,
    })
  } catch (error: any) {
    console.error('Get subscription health error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get subscription health' },
      { status: 500 }
    )
  }
}

