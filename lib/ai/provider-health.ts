import type { AIProviderName } from '@/lib/ai/provider-errors'

type FailureState = {
  code: string
  until: number
}

const failures = new Map<AIProviderName, FailureState>()

const BILLING_COOLDOWN_MS = 5 * 60 * 1000
const TRANSIENT_COOLDOWN_MS = 15 * 1000

export function assertAIProviderAvailable(provider: AIProviderName) {
  const state = failures.get(provider)
  if (!state) return

  if (Date.now() >= state.until) {
    failures.delete(provider)
    return
  }

  const error: any = new Error(`${provider} temporarily suppressed after provider failure`)
  error.code = state.code
  error.clientMessage =
    state.code === 'AI_BILLING_OR_QUOTA'
      ? 'AI credits are temporarily unavailable. Please try again later.'
      : 'AI generation is temporarily unavailable. Please retry shortly.'
  throw error
}

export function recordAIProviderFailure(provider: AIProviderName, error: any) {
  const code = String(error?.code || '')

  if (code === 'AI_BILLING_OR_QUOTA') {
    failures.set(provider, {
      code,
      until: Date.now() + BILLING_COOLDOWN_MS,
    })
    return
  }

  if (
    code === 'AI_RATE_LIMIT' ||
    code === 'AI_PROVIDER_UNAVAILABLE' ||
    code === 'AI_NETWORK_ERROR'
  ) {
    failures.set(provider, {
      code,
      until: Date.now() + TRANSIENT_COOLDOWN_MS,
    })
  }
}

export function clearAIProviderFailure(provider: AIProviderName) {
  failures.delete(provider)
}
