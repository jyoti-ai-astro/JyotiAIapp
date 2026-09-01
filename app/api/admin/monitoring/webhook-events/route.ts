/**
 * Admin Monitoring - Webhook Events
 *
 * Phase Z - Production Validation & Monitoring
 */

import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'

export const dynamic = 'force-dynamic'

export const GET = withAdminAuth(
  async () => {
    try {
      if (!adminDb) {
        return NextResponse.json(
          { error: 'Firestore not initialized' },
          { status: 500 }
        )
      }

      const logsSnapshot = await adminDb
        .collection('app_logs')
        .where(
          'type',
          'in',
          ['webhook.received', 'webhook.verified', 'webhook.failed']
        )
        .orderBy('createdAt', 'desc')
        .limit(20)
        .get()

      const events = logsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      }))

      return NextResponse.json(events)
    } catch (error: any) {
      console.error('Get webhook events error:', error)

      return NextResponse.json(
        { error: error.message || 'Failed to get webhook events' },
        { status: 500 }
      )
    }
  },
  'logs.read'
)

void (null as unknown as NextRequest)
