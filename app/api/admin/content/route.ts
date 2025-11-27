import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'

/**
 * Get Content Templates API
 * Milestone 10 - Step 8
 */
export async function GET(request: NextRequest) {
  return withAdminAuth(
    async (req, admin) => {
      if (!adminDb) {
        return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
      }

      try {
        const { searchParams } = new URL(req.url)
        const type = searchParams.get('type') // horoscope, festival, ritual, notification, email

        const contentRef = adminDb.collection('content_templates')
        let query: any = contentRef

        if (type) {
          query = query.where('type', '==', type)
        }

        const snapshot = await query.get()
        const templates = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        return NextResponse.json({
          success: true,
          templates,
        })
      } catch (error: any) {
        console.error('Get content error:', error)
        return NextResponse.json(
          { error: error.message || 'Failed to get content' },
          { status: 500 }
        )
      }
    },
    'content.read'
  )(request)
}

/**
 * Update Content Template API
 * Milestone 10 - Step 8
 */
export async function POST(request: NextRequest) {
  return withAdminAuth(
    async (req, admin) => {
      if (!adminDb) {
        return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
      }

      try {
        const { type, id, content, metadata } = await req.json()

        if (!type || !content) {
          return NextResponse.json(
            { error: 'type and content are required' },
            { status: 400 }
          )
        }

        const contentRef = adminDb.collection('content_templates').doc(id || type)

        await contentRef.set(
          {
            type,
            content,
            metadata: metadata || {},
            updatedAt: new Date(),
            updatedBy: admin.uid,
          },
          { merge: true }
        )

        return NextResponse.json({ success: true })
      } catch (error: any) {
        console.error('Update content error:', error)
        return NextResponse.json(
          { error: error.message || 'Failed to update content' },
          { status: 500 }
        )
      }
    },
    'content.write'
  )(request)
}

