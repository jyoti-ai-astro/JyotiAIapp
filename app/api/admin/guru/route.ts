import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'

export const dynamic = 'force-dynamic'

/**
 * List Guru Chats API
 * Milestone 10 - Step 6
 */
export async function GET(request: NextRequest) {
  return withAdminAuth(
    async (req, admin) => {
      if (!adminDb) {
        return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
      }

      try {
        const { searchParams } = new URL(req.url)
        const userId = searchParams.get('userId')
        const limit = parseInt(searchParams.get('limit') || '100')

        let chats: any[] = []

        if (userId) {
          // Get chats for specific user
          const chatsSnapshot = await adminDb
            .collection('guruChat')
            .doc(userId)
            .collection('messages')
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .get()

          chats = chatsSnapshot.docs.map((doc) => ({
            id: doc.id,
            userId,
            ...doc.data(),
          }))
        } else {
          // Get all chats (requires iterating through users)
          const usersSnapshot = await adminDb.collection('users').limit(50).get()

          for (const userDoc of usersSnapshot.docs) {
            const userChatsSnapshot = await adminDb
              .collection('guruChat')
              .doc(userDoc.id)
              .collection('messages')
              .orderBy('createdAt', 'desc')
              .limit(10)
              .get()

            userChatsSnapshot.docs.forEach((doc) => {
              chats.push({
                id: doc.id,
                userId: userDoc.id,
                ...doc.data(),
              })
            })
          }

          // Sort by createdAt
          chats.sort((a, b) => {
            const aTime = a.createdAt?.toDate?.()?.getTime() || 0
            const bTime = b.createdAt?.toDate?.()?.getTime() || 0
            return bTime - aTime
          })

          chats = chats.slice(0, limit)
        }

        return NextResponse.json({
          success: true,
          chats,
          count: chats.length,
        })
      } catch (error: any) {
        console.error('List Guru chats error:', error)
        return NextResponse.json(
          { error: error.message || 'Failed to list chats' },
          { status: 500 }
        )
      }
    },
    'guru.read'
  )(request)
}

