import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'

export const dynamic = 'force-dynamic'

function toIso(value: any): string | null {
  if (!value) return null
  if (typeof value?.toDate === 'function') return value.toDate().toISOString()
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

function sanitizeMessage(id: string, userId: string, data: Record<string, any>) {
  const content = String(data.content ?? data.message ?? data.text ?? '')
  return {
    id,
    userId,
    role: data.role || data.sender || 'unknown',
    createdAt: toIso(data.createdAt),
    model: data.model || data.provider || null,
    contentPreview: content.slice(0, 240),
    contentLength: content.length,
    error: data.error || data.errorMessage || null,
  }
}

export async function GET(request: NextRequest) {
  return withAdminAuth(
    async (req) => {
      if (!adminDb) return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })

      try {
        const { searchParams } = new URL(req.url)
        const userId = (searchParams.get('userId') || '').trim()
        const requestedLimit = Number.parseInt(searchParams.get('limit') || '100', 10)
        const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 100
        let chats: any[] = []

        if (userId) {
          const snapshot = await adminDb.collection('guruChat').doc(userId).collection('messages').orderBy('createdAt', 'desc').limit(limit).get()
          chats = snapshot.docs.map((doc) => sanitizeMessage(doc.id, userId, doc.data()))
        } else {
          const usersSnapshot = await adminDb.collection('users').limit(50).get()
          for (const userDoc of usersSnapshot.docs) {
            const snapshot = await adminDb.collection('guruChat').doc(userDoc.id).collection('messages').orderBy('createdAt', 'desc').limit(10).get()
            snapshot.docs.forEach((doc) => chats.push(sanitizeMessage(doc.id, userDoc.id, doc.data())))
          }
          chats.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
          chats = chats.slice(0, limit)
        }

        return NextResponse.json({ success: true, chats, count: chats.length })
      } catch (error: any) {
        console.error('List Guru chats error:', error)
        return NextResponse.json({ error: error.message || 'Failed to list chats' }, { status: 500 })
      }
    },
    'guru.read'
  )(request)
}
