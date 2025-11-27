/**
 * API Failover Layer (Phase 29 - F44)
 * 
 * Retry mechanisms and graceful fallbacks for API routes
 */

export interface FailoverConfig {
  maxRetries: number;
  retryDelay: number; // milliseconds
  timeout: number; // milliseconds
}

const DEFAULT_CONFIG: FailoverConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 30000,
};

/**
 * Retry API call with exponential backoff
 */
export async function retryApiCall<T>(
  apiCall: () => Promise<T>,
  config: Partial<FailoverConfig> = {}
): Promise<T> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= finalConfig.maxRetries; attempt++) {
    try {
      // Phase 29 - F44: Add timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), finalConfig.timeout);
      });

      const result = await Promise.race([apiCall(), timeoutPromise]);
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      // Don't retry on client errors (4xx)
      if (error instanceof Response && error.status >= 400 && error.status < 500) {
        throw error;
      }

      // Last attempt, throw error
      if (attempt === finalConfig.maxRetries) {
        break;
      }

      // Exponential backoff
      const delay = finalConfig.retryDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('API call failed after retries');
}

/**
 * Get graceful fallback JSON for API errors
 */
export function getGracefulFallback(
  endpoint: string,
  error: Error
): { error: string; message: string; fallback: boolean } {
  const errorMessage = error.message.toLowerCase();

  // Phase 29 - F44: Guru-friendly fallback messages
  if (errorMessage.includes('timeout') || errorMessage.includes('network')) {
    return {
      error: 'Connection timeout',
      message: 'The cosmic connection timed out. The Guru is reconnecting to the divine source.',
      fallback: true,
    };
  }

  if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
    return {
      error: 'Rate limit exceeded',
      message: 'The Guru needs a moment to process the cosmic energies. Please wait a moment.',
      fallback: true,
    };
  }

  if (errorMessage.includes('validation') || errorMessage.includes('400')) {
    return {
      error: 'Validation error',
      message: 'The cosmic signals were unclear. Please rephrase your question.',
      fallback: true,
    };
  }

  // Generic fallback
  return {
    error: 'Service unavailable',
    message: 'The Guru is temporarily unavailable. The divine energies are realigning. Please try again in a moment.',
    fallback: true,
  };
}

/**
 * Log error with sanitized message (Phase 29 - F44)
 */
export function logApiError(
  endpoint: string,
  error: Error,
  attempt?: number
): void {
  // Sanitize error message (no user data)
  const sanitizedError = {
    endpoint,
    message: error.message.substring(0, 200), // Truncate
    attempt,
    timestamp: new Date().toISOString(),
  };

  // In production, send to error tracking
  if (process.env.NODE_ENV === 'production') {
    // Example: sendToErrorTracking(sanitizedError);
  } else {
    console.error('[API Failover]', sanitizedError);
  }
}

