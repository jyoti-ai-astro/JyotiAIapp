/**
 * Embedding Generation Service
 * Part B - Section 5: RAG Engine
 * Milestone 5 - Step 2
 * 
 * Supports OpenAI and Gemini embeddings
 */

// Phase 31 - F46: Use validated environment variables
import { envVars } from '@/lib/env/env.mjs'

const EMBEDDING_PROVIDER = envVars.ai.embeddingProvider
const OPENAI_API_KEY = envVars.ai.openaiApiKey
const GEMINI_API_KEY = envVars.ai.geminiApiKey

/**
 * Generate embedding for text
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (EMBEDDING_PROVIDER === 'gemini' && GEMINI_API_KEY) {
    return generateGeminiEmbedding(text)
  } else if (OPENAI_API_KEY) {
    return generateOpenAIEmbedding(text)
  } else {
    throw new Error('No embedding provider configured')
  }
}

/**
 * Generate embedding using OpenAI
 */
async function generateOpenAIEmbedding(text: string): Promise<number[]> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured')
  }

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`OpenAI embedding error: ${error.error?.message || 'Unknown error'}`)
  }

  const data = await response.json()
  return data.data[0].embedding
}

/**
 * Generate embedding using Gemini
 */
async function generateGeminiEmbedding(text: string): Promise<number[]> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured')
  }

  // Note: Gemini embedding API endpoint may vary
  // This is a placeholder - adjust based on actual Gemini API
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'models/embedding-001',
        content: {
          parts: [{ text }],
        },
      }),
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Gemini embedding error: ${error.error?.message || 'Unknown error'}`)
  }

  const data = await response.json()
  return data.embedding.values
}

