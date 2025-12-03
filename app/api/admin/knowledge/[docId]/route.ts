export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'
import { upsertEmbedding, deleteEmbedding } from '@/lib/rag/pinecone-client'
import { generateEmbedding } from '@/lib/rag/rag-service'

/**
 * Update Knowledge Document API
 * Milestone 10 - Step 7
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { docId: string } }
) {
  return withAdminAuth(
    async (req, admin) => {
      if (!adminDb) {
        return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
      }

      try {
        const { docId } = params
        const { title, content, category, tags } = await req.json()

        const docRef = adminDb.collection('knowledge_base').doc(docId)
        const docSnap = await docRef.get()

        if (!docSnap.exists) {
          return NextResponse.json({ error: 'Document not found' }, { status: 404 })
        }

        const updateData: any = {
          updatedAt: new Date(),
          updatedBy: admin.uid,
        }

        if (title) updateData.title = title
        if (content) {
          updateData.content = content
          // Regenerate embedding if content changed
          const embedding = await generateEmbedding(content)
          updateData.embedding = embedding

          // Update Pinecone
          await upsertEmbedding(docId, embedding, {
            title: title || docSnap.data()?.title,
            content,
            category: category || docSnap.data()?.category,
            tags: tags || docSnap.data()?.tags || [],
          })
        }
        if (category) updateData.category = category
        if (tags) updateData.tags = tags

        await docRef.update(updateData)

        return NextResponse.json({ success: true })
      } catch (error: any) {
        console.error('Update knowledge error:', error)
        return NextResponse.json(
          { error: error.message || 'Failed to update document' },
          { status: 500 }
        )
      }
    },
    'knowledge.write'
  )(request)
}

/**
 * Delete Knowledge Document API
 * Milestone 10 - Step 7
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { docId: string } }
) {
  return withAdminAuth(
    async (req, admin) => {
      if (!adminDb) {
        return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
      }

      try {
        const { docId } = params

        // Delete from Firestore
        await adminDb.collection('knowledge_base').doc(docId).delete()

        // Delete from Pinecone
        await deleteEmbedding(docId)

        return NextResponse.json({ success: true })
      } catch (error: any) {
        console.error('Delete knowledge error:', error)
        return NextResponse.json(
          { error: error.message || 'Failed to delete document' },
          { status: 500 }
        )
      }
    },
    'knowledge.delete'
  )(request)
}

/**
 * Regenerate Embeddings API
 * Milestone 10 - Step 7
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { docId: string } }
) {
  return withAdminAuth(
    async (req, admin) => {
      if (!adminDb) {
        return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
      }

      try {
        const { docId } = params

        const docRef = adminDb.collection('knowledge_base').doc(docId)
        const docSnap = await docRef.get()

        if (!docSnap.exists) {
          return NextResponse.json({ error: 'Document not found' }, { status: 404 })
        }

        const docData = docSnap.data()
        const content = docData?.content

        if (!content) {
          return NextResponse.json({ error: 'Document has no content' }, { status: 400 })
        }

        // Regenerate embedding
        const embedding = await generateEmbedding(content)

        // Update Firestore
        await docRef.update({
          embedding,
          updatedAt: new Date(),
          updatedBy: admin.uid,
        })

        // Update Pinecone
        await upsertEmbedding(docId, embedding, {
          title: docData.title,
          content,
          category: docData.category,
          tags: docData.tags || [],
        })

        return NextResponse.json({ success: true })
      } catch (error: any) {
        console.error('Regenerate embedding error:', error)
        return NextResponse.json(
          { error: error.message || 'Failed to regenerate embedding' },
          { status: 500 }
        )
      }
    },
    'knowledge.write'
  )(request)
}

