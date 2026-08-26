/**
 * Admin Monitoring - Subscription Health
 * Phase Z - Production Validation & Monitoring
 */

import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  return withAdminAuth(
    async () => {
      try {
        if (!adminDb) {
          return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
        }

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

          if (status === 'active' || status === 'authenticated' || active) totalActive++
          else if (status === 'cancelled') totalCancelled++
          else if (status === 'expired' || status === 'completed') totalExpired++
          else if (status === 'pending' || status === 'created') totalPending++
        })

        return NextResponse.json({ totalActive, totalCancelled, totalExpired, totalPending })
      } catch (error: any) {
        console.error('Get subscription health error:', error)
        return NextResponse.json({ error: 'Failed to get subscription health' }, { status: 500 })
      }
    },
    'monitoring.read'
  )(request)
}
