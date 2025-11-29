/**
 * RAG Index - Main RAG Interface
 * 
 * MEGA BUILD 1 - Phase 7 Core
 * Main entry point for RAG operations
 */

export { retrieveRelevantDocuments, storeKnowledgeDocument, type RAGResult } from './rag-service'
export { generateEmbedding } from './rag-service'
export { initializePinecone, getPineconeIndex } from './pinecone-client'

/**
 * Get Guru RAG context with mode filtering
 */
export async function getGuruRagContext(query: string, mode?: string) {
  const { retrieveRelevantDocuments } = await import('./rag-service')
  
  // Map mode to category filter
  const categoryMap: Record<string, string> = {
    general: 'astrology',
    kundali: 'astrology',
    numerology: 'numerology',
    predictions: 'astrology',
    remedies: 'remedies',
    business: 'astrology',
    career: 'astrology',
    compatibility: 'astrology',
  }

  const categoryFilter = mode ? categoryMap[mode] : undefined

  return retrieveRelevantDocuments(query, 5, categoryFilter)
}

