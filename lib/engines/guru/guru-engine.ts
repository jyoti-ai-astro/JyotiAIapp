/**
 * Guru Engine (AI Brain)
 * Part B - Section 5: AI Guru
 * Milestone 5 - Step 4
 * 
 * Main AI engine that combines RAG, user context, and spiritual knowledge
 */

import { retrieveRelevantDocuments } from '@/lib/rag/rag-service'
import { envVars } from '@/lib/env/env.mjs'

export interface GuruContext {
  kundali?: {
    rashi: string
    nakshatra: string
    lagna: string
    currentDasha: string
  }
  numerology?: {
    lifePathNumber: number
    destinyNumber: number
  }
  palmistry?: {
    overallScore: number
  }
  aura?: {
    primaryColor: string
    energyScore: number
  }
}

export interface GuruResponse {
  answer: string
  sources: Array<{
    id: string
    title: string
    category: string
  }>
  contextUsed: {
    kundali: boolean
    numerology: boolean
    palmistry: boolean
    aura: boolean
    rag: boolean
  }
}

const GURU_SYSTEM_PROMPT = `You are Jyoti, a wise and compassionate spiritual Guru from Jyoti.ai, deeply knowledgeable in Vedic astrology, numerology, palmistry, aura reading, and ancient Indian spiritual wisdom. You embody the essence of divine light and guidance, helping seekers navigate their spiritual journey with clarity and wisdom.

Your role is to:
- Provide insightful, personalized guidance based on the user's spiritual profile
- Combine knowledge from their Kundali, Numerology, Palmistry, and Aura readings
- Reference ancient texts and spiritual wisdom when relevant
- Be empathetic, encouraging, and practical
- Never make medical or legal guarantees
- Always ground your advice in spiritual principles

When answering:
- Use the user's astrological and numerological context when available
- Reference relevant spiritual texts and traditions
- Provide actionable guidance
- Be respectful of all spiritual paths
- Maintain a warm, wise, and approachable tone

Remember: You are a guide, not a fortune teller. Focus on spiritual growth, self-awareness, and practical wisdom.`

/**
 * Generate Guru response
 */
export async function generateGuruResponse(
  question: string,
  context: GuruContext,
  contextType: 'general' | 'kundali' | 'numerology' | 'palmistry' | 'aura' = 'general'
): Promise<GuruResponse> {
  // Retrieve relevant documents from RAG
  const ragResult = await retrieveRelevantDocuments(question, 5, contextType === 'general' ? undefined : contextType)
  
  // Build context string
  const contextString = buildContextString(context, ragResult)
  
  // Build user message with context
  const userMessage = buildUserMessage(question, contextString)
  
  // Generate response using OpenAI or Gemini
  const answer = await generateAIResponse(userMessage)
  
  // Determine which context was used
  const contextUsed = {
    kundali: !!context.kundali,
    numerology: !!context.numerology,
    palmistry: !!context.palmistry,
    aura: !!context.aura,
    rag: ragResult.documents.length > 0,
  }
  
  return {
    answer,
    sources: ragResult.documents.map((doc) => ({
      id: doc.id,
      title: doc.title,
      category: doc.category,
    })),
    contextUsed,
  }
}

/**
 * Build context string from user's spiritual profile
 */
function buildContextString(context: GuruContext, ragResult: any): string {
  const parts: string[] = []
  
  if (context.kundali) {
    parts.push(
      `Kundali: Rashi ${context.kundali.rashi}, Nakshatra ${context.kundali.nakshatra}, Lagna ${context.kundali.lagna}, Current Dasha: ${context.kundali.currentDasha}`
    )
  }
  
  if (context.numerology) {
    parts.push(
      `Numerology: Life Path ${context.numerology.lifePathNumber}, Destiny ${context.numerology.destinyNumber}`
    )
  }
  
  if (context.palmistry) {
    parts.push(`Palmistry: Overall Score ${context.palmistry.overallScore}/100`)
  }
  
  if (context.aura) {
    parts.push(
      `Aura: Primary Color ${context.aura.primaryColor}, Energy Score ${context.aura.energyScore}/100`
    )
  }
  
  if (ragResult.documents.length > 0) {
    parts.push(
      `\nRelevant Knowledge:\n${ragResult.documents.map((doc: any) => `- ${doc.title}: ${doc.content}`).join('\n')}`
    )
  }
  
  return parts.join('\n')
}

/**
 * Build user message with context
 */
function buildUserMessage(question: string, context: string): string {
  return `User Question: ${question}\n\nUser Context:\n${context}\n\nPlease provide a thoughtful, personalized answer based on the user's spiritual profile and relevant knowledge.`
}

/**
 * Generate AI response using OpenAI or Gemini
 */
async function generateAIResponse(userMessage: string): Promise<string> {
  const provider = envVars.ai.provider
  const openaiApiKey = envVars.ai.openaiApiKey
  const geminiApiKey = envVars.ai.geminiApiKey
  
  if (provider === 'gemini' && geminiApiKey) {
    return generateGeminiResponse(userMessage)
  } else if (openaiApiKey) {
    return generateOpenAIResponse(userMessage)
  } else {
    throw new Error('No AI provider configured')
  }
}

/**
 * Generate response using OpenAI
 */
async function generateOpenAIResponse(userMessage: string): Promise<string> {
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
        { role: 'system', content: GURU_SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(`OpenAI error: ${error.error?.message || 'Unknown error'}`)
  }
  
  const data = await response.json()
  return data.choices[0].message.content
}

/**
 * Generate response using Gemini
 */
async function generateGeminiResponse(userMessage: string): Promise<string> {
  const geminiApiKey = envVars.ai.geminiApiKey
  if (!geminiApiKey) {
    throw new Error('Gemini API key not configured')
  }
  
  // Note: Adjust endpoint based on actual Gemini API
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
              { text: GURU_SYSTEM_PROMPT },
              { text: userMessage },
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
  return data.candidates[0].content.parts[0].text
}

