import { adminDb } from '@/lib/firebase/admin'

export type OperationalEventType =
  | 'ai.provider.attempt'
  | 'ai.provider.success'
  | 'ai.provider.failure'
  | 'ai.provider.fallback'
  | 'job.started'
  | 'job.succeeded'
  | 'job.failed'

type SafePrimitive = string | number | boolean | null

type SafeOperationalData = Record<
  string,
  SafePrimitive | SafePrimitive[] | Record<string, SafePrimitive>
>

function sanitize(value: unknown): unknown {
  if (value === null) return null

  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    if (typeof value === 'string') return value.slice(0, 500)
    return value
  }

  if (Array.isArray(value)) {
    return value.slice(0, 50).map((item) => sanitize(item))
  }

  if (typeof value === 'object') {
    const output: Record<string, unknown> = {}

    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      const normalizedKey = key.toLowerCase()

      if (
        normalizedKey.includes('prompt') ||
        normalizedKey.includes('message') ||
        normalizedKey.includes('content') ||
        normalizedKey.includes('password') ||
        normalizedKey.includes('token') ||
        normalizedKey.includes('secret') ||
        normalizedKey.includes('apikey') ||
        normalizedKey.includes('authorization') ||
        normalizedKey.includes('cookie')
      ) {
        continue
      }

      output[key] = sanitize(item)
    }

    return output
  }

  return String(value).slice(0, 200)
}

export async function recordOperationalEvent(
  type: OperationalEventType,
  data: SafeOperationalData
): Promise<void> {
  if (!adminDb) return

  try {
    await adminDb.collection('app_logs').add({
      type,
      data: sanitize(data),
      createdAt: new Date(),
      operational: true,
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'unknown',
      release: process.env.VERCEL_GIT_COMMIT_SHA || null,
    })
  } catch (error) {
    console.error('[observability] Failed to persist operational event', error)
  }
}

export async function recordAIProviderEvent(
  stage: 'attempt' | 'success' | 'failure',
  provider: string,
  data: {
    latencyMs?: number
    errorCode?: string
    modelRole?: string
  } = {}
): Promise<void> {
  await recordOperationalEvent(`ai.provider.${stage}`, {
    provider,
    latencyMs: data.latencyMs ?? null,
    errorCode: data.errorCode ?? null,
    modelRole: data.modelRole ?? null,
  })
}

export async function recordAIFallback(
  fromProvider: string,
  toProvider: string,
  errorCode?: string
): Promise<void> {
  await recordOperationalEvent('ai.provider.fallback', {
    fromProvider,
    toProvider,
    errorCode: errorCode || null,
  })
}
