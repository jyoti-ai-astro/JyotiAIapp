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
        .orderBy('createdAt', 'desc')
        .limit(200)
        .get()

      const webhookTypes = new Set([
        'webhook.received',
        'webhook.verified',
        'webhook.failed',
      ])

      const events = logsSnapshot.docs
        .filter((doc) => webhookTypes.has(doc.data().type))
        .slice(0, 20)
        .map((doc) => ({
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
