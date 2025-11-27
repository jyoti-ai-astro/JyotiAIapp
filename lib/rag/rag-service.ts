/**
 * RAG Service
 * Part B - Section 5: RAG Engine
 * Milestone 5 - Step 2
 * 
 * Handles retrieval-augmented generation operations
 */

import { upsertEmbeddings, queryVectors } from './pinecone-client'
import { generateEmbedding } from './embeddings'

export interface KnowledgeDocument {
  id: string
  title: string
  category: string
  tags: string[]
  content: string
  embedding?: number[]
  createdAt: Date
  updatedAt: Date
}

export interface RAGResult {
  documents: Array<{
    id: string
    title: string
    category: string
    content: string
    score: number
  }>
  query: string
  totalResults: number
}

/**
 * Store knowledge document with embedding
 */
export async function storeKnowledgeDocument(
  doc: Omit<KnowledgeDocument, 'id' | 'embedding' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  // Generate embedding
  const embedding = await generateEmbedding(doc.content)
  
  // Generate document ID
  const docId = `${doc.category}_${Date.now()}_${Math.random().toString(36).substring(7)}`
  
  // Store in Pinecone
  await upsertEmbeddings([
    {
      id: docId,
      values: embedding,
      metadata: {
        title: doc.title,
        category: doc.category,
        tags: doc.tags.join(','),
        content: doc.content.substring(0, 500), // Store first 500 chars in metadata
      },
    },
  ])
  
  return docId
}

/**
 * Retrieve relevant documents using RAG
 */
export async function retrieveRelevantDocuments(
  query: string,
  topK: number = 5,
  categoryFilter?: string,
  tagFilter?: string[]
): Promise<RAGResult> {
  // Generate query embedding
  const queryEmbedding = await generateEmbedding(query)
  
  // Build filter
  const filter: Record<string, any> = {}
  if (categoryFilter) {
    filter.category = { $eq: categoryFilter }
  }
  if (tagFilter && tagFilter.length > 0) {
    filter.tags = { $in: tagFilter }
  }
  
  // Query Pinecone
  const results = await queryVectors(
    queryEmbedding,
    topK,
    Object.keys(filter).length > 0 ? filter : undefined
  )
  
  return {
    documents: results.map((result) => ({
      id: result.id,
      title: result.metadata?.title || 'Untitled',
      category: result.metadata?.category || 'general',
      content: result.metadata?.content || '',
      score: result.score,
    })),
    query,
    totalResults: results.length,
  }
}

/**
 * Hybrid search (combines vector search with keyword search)
 * For now, uses vector search only - can be enhanced later
 */
export async function hybridSearch(
  query: string,
  topK: number = 5,
  categoryFilter?: string
): Promise<RAGResult> {
  // For now, use vector search
  // Can be enhanced with keyword matching later
  return retrieveRelevantDocuments(query, topK, categoryFilter)
}

