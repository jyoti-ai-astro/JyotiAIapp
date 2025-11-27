import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'

/**
 * Search Users API
 * Milestone 10 - Step 3
 */
export async function GET(request: NextRequest) {
  return withAdminAuth(async (req, admin) => {
    if (!adminDb) {
      return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
    }

    try {
      const { searchParams } = new URL(req.url)
      const query = searchParams.get('q') || ''
      const limit = parseInt(searchParams.get('limit') || '50')

      if (!query) {
        return NextResponse.json({ error: 'Search query is required' }, { status: 400 })
      }

      const users: any[] = []

      // Search by email
      const emailSnapshot = await adminDb
        .collection('users')
        .where('email', '>=', query)
        .where('email', '<=', query + '\uf8ff')
        .limit(limit)
        .get()

      emailSnapshot.forEach((doc) => {
        users.push({
          uid: doc.id,
          ...doc.data(),
        })
      })

      // Search by name (if email search didn't find enough)
      if (users.length < limit) {
        const nameSnapshot = await adminDb
          .collection('users')
          .where('name', '>=', query)
          .where('name', '<=', query + '\uf8ff')
          .limit(limit - users.length)
          .get()

        nameSnapshot.forEach((doc) => {
          if (!users.find((u) => u.uid === doc.id)) {
            users.push({
              uid: doc.id,
              ...doc.data(),
            })
          }
        })
      }

      return NextResponse.json({
        success: true,
        users,
        count: users.length,
      })
    } catch (error: any) {
      console.error('User search error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to search users' },
        { status: 500 }
      )
    }
  })(request)
}

