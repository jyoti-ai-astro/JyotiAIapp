/**
 * Rate Limiting Middleware
 * Part B - Section 10: DevOps & Performance
 * Milestone 8 - Step 14
 * 
 * Implements rate limiting for API endpoints
 */

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  message?: string
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  message: 'Too many requests, please try again later.',
}

/**
 * Rate limit middleware
 */
export function rateLimit(
  identifier: string,
  config: Partial<RateLimitConfig> = {}
): { allowed: boolean; remaining: number; resetTime: number; error?: string } {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  const now = Date.now()
  const key = identifier

  // Get or create entry
  let entry = store[key]

  if (!entry || now > entry.resetTime) {
    // Reset or create new entry
    entry = {
      count: 0,
      resetTime: now + finalConfig.windowMs,
    }
    store[key]
  }

  // Increment count
  entry.count++

  // Check if limit exceeded
  if (entry.count > finalConfig.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      error: finalConfig.message,
    }
  }

  // Clean up old entries (simple cleanup)
  if (Object.keys(store).length > 10000) {
    cleanupStore()
  }

  return {
    allowed: true,
    remaining: finalConfig.maxRequests - entry.count,
    resetTime: entry.resetTime,
  }
}

/**
 * Clean up old entries
 */
function cleanupStore(): void {
  const now = Date.now()
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key]
    }
  })
}

/**
 * Get rate limit headers
 */
export function getRateLimitHeaders(
  remaining: number,
  resetTime: number
): Record<string, string> {
  return {
    'X-RateLimit-Limit': '100',
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString(),
  }
}

