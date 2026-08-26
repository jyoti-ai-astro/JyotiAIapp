import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'

export const dynamic = 'force-dynamic'

function toIso(value: any) {
  if (!value) return null
  if (typeof value?.toDate === 'function') return value.toDate().toISOString()
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

export async function GET(request: NextRequest) {
  return withAdminAuth(
    async (req) => {
      if (!adminDb) {
        return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
      }

      try {
        const { searchParams } = new URL(req.url)
        const raw = (searchParams.get('q') || '').trim()
        const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '25', 10)))

        if (raw.length < 2) {
          return NextResponse.json({ error: 'Search query must be at least 2 characters' }, { status: 400 })
        }

        const users = new Map<string, any>()
        const collect = (snapshot: FirebaseFirestore.QuerySnapshot) => {
          snapshot.forEach((doc) => {
            if (users.size >= limit) return
            const data = doc.data()
            users.set(doc.id, {
              uid: doc.id,
              email: data.email || '',
              displayName: data.name || data.displayName || '',
              createdAt: toIso(data.createdAt),
              lastLoginAt: toIso(data.lastLoginAt),
              blocked: data.blocked === true,
              tickets: {
                aiGuruTickets: Number(data.aiGuruTickets || 0),
                kundaliTickets: Number(data.kundaliTickets || 0),
                lifetimePredictions: Number(data.lifetimePredictions || 0),
              },
            })
          })
        }

        const emailSnapshot = await adminDb
          .collection('users')
          .where('email', '>=', raw.toLowerCase())
          .where('email', '<=', raw.toLowerCase() + '\uf8ff')
          .limit(limit)
          .get()
        collect(emailSnapshot)

        if (users.size < limit) {
          const nameSnapshot = await adminDb
            .collection('users')
            .where('name', '>=', raw)
            .where('name', '<=', raw + '\uf8ff')
            .limit(limit - users.size)
            .get()
          collect(nameSnapshot)
        }

        return NextResponse.json({ success: true, users: Array.from(users.values()), count: users.size })
      } catch (error: any) {
        console.error('User search error:', error)
        return NextResponse.json({ error: 'Failed to search users' }, { status: 500 })
      }
    },
    'users.read'
  )(request)
}
