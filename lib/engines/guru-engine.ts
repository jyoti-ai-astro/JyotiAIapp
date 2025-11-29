/**
 * Guru Engine - High-Level Orchestrator
 * 
 * MEGA BUILD 1 - Phase 7 Core
 * Intelligent Guru chat with context-aware, DOB-aware, module-aware responses
 */

import { getCachedAstroContext } from './astro-context-builder'
import { buildGuruContext, deriveGuruModeFromQuestion, type GuruMode } from '@/lib/guru/guru-context'
import { retrieveRelevantDocuments } from '@/lib/rag/rag-service'
import type { AstroContext } from './astro-types'

/**
 * Guru message interface
 */
export interface GuruMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt?: string
}

/**
 * Guru response interface
 */
export interface GuruResponse {
  answer: string
  usedAstroContext?: boolean
  usedRag?: boolean
  suggestions?: string[]
  followUps?: string[]
}

/**
 * Run Guru Brain - Main orchestrator function
 */
export async function runGuruBrain(params: {
  userId: string | null
  messages: GuruMessage[]
  mode?: GuruMode
  userName?: string
  gender?: string
}): Promise<GuruResponse> {
  const { userId, messages, mode, userName, gender } = params

  // Get last user message
  const lastUserMessage = messages.filter((m) => m.role === 'user').slice(-1)[0]
  if (!lastUserMessage) {
    return {
      answer: 'Namaste. How may I guide you on your spiritual journey today?',
      usedAstroContext: false,
      usedRag: false,
    }
  }

  const userQuestion = lastUserMessage.content

  // 1. Load AstroContext if userId present
  let astroContext: AstroContext | null = null
  if (userId) {
    try {
      astroContext = await getCachedAstroContext(userId)
    } catch (error) {
      console.error('Error loading astro context:', error)
    }
  }

  // 2. Derive mode from question if not provided
  const derivedMode = mode || deriveGuruModeFromQuestion(userQuestion)

  // 3. Build Guru System Prompt
  const astroSummary = astroContext ? buildGuruContext({ userId, astroContext, userName, gender }) : ''
  
  const systemPrompt = buildGuruSystemPrompt({
    astroSummary,
    mode: derivedMode,
    userName,
  })

  // 4. Get RAG context (3-5 relevant spiritual knowledge chunks)
  let ragContext = ''
  let usedRag = false
  try {
    const ragResult = await getGuruRagContext(userQuestion, derivedMode)
    if (ragResult.documents.length > 0) {
      ragContext = ragResult.documents
        .map((doc) => `[${doc.title}]: ${doc.content}`)
        .join('\n\n')
      usedRag = true
    }
  } catch (error) {
    console.error('Error retrieving RAG context:', error)
  }

  // 5. Build final LLM call payload
  const conversationHistory = messages.slice(-10) // Last 10 messages for context
  const messagesForLLM = [
    { role: 'system' as const, content: systemPrompt },
    ...conversationHistory.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  ]

  // Add context if available
  if (astroSummary || ragContext) {
    const contextMessage = [astroSummary, ragContext].filter(Boolean).join('\n\n')
    messagesForLLM.splice(1, 0, {
      role: 'system',
      content: `Additional Context:\n${contextMessage}`,
    })
  }

  // 6. Call LLM (OpenAI / Gemini)
  let answer = ''
  try {
    answer = await callLLM(messagesForLLM)
  } catch (error) {
    console.error('Error calling LLM:', error)
    answer = 'I apologize, but I encountered an error. Please try again in a moment. The cosmic energies are realigning.'
  }

  // 7. Extract suggestions and follow-ups
  const suggestions = extractSuggestions(answer)
  const followUps = generateFollowUps(derivedMode, astroContext)

  return {
    answer,
    usedAstroContext: !!astroContext,
    usedRag,
    suggestions: suggestions.length > 0 ? suggestions : undefined,
    followUps: followUps.length > 0 ? followUps : undefined,
  }
}

/**
 * Build Guru system prompt with safety guardrails
 */
