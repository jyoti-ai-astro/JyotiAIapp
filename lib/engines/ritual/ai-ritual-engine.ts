/**
 * AI Ritual Engine (Puja/Remedy)
 * Part B - Section 5: AI Guru
 * Milestone 8 - Step 9
 * 
 * Generates personalized rituals and remedies using AI
 */

import { envVars } from '@/lib/env/env.mjs'
import {
  aiMalformedResponse,
  aiNetworkError,
  aiNotConfigured,
  classifyAIResponseError,
} from '@/lib/ai/provider-errors'
import { retrieveRelevantDocuments, type RAGResult } from '@/lib/rag/rag-service'

export interface Ritual {
  type: 'puja' | 'mantra' | 'yantra' | 'gemstone' | 'donation' | 'fasting'
  name: string
  deity?: string
  purpose: string
  procedure: string[]
  timing: {
    bestDays: string[]
    bestTime: string
    duration: string
  }
  materials: string[]
  mantra?: string
  benefits: string[]
  precautions: string[]
}

/**
 * Generate personalized ritual
 */
export async function generateRitual(
  purpose: string,
  kundali: {
    grahas: Record<string, any>
    bhavas: Record<string, any>
    dasha?: Record<string, any>
  },
  numerology?: {
    lifePathNumber: number
    destinyNumber: number
  }
): Promise<Ritual> {
  // Retrieve relevant RAG documents
  const ragQuery = `Ritual for ${purpose} based on Vedic astrology`
  const ragResults = await retrieveRitualKnowledge(ragQuery)

  // Build AI prompt
  const prompt = buildRitualPrompt(purpose, kundali, numerology, ragResults)

  // Generate ritual using AI
  const ritual = await generateAIRitual(prompt, purpose)

  return ritual
}

/**
 * Build ritual prompt
 */
function buildRitualPrompt(
  purpose: string,
  kundali: any,
  numerology: any,
  ragResults: RAGResult
): string {
  const systemPrompt = `You are an expert Vedic astrologer and ritual specialist. Generate a personalized ritual based on the user's astrological profile.

Provide a detailed ritual with:
1. Type (puja, mantra, yantra, gemstone, donation, fasting)
2. Name and deity (if applicable)
3. Purpose
4. Step-by-step procedure
5. Timing (best days, time, duration)
6. Required materials
7. Mantra (if applicable)
8. Benefits
9. Precautions

Be specific, practical, and grounded in Vedic traditions.`

  const userPrompt = `Generate a ritual for: ${purpose}

User Profile:
- Rashi: ${kundali.grahas?.moon?.sign || 'Unknown'}
- Nakshatra: ${kundali.grahas?.moon?.nakshatra || 'Unknown'}
- Current Dasha: ${kundali.dasha?.currentMahadasha?.planet || 'Unknown'}
- Life Path: ${numerology?.lifePathNumber || 'Unknown'}

Relevant Knowledge:
${ragResults.documents.map((doc: any) => `- ${doc.title}: ${doc.content}`).join('\n')}

Generate ritual in JSON format:
{
  "type": "puja|mantra|yantra|gemstone|donation|fasting",
  "name": "...",
  "deity": "...",
  "purpose": "...",
  "procedure": ["...", "..."],
  "timing": {
    "bestDays": ["...", "..."],
    "bestTime": "...",
    "duration": "..."
  },
  "materials": ["...", "..."],
  "mantra": "...",
  "benefits": ["...", "..."],
  "precautions": ["...", "..."]
}`

  return `${systemPrompt}\n\n${userPrompt}`
}

/**
 * Generate ritual using AI
 */
async function retrieveRitualKnowledge(query: string): Promise<RAGResult> {
  try {
    return await retrieveRelevantDocuments(query, 5, 'remedies')
  } catch (error) {
    console.error('Ritual RAG retrieval degraded:', error)
    return { documents: [], query, totalResults: 0 }
  }
}

async function generateAIRitual(prompt: string, purpose: string): Promise<Ritual> {
  const provider = envVars.ai.provider
  const openaiApiKey = envVars.ai.openaiApiKey
  const geminiApiKey = envVars.ai.geminiApiKey

  if (provider === 'gemini' && geminiApiKey) {
    return generateGeminiRitual(prompt, purpose)
  } else if (openaiApiKey) {
    return generateOpenAIRitual(prompt, purpose)
  }

  throw aiNotConfigured('Ritual AI')
}

/**
 * Generate ritual using OpenAI
 */
async function generateOpenAIRitual(prompt: string, purpose: string): Promise<Ritual> {
  const openaiApiKey = envVars.ai.openaiApiKey
  const openaiModel = envVars.ai.predictionModelName
  if (!openaiApiKey) {
    throw aiNotConfigured('OpenAI')
  }

  let response: Response
  try {
    response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: openaiModel,
        messages: [
          { role: 'system', content: 'You are an expert Vedic astrologer. Always respond with valid JSON only.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      }),
    })
  } catch {
    throw aiNetworkError('OpenAI')
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw classifyAIResponseError('OpenAI', response, error)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content
  if (!content || typeof content !== 'string') {
    throw aiMalformedResponse('OpenAI')
  }

  try {
    return JSON.parse(content) as Ritual
  } catch {
    throw aiMalformedResponse('OpenAI')
  }
}

/**
 * Generate ritual using Gemini
 */
async function generateGeminiRitual(prompt: string, purpose: string): Promise<Ritual> {
  const geminiApiKey = envVars.ai.geminiApiKey
  if (!geminiApiKey) {
    throw aiNotConfigured('Gemini')
  }

  let response: Response
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: 'You are an expert Vedic astrologer. Always respond with valid JSON only.\n\n' + prompt },
              ],
            },
          ],
        }),
      }
    )
  } catch {
    throw aiNetworkError('Gemini')
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw classifyAIResponseError('Gemini', response, error)
  }

  const data = await response.json()
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!content || typeof content !== 'string') {
    throw aiMalformedResponse('Gemini')
  }

  try {
    return JSON.parse(content) as Ritual
  } catch {
    throw aiMalformedResponse('Gemini')
  }
}
