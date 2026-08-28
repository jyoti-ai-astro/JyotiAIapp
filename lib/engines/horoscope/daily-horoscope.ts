/**
 * Daily Horoscope Engine
 * Part B - Section 8: Notifications & Daily Insights
 * Milestone 7 - Step 2
 * 
 * Generates daily horoscope predictions based on user's Rashi
 */

import { envVars } from '@/lib/env/env.mjs'
import {
  aiMalformedResponse,
  aiNetworkError,
  aiNotConfigured,
  classifyAIResponseError,
} from '@/lib/ai/provider-errors'
import { retrieveRelevantDocuments, type RAGResult } from '@/lib/rag/rag-service'
import {
  assertAIProviderAvailable,
  clearAIProviderFailure,
  recordAIProviderFailure,
} from '@/lib/ai/provider-health'

export interface DailyHoroscope {
  date: string
  rashi: string
  moonSign: string
  sunSign?: string
  ascendant?: string
  general: string
  love: string
  career: string
  money: string
  health: string
  luckyColor: string
  luckyNumber: number
  dos: string[]
  donts: string[]
  energyLevel: 'low' | 'medium' | 'high'
}

/**
 * Generate daily horoscope for a user
 */
export async function generateDailyHoroscope(
  rashi: string,
  moonSign?: string,
  sunSign?: string,
  ascendant?: string
): Promise<DailyHoroscope> {
  const today = new Date()
  const dateString = today.toISOString().split('T')[0]
  
  // Retrieve RAG insights for the Rashi
  const ragQuery = `Daily horoscope for ${rashi} rashi on ${dateString}`
  const ragResults = await retrieveHoroscopeKnowledge(ragQuery)
  
  // Build AI prompt
  const prompt = buildHoroscopePrompt(rashi, moonSign, sunSign, ascendant, ragResults, dateString)
  
  // Generate horoscope using AI
  const horoscope = await generateAIHoroscope(prompt, rashi, moonSign, sunSign, ascendant)
  
  return horoscope
}

/**
 * Build horoscope prompt
 */
function buildHoroscopePrompt(
  rashi: string,
  moonSign: string | undefined,
  sunSign: string | undefined,
  ascendant: string | undefined,
  ragResults: RAGResult,
  dateString: string
): string {
  const systemPrompt = `You are an expert Vedic astrologer. Generate a daily horoscope for the given Rashi.

Provide predictions in the following structure:
1. General prediction (overall day energy)
2. Love/Relationships
3. Career/Work
4. Money/Finance
5. Health
6. Lucky Color
7. Lucky Number (1-9)
8. Dos (2-3 things to do)
9. Don'ts (2-3 things to avoid)
10. Energy Level (low/medium/high)

Be specific, practical, and positive. Focus on actionable guidance.`

  const userPrompt = `Generate daily horoscope for:
- Rashi: ${rashi}
${moonSign ? `- Moon Sign: ${moonSign}` : ''}
${sunSign ? `- Sun Sign: ${sunSign}` : ''}
${ascendant ? `- Ascendant: ${ascendant}` : ''}
- Date: ${dateString}

Relevant Knowledge:
${ragResults.documents.map((doc: any) => `- ${doc.title}: ${doc.content}`).join('\n')}

Generate horoscope in JSON format:
{
  "general": "...",
  "love": "...",
  "career": "...",
  "money": "...",
  "health": "...",
  "luckyColor": "...",
  "luckyNumber": 1-9,
  "dos": ["...", "..."],
  "donts": ["...", "..."],
  "energyLevel": "low|medium|high"
}`

  return `${systemPrompt}\n\n${userPrompt}`
}

/**
 * Generate horoscope using AI
 */
async function retrieveHoroscopeKnowledge(query: string): Promise<RAGResult> {
  try {
    return await retrieveRelevantDocuments(query, 5, 'astrology')
  } catch (error) {
    console.error('Daily horoscope RAG retrieval degraded:', error)
    return { documents: [], query, totalResults: 0 }
  }
}

