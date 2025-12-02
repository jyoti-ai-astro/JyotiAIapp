import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { storeKnowledgeDocument } from '@/lib/rag/rag-service'

/**
 * Knowledge Ingestion API
 * Part B - Section 5: RAG Engine
 * Milestone 5 - Step 3
 * 
 * Allows admin to upload knowledge into the Guru Brain
 */
export async function POST(request: NextRequest) {
  try {
    // Verify session
    const sessionCookie = request.cookies.get('session')?.value
    if (!sessionCookie || !adminAuth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true)
    const uid = decodedClaims.uid

    // Check if user is admin
    if (!adminDb) {
      return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
    }

    const userRef = adminDb.collection('users').doc(uid)
    const userSnap = await userRef.get()

    if (!userSnap.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userData = userSnap.data()
    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { title, content, category, tags } = await request.json()

    if (!title || !content || !category) {
      return NextResponse.json(
        { error: 'Title, content, and category are required' },
        { status: 400 }
      )
    }

    // Check Pinecone configuration
    const { envVars } = await import('@/lib/env/env.mjs')
    if (!envVars.pinecone.apiKey || !envVars.pinecone.indexName) {
      return NextResponse.json(
        { error: 'PINECONE_API_KEY or PINECONE_INDEX_NAME missing. RAG service not configured.' },
        { status: 500 }
      )
    }

    // Store knowledge document
    let docId: string
    try {
      docId = await storeKnowledgeDocument({
        title,
        content,
        category,
        tags: tags || [],
      })
    } catch (ragError: any) {
      console.error('RAG storage error:', ragError)
      return NextResponse.json(
        { error: `RAG storage failed: ${ragError.message || 'Pinecone connection error'}` },
        { status: 500 }
      )
    }

    // Store in Firestore
    const knowledgeRef = adminDb.collection('knowledge_base').doc(docId)
    await knowledgeRef.set({
      title,
      content,
      category,
      tags: tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      docId,
      message: 'Knowledge document ingested successfully',
    })
  } catch (error: any) {
    console.error('Knowledge ingestion error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to ingest knowledge' },
      { status: 500 }
    )
  }
}

