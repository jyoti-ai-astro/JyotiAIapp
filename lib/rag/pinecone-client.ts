/**
 * Pinecone Vector DB Client
 * Part B - Section 5: RAG Engine
 * Milestone 5 - Step 2
 * 
 * Handles vector database operations for RAG
 */

// Phase 31 - F46: Use validated environment variables
import { Pinecone } from '@pinecone-database/pinecone'
import { envVars } from '@/lib/env/env.mjs'

const PINECONE_API_KEY = envVars.pinecone.apiKey
const PINECONE_ENVIRONMENT = envVars.pinecone.environment
const PINECONE_INDEX_NAME = envVars.pinecone.indexName
const NAMESPACE = 'jyotiai'

let pineconeClient: Pinecone | null = null
let pineconeIndex: any = null

/**
 * Initialize Pinecone client
 */
export async function initializePinecone(): Promise<boolean> {
  try {
    if (!PINECONE_API_KEY) {
      console.warn('Pinecone API key not configured')
      return false
    }

    if (!pineconeClient) {
      pineconeClient = new Pinecone({
        apiKey: PINECONE_API_KEY,
      })
    }

    if (!pineconeIndex) {
      pineconeIndex = pineconeClient.index(PINECONE_INDEX_NAME)
    }

    return true
  } catch (error) {
    console.error('Failed to initialize Pinecone:', error)
    return false
  }
}

/**
 * Get Pinecone index instance
 */
export async function getPineconeIndex() {
  const initialized = await initializePinecone()
  if (!initialized || !pineconeIndex) {
    throw new Error('Pinecone not initialized')
  }
  return pineconeIndex
}

/**
 * Upsert embeddings to Pinecone
 */
export async function upsertEmbeddings(
  vectors: Array<{
    id: string
    values: number[]
    metadata?: Record<string, any>
  }>
): Promise<void> {
  const index = await getPineconeIndex()
  await index.namespace(NAMESPACE).upsert(vectors)
}

/**
 * Query similar vectors from Pinecone
 */
export async function queryVectors(
  embedding: number[],
  topK: number = 5,
  filter?: Record<string, any>
): Promise<Array<{ id: string; score: number; metadata?: Record<string, any> }>> {
  const index = await getPineconeIndex()
  
  const queryRequest: any = {
    vector: embedding,
    topK,
    includeMetadata: true,
  }

  if (filter) {
    queryRequest.filter = filter
  }

  const queryResponse = await index.namespace(NAMESPACE).query(queryRequest)
  
  return (
    queryResponse.matches?.map((match: any) => ({
      id: match.id,
      score: match.score || 0,
      metadata: match.metadata,
    })) || []
  )
}

/**
 * Delete vectors by IDs
 */
export async function deleteVectors(ids: string[]): Promise<void> {
  const index = await getPineconeIndex()
  await index.namespace(NAMESPACE).deleteMany(ids)
}

/**
 * Delete all vectors in namespace (use with caution)
 */
export async function deleteAllVectors(): Promise<void> {
  const index = await getPineconeIndex()
  await index.namespace(NAMESPACE).deleteAll()
}

/**
 * Upsert single embedding (wrapper for API routes)
 */
export async function upsertEmbedding(
  id: string,
  values: number[],
  metadata?: Record<string, any>
): Promise<void> {
  await upsertEmbeddings([{ id, values, metadata }])
}

/**
 * Delete single embedding by ID (wrapper for API routes)
 */
export async function deleteEmbedding(id: string): Promise<void> {
  await deleteVectors([id])
}

