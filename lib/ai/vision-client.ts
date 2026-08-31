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

export interface VisionImage {
  url?: string
  data?: string
  mimeType?: string
}

export interface VisionOptions {
  temperature?: number
  maxTokens?: number
  timeoutMs?: number
}

type VisionProviderId = 'openai' | 'gemini'

const VISION_ORDER: VisionProviderId[] = ['openai', 'gemini']

const MAX_VISION_IMAGE_BYTES = 10 * 1024 * 1024

const ALLOWED_VISION_IMAGE_HOSTS = new Set([
  'firebasestorage.googleapis.com',
  'storage.googleapis.com',
])

function assertAllowedRemoteVisionUrl(value: string): URL {
  let parsed: URL

  try {
    parsed = new URL(value)
  } catch {
    throw new Error('Invalid remote vision image URL')
  }

  if (parsed.protocol !== 'https:') {
    throw new Error('Remote vision images must use HTTPS')
  }

  const hostname = parsed.hostname.toLowerCase()

  if (!ALLOWED_VISION_IMAGE_HOSTS.has(hostname)) {
    throw new Error('Remote vision image host is not allowed')
  }

  return parsed
}

function configured(provider: VisionProviderId): boolean {
  if (provider === 'openai') return Boolean(envVars.ai.openaiApiKey)
  return Boolean(envVars.ai.geminiApiKey)
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

async function imageToInline(image: VisionImage): Promise<{ data: string; mimeType: string }> {
  if (image.data) {
    return {
      data: image.data,
      mimeType: image.mimeType || 'image/jpeg',
    }
  }

  if (!image.url) {
    throw new Error('Vision image is missing URL or inline data')
  }

  if (image.url.startsWith('data:')) {
    const comma = image.url.indexOf(',')
    if (comma < 0) throw new Error('Invalid image data URL')

    const metadata = image.url.slice(0, comma)
    const data = image.url.slice(comma + 1)
    const match = metadata.match(/^data:([^;]+)/)

    return {
      data,
      mimeType: match?.[1] || image.mimeType || 'image/jpeg',
    }
  }

  const remoteUrl = assertAllowedRemoteVisionUrl(image.url)

  const response = await fetch(remoteUrl, {
    redirect: 'error',
  })

  if (!response.ok) {
    throw new Error(`Unable to fetch vision image (${response.status})`)
  }

  const contentType =
    response.headers.get('content-type') ||
    image.mimeType ||
    'image/jpeg'

  if (!contentType.toLowerCase().startsWith('image/')) {
    throw new Error('Remote vision resource is not an image')
  }

  const declaredLength = Number(response.headers.get('content-length') || 0)

  if (
    Number.isFinite(declaredLength) &&
    declaredLength > MAX_VISION_IMAGE_BYTES
  ) {
    throw new Error('Vision image exceeds maximum allowed size')
  }

  const arrayBuffer = await response.arrayBuffer()

  if (arrayBuffer.byteLength > MAX_VISION_IMAGE_BYTES) {
    throw new Error('Vision image exceeds maximum allowed size')
  }

  const buffer = Buffer.from(arrayBuffer)

  return {
    data: buffer.toString('base64'),
    mimeType: contentType,
  }
}

function extractJson(text: string): string {
  const cleaned = text.replace(/```json|```/gi, '').trim()
  const match = cleaned.match(/\{[\s\S]*\}/)
  return match ? match[0] : cleaned
}

export async function callVisionJson<T>(
  prompt: string,
  images: VisionImage[],
  validate: (value: unknown) => T,
  signal?: AbortSignal,
  options?: VisionOptions
): Promise<T> {
  const errors: unknown[] = []

  for (const provider of VISION_ORDER) {
    if (!configured(provider)) continue
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')

    try {
      const raw =
        provider === 'openai'
          ? await callOpenAIVision(prompt, images, signal, options)
          : await callGeminiVision(prompt, images, signal, options)

      let parsed: unknown

      try {
        parsed = JSON.parse(extractJson(raw))
      } catch {
        throw aiMalformedResponse(provider === 'openai' ? 'OpenAI' : 'Gemini')
      }

      try {
        return validate(parsed)
      } catch {
        throw aiMalformedResponse(provider === 'openai' ? 'OpenAI' : 'Gemini')
      }
    } catch (error: any) {
      if (signal?.aborted && error?.name === 'AbortError') throw error

      errors.push(error)

      console.warn(
        `[AI Vision] ${provider === 'openai' ? 'OpenAI' : 'Gemini'} failed; trying next configured vision provider`,
        error?.code || error?.name || 'UNKNOWN'
      )
    }
  }

  if (errors.length) throw errors[errors.length - 1]
  throw aiNotConfigured('AI Vision')
}

async function callOpenAIVision(
  prompt: string,
  images: VisionImage[],
  signal?: AbortSignal,
  options?: VisionOptions
): Promise<string> {
  const provider: AIProviderName = 'OpenAI'
  const apiKey = envVars.ai.openaiApiKey

  if (!apiKey) throw aiNotConfigured(provider)

  assertAIProviderAvailable(provider)

  const timed = combineSignal(signal, options?.timeoutMs ?? 45000)

  try {
    let response: Response

    try {
      const content: any[] = [{ type: 'text', text: prompt }]

      for (const image of images) {
        if (image.url) {
          const remoteUrl = assertAllowedRemoteVisionUrl(image.url)

          content.push({
            type: 'image_url',
            image_url: { url: remoteUrl.toString() },
          })
        } else if (image.data) {
          content.push({
            type: 'image_url',
            image_url: {
              url: `data:${image.mimeType || 'image/jpeg'};base64,${image.data}`,
            },
          })
        } else {
          throw new Error('Vision image is missing URL or inline data')
        }
      }

      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: options?.temperature ?? 0.3,
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

async function callGeminiVision(
  prompt: string,
  images: VisionImage[],
  signal?: AbortSignal,
  options?: VisionOptions
): Promise<string> {
  const provider: AIProviderName = 'Gemini'
  const apiKey = envVars.ai.geminiApiKey

  if (!apiKey) throw aiNotConfigured(provider)

  assertAIProviderAvailable(provider)

  const inlineImages = await Promise.all(images.map(imageToInline))
  const timed = combineSignal(signal, options?.timeoutMs ?? 45000)

  try {
    let response: Response

    try {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  { text: prompt },
                  ...inlineImages.map((image) => ({
                    inlineData: {
                      data: image.data,
                      mimeType: image.mimeType,
                    },
                  })),
                ],
              },
            ],
            generationConfig: {
              thinkingConfig: { thinkingLevel: 'low' },
              responseMimeType: 'application/json',
              temperature: options?.temperature ?? 0.3,
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
