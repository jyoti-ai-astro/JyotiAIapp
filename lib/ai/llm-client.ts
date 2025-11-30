/**
 * Shared LLM Client
 * 
 * Mega Build 2 - Prediction Engine + Timeline Engine
 * Shared helper for OpenAI/Gemini calls used across engines
 */

import { envVars } from '@/lib/env/env.mjs'

export interface LLMMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

/**
 * Call LLM (OpenAI or Gemini) - Shared helper
 */
export async function callLLM(
  messages: LLMMessage[],
  signal?: AbortSignal,
  options?: {
    temperature?: number
    maxTokens?: number
  }
): Promise<string> {
  const provider = envVars.ai.provider
  const openaiApiKey = envVars.ai.openaiApiKey
  const geminiApiKey = envVars.ai.geminiApiKey

  if (provider === 'gemini' && geminiApiKey) {
    return callGemini(messages, geminiApiKey, signal, options)
  } else if (openaiApiKey) {
    return callOpenAI(messages, openaiApiKey, signal, options)
  } else {
    throw new Error('No AI provider configured')
  }
}

/**
 * Call OpenAI API
 */
async function callOpenAI(
  messages: LLMMessage[],
  apiKey: string,
  signal?: AbortSignal,
  options?: {
    temperature?: number
    maxTokens?: number
  }
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
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2000,
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
  messages: LLMMessage[],
  apiKey: string,
  signal?: AbortSignal,
  options?: {
    temperature?: number
    maxTokens?: number
  }
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

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        systemInstruction,
        generationConfig: {
          temperature: options?.temperature ?? 0.7,
          maxOutputTokens: options?.maxTokens ?? 2000,
        },
      }),
      signal,
    }
  )

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(`Gemini error: ${error.error?.message || 'Unknown error'}`)
  }

  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, but I could not generate a response.'
}

/**
 * Safe JSON parse helper
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T
  } catch {
    return fallback
  }
}

