/**
 * Admin Monitoring - Payment Failures
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

        const logsSnapshot = await adminDb
          .collection('app_logs')
          .where('type', '==', 'payment.failed')
          .orderBy('createdAt', 'desc')
          .limit(20)
          .get()

        const failures = logsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
        }))

        return NextResponse.json(failures)
      } catch (error: any) {
        console.error('Get payment failures error:', error)
        return NextResponse.json({ error: 'Failed to get payment failures' }, { status: 500 })
      }
    },
    'monitoring.read'
  )(request)
}
