/**
 * AI Ritual Engine (Puja/Remedy)
 * Part B - Section 5: AI Guru
 * Milestone 8 - Step 9
 * 
 * Generates personalized rituals and remedies using AI
 */

import { retrieveRelevantDocuments } from '@/lib/rag/rag-service'

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
  },
  numerology?: {
    lifePathNumber: number
    destinyNumber: number
  }
): Promise<Ritual> {
  // Retrieve relevant RAG documents
  const ragQuery = `Ritual for ${purpose} based on Vedic astrology`
  const ragResults = await retrieveRelevantDocuments(ragQuery, 5, 'remedies')

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
  ragResults: any
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
// Phase 31 - F46: Use validated environment variables
import { envVars } from '@/lib/env/env.mjs'

async function generateAIRitual(prompt: string, purpose: string): Promise<Ritual> {
  const provider = envVars.ai.provider
  const openaiApiKey = envVars.ai.openaiApiKey
  const geminiApiKey = envVars.ai.geminiApiKey

  if (provider === 'gemini' && geminiApiKey) {
    return generateGeminiRitual(prompt, purpose)
  } else if (openaiApiKey) {
    return generateOpenAIRitual(prompt, purpose)
  } else {
    return createFallbackRitual(purpose)
  }
}

/**
 * Generate ritual using OpenAI
 */
async function generateOpenAIRitual(prompt: string, purpose: string): Promise<Ritual> {
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
    return JSON.parse(content) as Ritual
  } catch (e) {
    return createFallbackRitual(purpose)
  }
}

/**
 * Generate ritual using Gemini
 */
async function generateGeminiRitual(prompt: string, purpose: string): Promise<Ritual> {
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
    return JSON.parse(content) as Ritual
  } catch (e) {
    return createFallbackRitual(purpose)
  }
}

/**
 * Create fallback ritual
 */
function createFallbackRitual(purpose: string): Ritual {
  return {
    type: 'puja',
    name: 'Ganesha Puja',
    deity: 'Lord Ganesha',
    purpose: `Remedy for ${purpose}`,
    procedure: [
      'Clean the puja area',
      'Place Ganesha idol or image',
      'Light incense and lamp',
      'Offer flowers and fruits',
      'Chant Ganesha mantras',
      'Perform aarti',
      'Seek blessings',
    ],
    timing: {
      bestDays: ['Tuesday', 'Thursday'],
      bestTime: 'Morning',
      duration: '21 days',
    },
    materials: ['Ganesha idol', 'Incense', 'Lamp', 'Flowers', 'Fruits'],
    mantra: 'Om Gam Ganapataye Namaha',
    benefits: ['Removes obstacles', 'Brings success', 'Enhances wisdom'],
    precautions: ['Maintain purity', 'Perform with devotion', 'Follow timing'],
  }
}

