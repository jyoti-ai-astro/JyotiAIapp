export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'

function iso(value: any) {
  return value?.toDate?.()?.toISOString?.() || (value instanceof Date ? value.toISOString() : value || null)
}

export async function GET(request: NextRequest) {
  return withAdminAuth(
    async (req) => {
      if (!adminDb) return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
      try {
        const { searchParams } = new URL(req.url)
        const action = (searchParams.get('action') || '').trim()
        const limit = Math.min(Math.max(Number(searchParams.get('limit') || 100), 1), 200)
        let query: any = adminDb.collection('admin_audit')
        if (action) query = query.where('action', '==', action)
        const snapshot = await query.orderBy('createdAt', 'desc').limit(limit).get()
        const events = snapshot.docs.map((doc: any) => {
          const data = doc.data()
          return {
            id: doc.id,
            action: data.action || 'unknown',
            actorUid: data.actorUid || null,
            permission: data.permission || null,
            targetType: data.targetType || null,
            targetId: data.targetId || data.jobId || null,
            reason: typeof data.reason === 'string' ? data.reason.slice(0, 500) : null,
            changedKeys: Array.isArray(data.changedKeys) ? data.changedKeys.slice(0, 30) : [],
            requestId: data.requestId || data.correlationId || null,
            createdAt: iso(data.createdAt),
          }
        })
        return NextResponse.json({ success: true, events, count: events.length })
      } catch (error) {
        console.error('Admin audit list error:', error)
        return NextResponse.json({ error: 'Failed to list audit events' }, { status: 500 })
      }
    },
    'logs.read'
  )(request)
}
