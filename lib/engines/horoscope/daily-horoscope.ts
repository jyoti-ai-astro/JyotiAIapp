/**
 * Daily Horoscope Engine
 * Part B - Section 8: Notifications & Daily Insights
 * Milestone 7 - Step 2
 * 
 * Generates daily horoscope predictions based on user's Rashi
 */

import { retrieveRelevantDocuments } from '@/lib/rag/rag-service'

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
  const ragResults = await retrieveRelevantDocuments(ragQuery, 5, 'astrology')
  
  // Build AI prompt
  const prompt = buildHoroscopePrompt(rashi, moonSign, sunSign, ascendant, ragResults, dateString)
  
  // Generate horoscope using AI
  const horoscope = await generateAIHoroscope(prompt, rashi)
  
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
  ragResults: any,
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
// Phase 31 - F46: Use validated environment variables
import { envVars } from '@/lib/env/env.mjs'

async function generateAIHoroscope(prompt: string, rashi: string): Promise<DailyHoroscope> {
  const provider = envVars.ai.provider
  const openaiApiKey = envVars.ai.openaiApiKey
  const geminiApiKey = envVars.ai.geminiApiKey
  
  if (provider === 'gemini' && geminiApiKey) {
    return generateGeminiHoroscope(prompt, rashi)
  } else if (openaiApiKey) {
    return generateOpenAIHoroscope(prompt, rashi)
  } else {
    return createFallbackHoroscope(rashi)
  }
}

/**
 * Generate horoscope using OpenAI
 */
async function generateOpenAIHoroscope(prompt: string, rashi: string): Promise<DailyHoroscope> {
  const openaiApiKey = envVars.ai.openaiApiKey
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured')
  }
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are an expert Vedic astrologer. Always respond with valid JSON only.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    }),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(`OpenAI error: ${error.error?.message || 'Unknown error'}`)
  }
  
  const data = await response.json()
  const content = data.choices[0].message.content
  
  try {
    const horoscope = JSON.parse(content)
    return {
      date: new Date().toISOString().split('T')[0],
      rashi,
      moonSign: rashi,
      general: horoscope.general || '',
      love: horoscope.love || '',
      career: horoscope.career || '',
      money: horoscope.money || '',
      health: horoscope.health || '',
      luckyColor: horoscope.luckyColor || 'Gold',
      luckyNumber: horoscope.luckyNumber || 7,
      dos: horoscope.dos || [],
      donts: horoscope.donts || [],
      energyLevel: horoscope.energyLevel || 'medium',
    }
  } catch (e) {
    return createFallbackHoroscope(rashi)
  }
}

/**
 * Generate horoscope using Gemini
 */
async function generateGeminiHoroscope(prompt: string, rashi: string): Promise<DailyHoroscope> {
  const geminiApiKey = envVars.ai.geminiApiKey
  if (!geminiApiKey) {
    throw new Error('Gemini API key not configured')
  }
  
  const response = await fetch(
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
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Gemini error: ${error.error?.message || 'Unknown error'}`)
  }
  
  const data = await response.json()
  const content = data.candidates[0].content.parts[0].text
  
  try {
    const horoscope = JSON.parse(content)
    return {
      date: new Date().toISOString().split('T')[0],
      rashi,
      moonSign: rashi,
      general: horoscope.general || '',
      love: horoscope.love || '',
      career: horoscope.career || '',
      money: horoscope.money || '',
      health: horoscope.health || '',
      luckyColor: horoscope.luckyColor || 'Gold',
      luckyNumber: horoscope.luckyNumber || 7,
      dos: horoscope.dos || [],
      donts: horoscope.donts || [],
      energyLevel: horoscope.energyLevel || 'medium',
    }
  } catch (e) {
    return createFallbackHoroscope(rashi)
  }
}

/**
 * Create fallback horoscope
 */
function createFallbackHoroscope(rashi: string): DailyHoroscope {
  return {
    date: new Date().toISOString().split('T')[0],
    rashi,
    moonSign: rashi,
    general: `Today brings positive energy for ${rashi} natives. Focus on your goals and maintain balance.`,
    love: 'Relationships are harmonious. Express your feelings openly.',
    career: 'Good opportunities may arise. Stay focused and professional.',
    money: 'Financial matters are stable. Avoid impulsive spending.',
    health: 'Maintain regular exercise and balanced diet. Take care of your well-being.',
    luckyColor: 'Gold',
    luckyNumber: 7,
    dos: ['Meditate', 'Express gratitude', 'Stay positive'],
    donts: ['Avoid conflicts', 'Don\'t make hasty decisions', 'Avoid negative thoughts'],
    energyLevel: 'medium',
  }
}

