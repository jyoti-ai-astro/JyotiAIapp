import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'

export const dynamic = 'force-dynamic'

/**
 * Get Chat Details API
 * Milestone 10 - Step 6
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  return withAdminAuth(
    async (req, admin) => {
      if (!adminDb) {
        return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
      }

      try {
        const { chatId } = params
        const { searchParams } = new URL(req.url)
        const userId = searchParams.get('userId')

        if (!userId) {
          return NextResponse.json({ error: 'userId is required' }, { status: 400 })
        }

        const chatRef = adminDb
          .collection('guruChat')
          .doc(userId)
          .collection('messages')
          .doc(chatId)
        const chatSnap = await chatRef.get()

        if (!chatSnap.exists) {
          return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
        }

        const chatData = chatSnap.data()

        // Analyze context used
        const contextUsed = chatData?.contextUsed || {}
        const sources = chatData?.sources || []
        const ragDocs = sources.map((s: any) => s.id)

        return NextResponse.json({
          success: true,
          chat: {
            id: chatId,
            userId,
            ...chatData,
            analysis: {
              contextUsed,
              ragDocs,
              sources,
              confidence: chatData?.confidence || 0,
            },
          },
        })
      } catch (error: any) {
        console.error('Get chat error:', error)
        return NextResponse.json(
          { error: error.message || 'Failed to get chat' },
          { status: 500 }
        )
      }
    },
    'guru.read'
  )(request)
}

/**
 * Add Feedback API
 * Milestone 10 - Step 6
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  return withAdminAuth(
    async (req, admin) => {
      if (!adminDb) {
        return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
      }

      try {
        const { chatId } = params
        const { userId, feedback, rating, hallucination } = await req.json()

        if (!userId) {
          return NextResponse.json({ error: 'userId is required' }, { status: 400 })
        }

        const chatRef = adminDb
          .collection('guruChat')
          .doc(userId)
          .collection('messages')
          .doc(chatId)

        await chatRef.update({
          feedback: {
            rating,
            comment: feedback,
            hallucination: hallucination || false,
            reviewedBy: admin.uid,
            reviewedAt: new Date(),
          },
        })

        return NextResponse.json({ success: true })
      } catch (error: any) {
        console.error('Add feedback error:', error)
        return NextResponse.json(
          { error: error.message || 'Failed to add feedback' },
          { status: 500 }
        )
      }
    },
    'guru.write'
  )(request)
}

