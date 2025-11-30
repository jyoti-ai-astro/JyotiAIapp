/**
 * RAG Index - Main RAG Interface
 * 
 * MEGA BUILD 1 - Phase 7 Core
 * Super Phase C - Global RAG Engine (Pinecone)
 * Main entry point for RAG operations
 */

export { retrieveRelevantDocuments, storeKnowledgeDocument, type RAGResult } from './rag-service'
export { generateEmbedding } from './rag-service'
export { initializePinecone, getPineconeIndex } from './pinecone-client'

/**
 * Guru RAG Mode - Super Phase C
 */
export type GuruRagMode =
  | 'general'
  | 'career'
  | 'relationship'
  | 'health'
  | 'finance'
  | 'remedy'
  | 'nakshatra'
  | 'dasha'
  | 'compatibility'

/**
 * Guru RAG Chunk - Super Phase C
 */
export type GuruRagChunk = {
  id?: string
  title?: string
  snippet: string
  source?: string
  score?: number
}

/**
 * Get Guru RAG Context - Super Phase C
 * Production-grade RAG engine using Pinecone with graceful degradation
 */
export async function getGuruRagContext(params: {
  mode: GuruRagMode
  question: string
  astroContextSummary?: string
  topK?: number
  signal?: AbortSignal
}): Promise<{ chunks: GuruRagChunk[]; degraded: boolean }> {
  const { mode, question, astroContextSummary, topK = 5, signal } = params

  // Check if RAG is enabled
  const ragEnabled = process.env.GURU_RAG_ENABLED !== 'false'
  if (!ragEnabled) {
    return { chunks: [], degraded: true }
  }

  try {
    // Build query text (enhance with astro context if available)
    const queryText = astroContextSummary
      ? `${question} Context: ${astroContextSummary}`
      : question

    // Generate embedding
    const { generateEmbedding } = await import('./embeddings')
    const queryEmbedding = await generateEmbedding(queryText)

    // Query Pinecone
    const { queryVectors } = await import('./pinecone-client')
    
    // Build metadata filter by mode
    // Note: We use the same index with metadata filtering
    // If you want a separate index, update pinecone-client.ts to support multiple indices
    const filter: Record<string, any> = {
      mode: { $eq: mode },
      type: { $eq: 'guru' }, // Filter for guru-specific knowledge
    }

    const results = await queryVectors(queryEmbedding, topK, Object.keys(filter).length > 0 ? filter : undefined)

    // Map results to GuruRagChunk
    const chunks: GuruRagChunk[] = results.map((result) => ({
      id: result.id,
      title: result.metadata?.title,
      snippet: result.metadata?.content || result.metadata?.snippet || '',
      source: result.metadata?.source,
      score: result.score,
    }))

    return { chunks, degraded: false }
  } catch (error: any) {
    // Check if aborted
    if (signal?.aborted || error.name === 'AbortError') {
      return { chunks: [], degraded: true }
    }

    console.error('Error in Guru RAG retrieval:', error)
    return { chunks: [], degraded: true }
  }
}

