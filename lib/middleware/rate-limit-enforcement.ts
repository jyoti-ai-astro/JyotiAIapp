/**
 * Rate Limit Enforcement System
 */
import { rateLimit, getRateLimitHeaders, type RateLimitConfig } from './rate-limit'
import { NextRequest, NextResponse } from 'next/server'

export const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  '/api/admin/login': {
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
    message: 'Too many admin login attempts. Please try again later.',
  },
  '/api/auth/magic-link': {
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
    message: 'Too many magic link requests. Please try again later.',
  },
  '/api/auth/verify-magic-link': {
    windowMs: 15 * 60 * 1000,
    maxRequests: 10,
    message: 'Too many verification attempts. Please try again later.',
  },
  '/api/guru/chat': {
    windowMs: 15 * 60 * 1000,
    maxRequests: 50,
    message: 'Rate limit exceeded. Please wait before asking more questions.',
  },
  '/api/reports/generate': {
    windowMs: 60 * 60 * 1000,
    maxRequests: 5,
    message: 'Report generation limit reached. Please try again later.',
  },
  '/api/kundali/generate-full': {
    windowMs: 60 * 60 * 1000,
    maxRequests: 10,
    message: 'Kundali generation limit reached. Please try again later.',
  },
  '/api/onboarding/birth-details': {
    windowMs: 15 * 60 * 1000,
    maxRequests: 10,
    message: 'Too many onboarding attempts. Please try again later.',
  },
  '/api/palmistry/analyze': {
    windowMs: 60 * 60 * 1000,
    maxRequests: 20,
    message: 'Upload limit reached. Please try again later.',
  },
  '/api/aura/analyze': {
    windowMs: 60 * 60 * 1000,
    maxRequests: 20,
    message: 'Upload limit reached. Please try again later.',
  },
  default: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 100,
    message: 'Too many requests. Please try again later.',
  },
}

export function getRateLimitConfig(pathname: string): RateLimitConfig {
  if (RATE_LIMIT_CONFIGS[pathname]) return RATE_LIMIT_CONFIGS[pathname]
  for (const [path, config] of Object.entries(RATE_LIMIT_CONFIGS)) {
    if (path !== 'default' && pathname.startsWith(path)) return config
  }
  return RATE_LIMIT_CONFIGS.default
}

export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  identifier?: (request: NextRequest) => string
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const config = getRateLimitConfig(request.nextUrl.pathname)
    const id = identifier
      ? identifier(request)
      : request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        request.headers.get('x-real-ip') ||
        'unknown'
    const result = rateLimit(id, config)
    if (!result.allowed) {
      return NextResponse.json(
        { error: result.error || config.message },
        { status: 429, headers: getRateLimitHeaders(result.remaining, result.resetTime) }
      )
    }
    const response = await handler(request)
    Object.entries(getRateLimitHeaders(result.remaining, result.resetTime)).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    return response
  }
}

export function checkRateLimit(
  request: NextRequest,
  userId?: string
): { allowed: boolean; response?: NextResponse } {
  const config = getRateLimitConfig(request.nextUrl.pathname)
  const identifier = userId || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const result = rateLimit(identifier, config)
  if (!result.allowed) {
    return {
      allowed: false,
      response: NextResponse.json(
        { error: result.error || config.message },
        { status: 429, headers: getRateLimitHeaders(result.remaining, result.resetTime) }
      ),
    }
  }
  return { allowed: true }
}
