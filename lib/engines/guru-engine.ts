/**
 * Guru Engine - High-Level Orchestrator
 * 
 * MEGA BUILD 1 - Phase 7 Core
 * Intelligent Guru chat with context-aware, DOB-aware, module-aware responses
 */

import { getCachedAstroContext } from './astro-context-builder'
import { buildGuruContext, deriveGuruMode, type GuruMode } from '@/lib/guru/guru-context'
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
 * Guru response interface (legacy - kept for backward compatibility)
 */
export interface GuruResponse {
  answer: string
  usedAstroContext?: boolean
  usedRag?: boolean
  suggestions?: string[]
  followUps?: string[]
  mode?: GuruMode // Super Phase B - Include mode in response
}

/**
 * Guru RAG chunk interface
 */
export interface GuruRagChunk {
  id?: string
  title?: string
  snippet: string
  source?: string
  score?: number
}

/**
 * Guru Brain Result - Super Phase C
 */
export type GuruBrainResult = {
  status: 'ok' | 'degraded' | 'error'
  answer?: string
  mode: string
  usedAstroContext: boolean
  usedRag: boolean
  ragChunks?: GuruRagChunk[]
  suggestions?: string[]
  followUps?: string[]
  errorCode?: string
  errorMessage?: string
}

/**
 * Run Guru Brain - Main orchestrator function
 * Super Phase C - Returns structured result with status
 */
