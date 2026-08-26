export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'

function iso(value: any) {
  return value?.toDate?.()?.toISOString?.() || (value instanceof Date ? value.toISOString() : value || null)
}

export async function POST(request: NextRequest) {
  return withAdminAuth(
    async () => NextResponse.json(
      { error: 'Direct /tmp backups are retired. Production backups require durable object storage and a verified restore contract.' },
      { status: 409 }
    ),
    'backup.write'
  )(request)
}

export async function GET(request: NextRequest) {
  return withAdminAuth(
    async () => {
      if (!adminDb) return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
      try {
        const snapshot = await adminDb.collection('backups').orderBy('createdAt', 'desc').limit(50).get()
        const backups = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            status: data.status || (data.path ? 'legacy' : 'unknown'),
            collections: Array.isArray(data.collections) ? data.collections.slice(0, 50) : data.collections || 'all',
            createdAt: iso(data.createdAt),
            createdBy: data.createdBy || null,
            storage: data.storage || (data.path ? 'legacy-ephemeral' : null),
          }
        })
        return NextResponse.json({ success: true, backups })
      } catch (error) {
        console.error('List backups error:', error)
        return NextResponse.json({ error: 'Failed to list backups' }, { status: 500 })
      }
    },
    'backup.read'
  )(request)
}
