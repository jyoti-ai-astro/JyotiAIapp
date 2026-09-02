import { envVars } from '@/lib/env/env.mjs'
import {
  aiMalformedResponse,
  aiNetworkError,
  aiNotConfigured,
  classifyAIResponseError,
  type AIProviderName,
} from '@/lib/ai/provider-errors'
import {
  assertAIProviderAvailable,
  clearAIProviderFailure,
  recordAIProviderFailure,
} from '@/lib/ai/provider-health'
import {
  recordAIFallback,
  recordAIProviderEvent,
} from '@/lib/observability/operational-events'

export interface LLMMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface LLMOptions {
  temperature?: number
  maxTokens?: number
  timeoutMs?: number
  modelRole?: 'prediction' | 'guru'
  validate?: (content: string) => void
}

type ProviderId = 'openai' | 'gemini' | 'xai' | 'anthropic'

const PROVIDER_ORDER: ProviderId[] = ['openai', 'gemini', 'xai', 'anthropic']

const PROVIDER_NAMES: Record<ProviderId, AIProviderName> = {
  openai: 'OpenAI',
  gemini: 'Gemini',
  xai: 'xAI',
  anthropic: 'Anthropic',
}

function combineSignal(signal: AbortSignal | undefined, timeoutMs: number) {
  const controller = new AbortController()
  let timedOut = false

  const timeout = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, timeoutMs)

  const onAbort = () => controller.abort()

  if (signal) {
    if (signal.aborted) controller.abort()
    else signal.addEventListener('abort', onAbort, { once: true })
  }

  return {
    signal: controller.signal,
    timedOut: () => timedOut,
    cleanup: () => {
      clearTimeout(timeout)
      signal?.removeEventListener('abort', onAbort)
    },
  }
}

function providerSequence(preferred?: string): ProviderId[] {
  const normalized = PROVIDER_ORDER.includes(preferred as ProviderId)
    ? (preferred as ProviderId)
    : 'openai'

  return [
    normalized,
    ...PROVIDER_ORDER.filter((provider) => provider !== normalized),
  ]
}

function configured(provider: ProviderId): boolean {
  if (provider === 'openai') return Boolean(envVars.ai.openaiApiKey)
  if (provider === 'gemini') return Boolean(envVars.ai.geminiApiKey)
  if (provider === 'xai') return Boolean(envVars.ai.xaiApiKey)
  return Boolean(envVars.ai.anthropicApiKey)
}

function isRetryableProviderError(error: any): boolean {
  const code = String(error?.code || '')

  return (
    code === 'AI_BILLING_OR_QUOTA' ||
    code === 'AI_RATE_LIMIT' ||
    code === 'AI_MODEL_UNAVAILABLE' ||
    code === 'AI_PROVIDER_UNAVAILABLE' ||
    code === 'AI_NETWORK_ERROR' ||
    code === 'AI_MALFORMED_RESPONSE'
  )
}

export async function callLLM(
  messages: LLMMessage[],
  signal?: AbortSignal,
  options?: LLMOptions
): Promise<string> {
  const sequence = providerSequence(envVars.ai.provider)
  const errors: unknown[] = []
  let previousRetryableFailure:
    | { provider: ProviderId; errorCode: string }
    | null = null

  for (const provider of sequence) {
    if (!configured(provider)) continue

    if (previousRetryableFailure) {
      void recordAIFallback(
        PROVIDER_NAMES[previousRetryableFailure.provider],
        PROVIDER_NAMES[provider],
        previousRetryableFailure.errorCode
      ).catch((error) => {
        console.error('[AI] Failed to record fallback telemetry', error)
      })
      previousRetryableFailure = null
    }

    const startedAt = Date.now()

    void recordAIProviderEvent(
      'attempt',
      PROVIDER_NAMES[provider],
      {
        modelRole: options?.modelRole,
      }
    ).catch((error) => {
      console.error('[AI] Failed to record attempt telemetry', error)
    })

    try {
      let content: string

      if (provider === 'openai') {
        content = await callOpenAI(messages, signal, options)
      } else if (provider === 'gemini') {
        content = await callGemini(messages, signal, options)
      } else if (provider === 'xai') {
        content = await callXAI(messages, signal, options)
      } else {
        content = await callAnthropic(messages, signal, options)
      }

      if (!content?.trim()) {
        throw aiMalformedResponse(PROVIDER_NAMES[provider])
      }

      if (options?.validate) {
        try {
          options.validate(content)
        } catch {
          throw aiMalformedResponse(PROVIDER_NAMES[provider])
        }
      }

      void recordAIProviderEvent(
        'success',
        PROVIDER_NAMES[provider],
        {
          latencyMs: Date.now() - startedAt,
          modelRole: options?.modelRole,
        }
      ).catch((error) => {
        console.error('[AI] Failed to record success telemetry', error)
      })

      return content
    } catch (error: any) {
      const errorCode = String(
        error?.code ||
        error?.name ||
        'UNKNOWN'
      )

      void recordAIProviderEvent(
        'failure',
        PROVIDER_NAMES[provider],
        {
          latencyMs: Date.now() - startedAt,
          errorCode,
          modelRole: options?.modelRole,
        }
      ).catch((telemetryError) => {
        console.error(
          '[AI] Failed to record failure telemetry',
          telemetryError
        )
      })

      errors.push(error)

      if (!isRetryableProviderError(error)) {
        console.error(
          `[AI] ${PROVIDER_NAMES[provider]} generation failed with non-retryable error`,
          error
        )
        throw error
      }

      previousRetryableFailure = {
        provider,
        errorCode,
      }

      console.warn(
        `[AI] ${PROVIDER_NAMES[provider]} generation failed; trying next configured provider`,
        error
      )
    }
  }

  throw (
    errors[errors.length - 1] ||
    aiNotConfigured('OpenAI')
  )
}