export async function runGuruBrain(params: {
  userId: string | null
  messages: GuruMessage[]
  mode?: GuruMode
  userName?: string
  gender?: string
  pageSlug?: string
  useRag?: boolean // Super Phase C - Allow disabling RAG
  signal?: AbortSignal // Super Phase C - Support cancellation
}): Promise<GuruBrainResult> {
  const { userId, messages, mode, userName, gender, pageSlug, useRag = true, signal } = params

  // Get last user message
  const lastUserMessage = messages.filter((m) => m.role === 'user').slice(-1)[0]
  if (!lastUserMessage) {
    return {
      status: 'ok',
      answer: 'Namaste. How may I guide you on your spiritual journey today?',
      mode: 'GeneralSeer',
      usedAstroContext: false,
      usedRag: false,
    }
  }

  const userQuestion = lastUserMessage.content
  let status: 'ok' | 'degraded' | 'error' = 'ok'
  let usedAstroContext = false
  let usedRag = false
  let astroContext: AstroContext | null = null
  let astroSummary = ''
  let ragChunks: GuruRagChunk[] = []
  let ragContext = ''

  // 1. Load AstroContext if userId present (graceful degradation)
  if (userId) {
    try {
      astroContext = await getCachedAstroContext(userId)
      if (astroContext) {
        usedAstroContext = true
        astroSummary = buildGuruContext({ userId, astroContext, userName, gender })
      }
    } catch (error) {
      console.error('Error loading astro context (degrading gracefully):', error)
      // Continue without astro context
      status = 'degraded'
    }
  }

  // 2. Derive mode from question, astro context, and page if not provided
  const derivedMode = mode || deriveGuruMode({ question: userQuestion, astroContext, pageSlug })

  // 3. Build Guru System Prompt
  const systemPrompt = buildGuruSystemPrompt({
    astroSummary,
    mode: derivedMode,
    userName,
  })

  // 4. Get RAG context (graceful degradation)
  if (useRag) {
    try {
      // Build short astro summary for RAG query enhancement
      const astroSummaryForRag = astroContext
        ? buildShortAstroSummary(astroContext)
        : undefined

      const ragResult = await getGuruRagContext({
        mode: derivedMode,
        question: userQuestion,
        astroContextSummary: astroSummaryForRag,
        topK: 5,
        signal,
      })

      if (ragResult.chunks.length > 0) {
        ragChunks = ragResult.chunks
        ragContext = ragResult.chunks
          .map((chunk) => {
            const title = chunk.title ? `[${chunk.title}]` : '[Knowledge]'
            return `${title}: ${chunk.snippet}${chunk.source ? ` (Source: ${chunk.source})` : ''}`
          })
          .join('\n\n')
        usedRag = true
      }

      if (ragResult.degraded) {
        status = status === 'ok' ? 'degraded' : status
      }
    } catch (error) {
      console.error('Error retrieving RAG context (degrading gracefully):', error)
      // Continue without RAG
      status = status === 'ok' ? 'degraded' : status
    }
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

  // 6. Call LLM (OpenAI / Gemini) - critical, must succeed
  let answer = ''
  try {
    answer = await callLLM(messagesForLLM, signal)
    if (!answer || answer.trim().length === 0) {
      throw new Error('Empty response from LLM')
    }
  } catch (error: any) {
    console.error('Error calling LLM:', error)
    // If LLM fails, we must return an error
    return {
      status: 'error',
      answer: 'I apologize, but I encountered an error. Please try again in a moment. The cosmic energies are realigning.',
      mode: derivedMode,
      usedAstroContext,
      usedRag,
      errorCode: 'LLM_ERROR',
      errorMessage: 'Failed to generate response',
    }
  }

  // 7. Extract suggestions and follow-ups
  const suggestions = extractSuggestions(answer)
  const followUps = generateFollowUps(derivedMode, astroContext)

  return {
    status,
    answer,
    mode: derivedMode,
    usedAstroContext,
    usedRag,
    ragChunks: ragChunks.length > 0 ? ragChunks : undefined,
    suggestions: suggestions.length > 0 ? suggestions : undefined,
    followUps: followUps.length > 0 ? followUps : undefined,
  }
}

/**
 * Build short astro summary for RAG query enhancement
 */
function buildShortAstroSummary(astroContext: AstroContext): string {
  const parts: string[] = []
  
  if (astroContext.coreChart) {
    parts.push(`Sun: ${astroContext.coreChart.sunSign}, Moon: ${astroContext.coreChart.moonSign}, Ascendant: ${astroContext.coreChart.ascendantSign}`)
  }
  
  if (astroContext.dasha?.currentMahadasha) {
    parts.push(`Current Dasha: ${astroContext.dasha.currentMahadasha.planet}`)
  }
  
  if (astroContext.lifeThemes && astroContext.lifeThemes.length > 0) {
    const topTheme = astroContext.lifeThemes[0]
    parts.push(`Focus: ${topTheme.area}`)
  }
  
  return parts.join('. ')
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
 * Get RAG context for Guru (Super Phase C - New abstraction)
 */
async function getGuruRagContext(params: {
  mode: GuruMode
  question: string
  astroContextSummary?: string
  topK?: number
  signal?: AbortSignal
}): Promise<{ chunks: GuruRagChunk[]; degraded: boolean }> {
  // Import the new RAG function
  const { getGuruRagContext: getRagContext } = await import('@/lib/rag/index')
  
  // Map GuruMode to GuruRagMode
  const modeMap: Record<GuruMode, string> = {
    general: 'general',
    kundali: 'general',
    numerology: 'general',
    predictions: 'general',
    remedies: 'remedy',
    business: 'general',
    career: 'career',
    compatibility: 'relationship',
    CareerGuide: 'career',
    RelationshipGuide: 'relationship',
    RemedySpecialist: 'remedy',
    TimelineExplainer: 'general',
    GeneralSeer: 'general',
  }

  const ragMode = (modeMap[params.mode] || 'general') as any

  try {
    return await getRagContext({
      mode: ragMode,
      question: params.question,
      astroContextSummary: params.astroContextSummary,
      topK: params.topK || 5,
      signal: params.signal,
    })
  } catch (error) {
    console.error('Error in RAG retrieval:', error)
    return { chunks: [], degraded: true }
  }
}

/**
 * Call LLM (OpenAI or Gemini)
 * Super Phase C - Support AbortSignal
 */
async function callLLM(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  signal?: AbortSignal
): Promise<string> {
  // Use validated environment variables
  const { envVars } = await import('@/lib/env/env.mjs')
  const provider = envVars.ai.provider || 'openai'
  const openaiApiKey = envVars.ai.openaiApiKey
  const geminiApiKey = envVars.ai.geminiApiKey

  if (provider === 'gemini' && geminiApiKey) {
    return callGemini(messages, geminiApiKey, signal)
  } else if (openaiApiKey) {
    return callOpenAI(messages, openaiApiKey, signal)
  } else {
    throw new Error('No AI provider configured. Please set OPENAI_API_KEY or GEMINI_API_KEY in your environment variables.')
  }
}

/**
 * Call OpenAI API
 */
async function callOpenAI(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  apiKey: string,
  signal?: AbortSignal
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
    signal,
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
  apiKey: string,
  signal?: AbortSignal
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
    signal,
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
    case 'CareerGuide':
      followUps.push('What career path aligns with my chart?', 'When is a good time to change jobs?')
      if (astroContext?.lifeThemes?.[0]?.area === 'career') {
        followUps.push('What does my current dasha say about my career?')
      }
      break
    case 'love':
    case 'RelationshipGuide':
      followUps.push('When will I find love?', 'What are my relationship strengths?')
      if (astroContext?.lifeThemes?.[0]?.area === 'love') {
        followUps.push('How does my chart influence my relationships?')
      }
      break
    case 'remedies':
    case 'RemedySpecialist':
      followUps.push('What mantras should I chant?', 'Which gemstones are beneficial for me?')
      break
    case 'TimelineExplainer':
      followUps.push('What are the key events coming up?', 'When should I make important decisions?')
      if (astroContext?.dashaTimeline && astroContext.dashaTimeline.length > 0) {
        followUps.push(`Tell me about my ${astroContext.dashaTimeline[0].planet} period`)
      }
      break
    default:
      followUps.push('Tell me about my spiritual path', 'What should I focus on right now?')
  }

  return followUps.slice(0, 3)
}
