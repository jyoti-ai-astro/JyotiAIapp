/**
 * Rate Limit Enforcement System
 * Milestone 9 - Step 4
 * 
 * Enforces rate limits across all API endpoints
 */

import { rateLimit, getRateLimitHeaders, type RateLimitConfig } from './rate-limit'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Rate limit configurations per endpoint
 */
export const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  // Authentication endpoints
  '/api/auth/magic-link': {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 magic links per 15 minutes
    message: 'Too many magic link requests. Please try again later.',
  },
  '/api/auth/verify-magic-link': {
    windowMs: 15 * 60 * 1000,
    maxRequests: 10,
    message: 'Too many verification attempts. Please try again later.',
  },

  // Guru Chat (AI-intensive)
  '/api/guru/chat': {
    windowMs: 15 * 60 * 1000,
    maxRequests: 50, // 50 messages per 15 minutes
    message: 'Rate limit exceeded. Please wait before asking more questions.',
  },

  // Reports (resource-intensive)
  '/api/reports/generate': {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5, // 5 reports per hour
    message: 'Report generation limit reached. Please try again later.',
  },

  // Kundali generation
  '/api/kundali/generate-full': {
    windowMs: 60 * 60 * 1000,
    maxRequests: 10, // 10 generations per hour
    message: 'Kundali generation limit reached. Please try again later.',
  },

  // Onboarding
  '/api/onboarding/birth-details': {
    windowMs: 15 * 60 * 1000,
    maxRequests: 10,
    message: 'Too many onboarding attempts. Please try again later.',
  },

  // Image uploads
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

  // Default rate limit
  default: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 100,
    message: 'Too many requests. Please try again later.',
  },
}

/**
 * Get rate limit config for endpoint
 */
export function getRateLimitConfig(pathname: string): RateLimitConfig {
  // Check exact match first
  if (RATE_LIMIT_CONFIGS[pathname]) {
    return RATE_LIMIT_CONFIGS[pathname]
  }

  // Check prefix matches
  for (const [path, config] of Object.entries(RATE_LIMIT_CONFIGS)) {
    if (pathname.startsWith(path)) {
      return config
    }
  }

  // Return default
  return RATE_LIMIT_CONFIGS.default
}

/**
 * Rate limit middleware wrapper
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  identifier?: (request: NextRequest) => string
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const pathname = request.nextUrl.pathname
    const config = getRateLimitConfig(pathname)

    // Get identifier (default: IP address or user ID)
    const id = identifier
      ? identifier(request)
      : request.headers.get('x-forwarded-for')?.split(',')[0] ||
        request.headers.get('x-real-ip') ||
        'unknown'

    // Check rate limit
    const result = rateLimit(id, config)

    if (!result.allowed) {
      return NextResponse.json(
        { error: result.error || config.message },
        {
          status: 429,
          headers: getRateLimitHeaders(result.remaining, result.resetTime),
        }
      )
    }

    // Call handler
    const response = await handler(request)

    // Add rate limit headers to response
    Object.entries(getRateLimitHeaders(result.remaining, result.resetTime)).forEach(
      ([key, value]) => {
        response.headers.set(key, value)
      }
    )

    return response
  }
}

/**
 * Rate limit check utility (for use in API routes)
 */
export function checkRateLimit(
  request: NextRequest,
  userId?: string
): { allowed: boolean; response?: NextResponse } {
  const pathname = request.nextUrl.pathname
  const config = getRateLimitConfig(pathname)

  const identifier = userId || request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
  const result = rateLimit(identifier, config)

  if (!result.allowed) {
    return {
      allowed: false,
      response: NextResponse.json(
        { error: result.error || config.message },
        {
          status: 429,
          headers: getRateLimitHeaders(result.remaining, result.resetTime),
        }
      ),
    }
  }

  return { allowed: true }
}

