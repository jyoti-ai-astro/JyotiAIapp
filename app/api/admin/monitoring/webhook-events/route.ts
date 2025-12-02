/**
 * Admin Monitoring - Webhook Events
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

    // Get recent webhook logs
    const logsSnapshot = await adminDb
      .collection('app_logs')
      .where('type', 'in', ['webhook.received', 'webhook.verified', 'webhook.failed'])
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
}