async function generateAIHoroscope(
  prompt: string,
  rashi: string,
  moonSign?: string,
  sunSign?: string,
  ascendant?: string
): Promise<DailyHoroscope> {
  const provider = envVars.ai.provider
  const openaiApiKey = envVars.ai.openaiApiKey
  const geminiApiKey = envVars.ai.geminiApiKey
  
  if (provider === 'gemini' && geminiApiKey) {
    return generateGeminiHoroscope(prompt, rashi, moonSign, sunSign, ascendant)
  } else if (openaiApiKey) {
    return generateOpenAIHoroscope(prompt, rashi, moonSign, sunSign, ascendant)
  }

  throw aiNotConfigured('Daily horoscope AI')
}

/**
 * Generate horoscope using OpenAI
 */
async function generateOpenAIHoroscope(
  prompt: string,
  rashi: string,
  moonSign?: string,
  sunSign?: string,
  ascendant?: string
): Promise<DailyHoroscope> {
  const openaiApiKey = envVars.ai.openaiApiKey
  const openaiModel = envVars.ai.predictionModelName
  if (!openaiApiKey) {
    throw aiNotConfigured('OpenAI')
  }
  
  assertAIProviderAvailable('OpenAI')

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
    const providerError = aiNetworkError('OpenAI')
    recordAIProviderFailure('OpenAI', providerError)
    throw providerError
  }
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    const providerError = classifyAIResponseError(
      'OpenAI',
      response,
      error
    )
    recordAIProviderFailure('OpenAI', providerError)
    throw providerError
  }
  
  const data = await response.json()
  const content = data.choices?.[0]?.message?.content
  if (!content || typeof content !== 'string') {
    throw aiMalformedResponse('OpenAI')
  }
  
  try {
    const horoscope = JSON.parse(content)
    const normalized = normalizeHoroscope(
      horoscope,
      rashi,
      moonSign,
      sunSign,
      ascendant
    )
    clearAIProviderFailure('OpenAI')
    return normalized
  } catch {
    throw aiMalformedResponse('OpenAI')
  }
}

/**
 * Generate horoscope using Gemini
 */
async function generateGeminiHoroscope(
  prompt: string,
  rashi: string,
  moonSign?: string,
  sunSign?: string,
  ascendant?: string
): Promise<DailyHoroscope> {
  const geminiApiKey = envVars.ai.geminiApiKey
  if (!geminiApiKey) {
    throw aiNotConfigured('Gemini')
  }
  
  let response: Response
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
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
    const horoscope = JSON.parse(content)
    return normalizeHoroscope(horoscope, rashi, moonSign, sunSign, ascendant)
  } catch {
    throw aiMalformedResponse('Gemini')
  }
}

function normalizeHoroscope(
  horoscope: any,
  rashi: string,
  moonSign?: string,
  sunSign?: string,
  ascendant?: string
): DailyHoroscope {
  const energyLevel = ['low', 'medium', 'high'].includes(horoscope.energyLevel)
    ? horoscope.energyLevel
    : 'medium'

  return {
    date: new Date().toISOString().split('T')[0],
    rashi,
    moonSign: moonSign || rashi,
    sunSign,
    ascendant,
    general: String(horoscope.general || ''),
    love: String(horoscope.love || ''),
    career: String(horoscope.career || ''),
    money: String(horoscope.money || ''),
    health: String(horoscope.health || ''),
    luckyColor: String(horoscope.luckyColor || 'Gold'),
    luckyNumber: Number.isInteger(horoscope.luckyNumber) ? horoscope.luckyNumber : 7,
    dos: Array.isArray(horoscope.dos) ? horoscope.dos.map(String) : [],
    donts: Array.isArray(horoscope.donts) ? horoscope.donts.map(String) : [],
    energyLevel,
  }
}
