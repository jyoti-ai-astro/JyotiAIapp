export type AIErrorCode =
  | 'AI_BILLING_OR_QUOTA'
  | 'AI_RATE_LIMIT'
  | 'AI_MODEL_UNAVAILABLE'
  | 'AI_PROVIDER_UNAVAILABLE'
  | 'AI_NETWORK_ERROR'
  | 'AI_MALFORMED_RESPONSE'
  | 'AI_REQUEST_FAILED'
  | 'AI_NOT_CONFIGURED'

export type AIProviderName = 'OpenAI' | 'Gemini' | 'xAI' | 'Anthropic'

export class AIProviderError extends Error {
  code: AIErrorCode
  clientMessage: string
  status: number

  constructor(code: AIErrorCode, message: string, clientMessage: string, status = 503) {
    super(message)
    this.name = 'AIProviderError'
    this.code = code
    this.clientMessage = clientMessage
    this.status = status
  }
}

export function aiNotConfigured(provider = 'AI'): AIProviderError {
  return new AIProviderError(
    'AI_NOT_CONFIGURED',
    `${provider} provider not configured`,
    'AI generation is temporarily unavailable. Please try again later.',
    503
  )
}

export function aiNetworkError(provider: AIProviderName): AIProviderError {
  return new AIProviderError(
    'AI_NETWORK_ERROR',
    `${provider} network error`,
    'AI generation could not reach the provider. Please retry in a moment.',
    503
  )
}

export function aiMalformedResponse(provider: AIProviderName): AIProviderError {
  return new AIProviderError(
    'AI_MALFORMED_RESPONSE',
    `Malformed ${provider} response`,
    'AI generation returned an unreadable response. Please retry.',
    502
  )
}

export function classifyAIResponseError(
  provider: AIProviderName,
  response: Response,
  errorBody: any
): AIProviderError {
  const providerCode = errorBody?.error?.code || errorBody?.type || ''
  const providerType = errorBody?.error?.type || errorBody?.type || ''
  const providerMessage =
    errorBody?.error?.message ||
    errorBody?.message ||
    errorBody?.error?.error ||
    'Unknown provider error'

  const message = `${provider} error: ${providerMessage}`

  if (response.status === 429) {
    const isQuota =
      providerCode === 'insufficient_quota' ||
      providerType === 'insufficient_quota' ||
      /quota|billing|credit/i.test(String(providerMessage))

    return new AIProviderError(
      isQuota ? 'AI_BILLING_OR_QUOTA' : 'AI_RATE_LIMIT',
      message,
      isQuota
        ? 'AI credits are temporarily unavailable. Please try again later.'
        : 'AI generation is receiving too many requests. Please retry in a moment.',
      429
    )
  }

  if (response.status === 402) {
    return new AIProviderError(
      'AI_BILLING_OR_QUOTA',
      message,
      'AI credits are temporarily unavailable. Please try again later.',
      503
    )
  }

  if (response.status === 404 || providerCode === 'model_not_found') {
    return new AIProviderError(
      'AI_MODEL_UNAVAILABLE',
      message,
      'The configured AI model is temporarily unavailable. Please try again later.',
      503
    )
  }

  if (response.status >= 500) {
    return new AIProviderError(
      'AI_PROVIDER_UNAVAILABLE',
      message,
      'AI generation is temporarily unavailable. Please retry shortly.',
      503
    )
  }

  return new AIProviderError(
    'AI_REQUEST_FAILED',
    message,
    'AI generation could not complete the request. Please retry.',
    502
  )
}

export function getAIErrorStatus(error: any): number {
  if (error?.status && Number.isInteger(error.status)) return error.status
  if (error?.code === 'AI_RATE_LIMIT') return 429
  if (error?.code?.startsWith?.('AI_')) return 503
  return 500
}