function buildGuruSystemPrompt(params: {
  astroSummary: string
  mode: GuruMode
  userName?: string
}): string {
  const { astroSummary, mode, userName } = params

  const greeting = userName ? `Namaste ${userName}.` : 'Namaste.'

  return `You are a wise and compassionate Vedic astrologer and spiritual guide. You provide guidance based on ancient wisdom, astrological insights, and spiritual teachings.

${greeting} I am here to help you understand your spiritual path and cosmic influences.

${astroSummary ? `User's Astrological Context:\n${astroSummary}\n` : ''}

IMPORTANT SAFETY GUIDELINES:
- NEVER provide exact death predictions or specific dates of death
- NEVER provide exact disease diagnoses or medical prescriptions
- NEVER guarantee financial outcomes or investment advice
- ALWAYS encourage users to treat JyotiAI as spiritual guidance, not absolute fate
- ALWAYS encourage remedies as spiritual support, not medical replacement
- Use phrases like "may suggest", "could indicate", "spiritual guidance suggests" rather than definitive statements
- When discussing health, always recommend consulting healthcare professionals
- When discussing finances, always recommend consulting financial advisors

Your responses should be:
- Warm, compassionate, and spiritually uplifting
- Based on Vedic astrology principles
- Context-aware (use the astrological context provided when available)
- Respectful of the user's spiritual journey
- Encouraging and supportive

Current mode: ${mode}

Respond naturally and helpfully, incorporating the astrological context when relevant.`
}

/**
 * Get RAG context for Guru
 */
async function getGuruRagContext(query: string, mode?: GuruMode): Promise<{
  documents: Array<{ id: string; title: string; category: string; content: string; score: number }>
  query: string
  totalResults: number
}> {
  // Map mode to category filter
  const categoryMap: Record<GuruMode, string> = {
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

  try {
    return await retrieveRelevantDocuments(query, 5, categoryFilter)
  } catch (error) {
    console.error('Error in RAG retrieval:', error)
    return {
      documents: [],
      query,
      totalResults: 0,
    }
  }
}

/**
 * Call LLM (OpenAI or Gemini)
 */
async function callLLM(messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>): Promise<string> {
  const provider = process.env.AI_PROVIDER || 'openai'
  const openaiApiKey = process.env.OPENAI_API_KEY
  const geminiApiKey = process.env.GEMINI_API_KEY

  if (provider === 'gemini' && geminiApiKey) {
    return callGemini(messages, geminiApiKey)
  } else if (openaiApiKey) {
    return callOpenAI(messages, openaiApiKey)
  } else {
    throw new Error('No AI provider configured')
  }
}

/**
 * Call OpenAI API
 */
async function callOpenAI(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  apiKey: string
): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: 0.7,
      max_tokens: 1000,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(`OpenAI error: ${error.error?.message || 'Unknown error'}`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || 'I apologize, but I could not generate a response.'
}

/**
 * Call Gemini API
 */
async function callGemini(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  apiKey: string
): Promise<string> {
  // Convert messages to Gemini format
  const contents = messages
    .filter((m) => m.role !== 'system') // Gemini handles system differently
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

  // Add system instruction from system messages
  const systemInstruction = messages.find((m) => m.role === 'system')?.content || ''

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents,
      systemInstruction,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      },
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(`Gemini error: ${error.error?.message || 'Unknown error'}`)
  }

  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, but I could not generate a response.'
}

/**
 * Extract suggestions from answer
 */
function extractSuggestions(answer: string): string[] {
  const suggestions: string[] = []

  // Look for actionable suggestions (mantras, practices, etc.)
  const suggestionPatterns = [
    /(?:practice|chant|meditate|wear|face|perform|do)\s+([^.!?]+)/gi,
    /(?:recommend|suggest|try)\s+([^.!?]+)/gi,
  ]

  for (const pattern of suggestionPatterns) {
    const matches = answer.matchAll(pattern)
    for (const match of matches) {
      if (match[1] && match[1].trim().length > 10 && match[1].trim().length < 100) {
        suggestions.push(match[1].trim())
        if (suggestions.length >= 3) break
      }
    }
    if (suggestions.length >= 3) break
  }

  return suggestions.slice(0, 3)
}

/**
 * Generate follow-up questions based on mode and context
 */
function generateFollowUps(mode: GuruMode, astroContext: AstroContext | null): string[] {
  const followUps: string[] = []

  switch (mode) {
    case 'kundali':
      followUps.push('Tell me more about my planetary positions', 'What does my ascendant sign mean?')
      if (astroContext) {
        followUps.push(`Explain my ${astroContext.coreChart.moonSign} moon sign`)
      }
      break
    case 'career':
      followUps.push('What career path aligns with my chart?', 'When is a good time to change jobs?')
      break
    case 'love':
      followUps.push('When will I find love?', 'What are my relationship strengths?')
      break
    case 'remedies':
      followUps.push('What mantras should I chant?', 'Which gemstones are beneficial for me?')
      break
    default:
      followUps.push('Tell me about my spiritual path', 'What should I focus on right now?')
  }

  return followUps.slice(0, 3)
}
