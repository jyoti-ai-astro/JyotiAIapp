/**
 * Daily Horoscope Engine
 * Part B - Section 8: Notifications & Daily Insights
 * Milestone 7 - Step 2
 * 
 * Generates daily horoscope predictions based on user's Rashi
 */

import { callLLM } from '@/lib/ai/llm-client'
import { retrieveRelevantDocuments, type RAGResult } from '@/lib/rag/rag-service'

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
  const content = await callLLM(
    [
      {
        role: 'system',
        content:
          'You are an expert Vedic astrologer. Always respond with valid JSON only.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    undefined,
    {
      temperature: 0.7,
      maxTokens: 2000,
    }
  )

  let horoscope: any

  try {
    horoscope = JSON.parse(content)
  } catch {
    throw new Error('AI provider returned malformed horoscope JSON')
  }

  return normalizeHoroscope(
    horoscope,
    rashi,
    moonSign,
    sunSign,
    ascendant
  )
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
