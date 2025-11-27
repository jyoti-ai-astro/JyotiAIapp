import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'
import { upsertEmbedding, deleteEmbedding } from '@/lib/rag/pinecone-client'
import { generateEmbedding } from '@/lib/rag/rag-service'

/**
 * List Knowledge Documents API
 * Milestone 10 - Step 7
 */
export async function GET(request: NextRequest) {
  return withAdminAuth(
    async (req, admin) => {
      if (!adminDb) {
        return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
      }

      try {
        const { searchParams } = new URL(req.url)
        const category = searchParams.get('category')
        const limit = parseInt(searchParams.get('limit') || '50')

        let query: any = adminDb.collection('knowledge_base')

        if (category) {
          query = query.where('category', '==', category)
        }

        const snapshot = await query.orderBy('createdAt', 'desc').limit(limit).get()

        const documents = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        return NextResponse.json({
          success: true,
          documents,
          count: documents.length,
        })
      } catch (error: any) {
        console.error('List knowledge error:', error)
        return NextResponse.json(
          { error: error.message || 'Failed to list documents' },
          { status: 500 }
        )
      }
    },
    'knowledge.read'
  )(request)
}

/**
 * Create Knowledge Document API
 * Milestone 10 - Step 7
 */
export async function POST(request: NextRequest) {
  return withAdminAuth(
    async (req, admin) => {
      if (!adminDb) {
        return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
      }

      try {
        const { title, content, category, tags } = await req.json()

        if (!title || !content || !category) {
          return NextResponse.json(
            { error: 'title, content, and category are required' },
            { status: 400 }
          )
        }

        // Generate embedding
        const embedding = await generateEmbedding(content)

        // Save to Firestore
        const docRef = adminDb.collection('knowledge_base').doc()
        await docRef.set({
          title,
          content,
          category,
          tags: tags || [],
          embedding,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: admin.uid,
        })

        // Upsert to Pinecone
        await upsertEmbedding(docRef.id, embedding, {
          title,
          content,
          category,
          tags: tags || [],
        })

        return NextResponse.json({
          success: true,
          documentId: docRef.id,
        })
      } catch (error: any) {
        console.error('Create knowledge error:', error)
        return NextResponse.json(
          { error: error.message || 'Failed to create document' },
          { status: 500 }
        )
      }
    },
    'knowledge.write'
  )(request)
}