async function callOpenAI(
  messages: LLMMessage[],
  signal?: AbortSignal,
  options?: LLMOptions
): Promise<string> {
  const provider: AIProviderName = 'OpenAI'
  const apiKey = envVars.ai.openaiApiKey
  if (!apiKey) throw aiNotConfigured(provider)

  assertAIProviderAvailable(provider)

  const timed = combineSignal(signal, options?.timeoutMs ?? 30000)

  try {
    let response: Response

    try {
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model:
            options?.modelRole === 'guru'
              ? envVars.ai.guruModelName
              : envVars.ai.predictionModelName,
          messages,
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.maxTokens ?? 2000,
        }),
        signal: timed.signal,
      })
    } catch (error: any) {
      if (signal?.aborted) throw error
      const providerError = aiNetworkError(provider)
      recordAIProviderFailure(provider, providerError)
      throw providerError
    }

    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      const providerError = classifyAIResponseError(provider, response, body)
      recordAIProviderFailure(provider, providerError)
      throw providerError
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content || typeof content !== 'string') {
      throw aiMalformedResponse(provider)
    }

    clearAIProviderFailure(provider)
    return content
  } finally {
    timed.cleanup()
  }
}

async function callGemini(
  messages: LLMMessage[],
  signal?: AbortSignal,
  options?: LLMOptions
): Promise<string> {
  const provider: AIProviderName = 'Gemini'
  const apiKey = envVars.ai.geminiApiKey
  if (!apiKey) throw aiNotConfigured(provider)

  assertAIProviderAvailable(provider)

  const contents = messages
    .filter((message) => message.role !== 'system')
    .map((message) => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: message.content }],
    }))

  const systemInstruction = messages
    .filter((message) => message.role === 'system')
    .map((message) => message.content)
    .join('\n\n')

  const timed = combineSignal(signal, options?.timeoutMs ?? 30000)

  try {
    let response: Response

    try {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            systemInstruction: systemInstruction || undefined,
            generationConfig: {
              thinkingConfig: { thinkingLevel: 'low' },
              maxOutputTokens: options?.maxTokens ?? 2000,
            },
          }),
          signal: timed.signal,
        }
      )
    } catch (error: any) {
      if (signal?.aborted) throw error
      const providerError = aiNetworkError(provider)
      recordAIProviderFailure(provider, providerError)
      throw providerError
    }

    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      const providerError = classifyAIResponseError(provider, response, body)
      recordAIProviderFailure(provider, providerError)
      throw providerError
    }

    const data = await response.json()
    const content = data.candidates?.[0]?.content?.parts
      ?.map((part: any) => part?.text || '')
      .join('')
      .trim()

    if (!content) throw aiMalformedResponse(provider)

    clearAIProviderFailure(provider)
    return content
  } finally {
    timed.cleanup()
  }
}

async function callXAI(
  messages: LLMMessage[],
  signal?: AbortSignal,
  options?: LLMOptions
): Promise<string> {
  const provider: AIProviderName = 'xAI'
  const apiKey = envVars.ai.xaiApiKey
  if (!apiKey) throw aiNotConfigured(provider)

  assertAIProviderAvailable(provider)

  const timed = combineSignal(signal, options?.timeoutMs ?? 30000)

  try {
    let response: Response

    try {
      response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: envVars.ai.xaiModelName,
          messages,
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.maxTokens ?? 2000,
        }),
        signal: timed.signal,
      })
    } catch (error: any) {
      if (signal?.aborted) throw error
      const providerError = aiNetworkError(provider)
      recordAIProviderFailure(provider, providerError)
      throw providerError
    }

    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      const providerError = classifyAIResponseError(provider, response, body)
      recordAIProviderFailure(provider, providerError)
      throw providerError
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content || typeof content !== 'string') {
      throw aiMalformedResponse(provider)
    }

    clearAIProviderFailure(provider)
    return content
  } finally {
    timed.cleanup()
  }
}

async function callAnthropic(
  messages: LLMMessage[],
  signal?: AbortSignal,
  options?: LLMOptions
): Promise<string> {
  const provider: AIProviderName = 'Anthropic'
  const apiKey = envVars.ai.anthropicApiKey
  if (!apiKey) throw aiNotConfigured(provider)

  assertAIProviderAvailable(provider)

  const system = messages
    .filter((message) => message.role === 'system')
    .map((message) => message.content)
    .join('\n\n')

  const anthropicMessages = messages
    .filter((message) => message.role !== 'system')
    .map((message) => ({
      role: message.role === 'assistant' ? 'assistant' : 'user',
      content: message.content,
    }))

  const timed = combineSignal(signal, options?.timeoutMs ?? 30000)

  try {
    let response: Response

    try {
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: envVars.ai.anthropicModelName,
          system: system || undefined,
          messages: anthropicMessages,
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.maxTokens ?? 2000,
        }),
        signal: timed.signal,
      })
    } catch (error: any) {
      if (signal?.aborted) throw error
      const providerError = aiNetworkError(provider)
      recordAIProviderFailure(provider, providerError)
      throw providerError
    }

    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      const providerError = classifyAIResponseError(provider, response, body)
      recordAIProviderFailure(provider, providerError)
      throw providerError
    }

    const data = await response.json()
    const content = Array.isArray(data.content)
      ? data.content
          .filter((block: any) => block?.type === 'text')
          .map((block: any) => block.text || '')
          .join('')
          .trim()
      : ''

    if (!content) throw aiMalformedResponse(provider)

    clearAIProviderFailure(provider)
    return content
  } finally {
    timed.cleanup()
  }
}

export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T
  } catch {
    return fallback
  }
}
