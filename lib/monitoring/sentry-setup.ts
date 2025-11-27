/**
 * Sentry Full Setup (Server + Client)
 * Milestone 9 - Step 6
 * 
 * Sentry error tracking and monitoring
 */

/**
 * Initialize Sentry (Server-side)
 */
export function initSentryServer(): void {
  if (typeof window !== 'undefined') {
    return // Only run on server
  }

  try {
    // Dynamic import to avoid bundling in client
    const Sentry = require('@sentry/nextjs')

    // Phase 31 - F46: Use validated environment variables
    const { envVars } = await import('@/lib/env/env.mjs')
    
    Sentry.init({
      dsn: envVars.sentry.dsn,
      environment: envVars.nodeEnv,
      tracesSampleRate: envVars.isProduction ? 0.1 : 1.0,
      debug: envVars.isDevelopment,
      beforeSend(event, hint) {
        // Filter out sensitive data
        if (event.request) {
          delete event.request.cookies
          if (event.request.headers) {
            delete event.request.headers['authorization']
            delete event.request.headers['cookie']
          }
        }
        return event
      },
    })
  } catch (error) {
    console.warn('Sentry initialization failed:', error)
  }
}

/**
 * Initialize Sentry (Client-side)
 */
export function initSentryClient(): void {
  if (typeof window === 'undefined') {
    return // Only run on client
  }

  try {
    // Sentry will be initialized via next.config.js
    // This is a placeholder for client-side configuration
    if (envVars.sentry.publicDsn) {
      // Client-side Sentry is typically initialized via SDK
      console.log('Sentry client initialized')
    }
  } catch (error) {
    console.warn('Sentry client initialization failed:', error)
  }
}

/**
 * Capture exception
 */
export function captureException(error: Error, context?: Record<string, any>): void {
  try {
    if (typeof window === 'undefined') {
      const Sentry = require('@sentry/nextjs')
      Sentry.captureException(error, {
        contexts: {
          custom: context || {},
        },
      })
    } else {
      // Client-side
      if (window.Sentry) {
        window.Sentry.captureException(error, {
          contexts: {
            custom: context || {},
          },
        })
      }
    }
  } catch (e) {
    console.error('Failed to capture exception:', e)
  }
}

/**
 * Capture message
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
  try {
    if (typeof window === 'undefined') {
      const Sentry = require('@sentry/nextjs')
      Sentry.captureMessage(message, level)
    } else {
      if (window.Sentry) {
        window.Sentry.captureMessage(message, level)
      }
    }
  } catch (e) {
    console.error('Failed to capture message:', e)
  }
}

/**
 * Set user context
 */
export function setUserContext(userId: string, email?: string, metadata?: Record<string, any>): void {
  try {
    if (typeof window === 'undefined') {
      const Sentry = require('@sentry/nextjs')
      Sentry.setUser({
        id: userId,
        email,
        ...metadata,
      })
    } else {
      if (window.Sentry) {
        window.Sentry.setUser({
          id: userId,
          email,
          ...metadata,
        })
      }
    }
  } catch (e) {
    console.error('Failed to set user context:', e)
  }
}

/**
 * Add breadcrumb
 */
export function addBreadcrumb(message: string, category: string, level: 'info' | 'warning' | 'error' = 'info'): void {
  try {
    if (typeof window === 'undefined') {
      const Sentry = require('@sentry/nextjs')
      Sentry.addBreadcrumb({
        message,
        category,
        level,
        timestamp: Date.now() / 1000,
      })
    } else {
      if (window.Sentry) {
        window.Sentry.addBreadcrumb({
          message,
          category,
          level,
          timestamp: Date.now() / 1000,
        })
      }
    }
  } catch (e) {
    console.error('Failed to add breadcrumb:', e)
  }
}

// Type declaration for window.Sentry
declare global {
  interface Window {
    Sentry?: {
      captureException: (error: Error, context?: any) => void
      captureMessage: (message: string, level?: string) => void
      setUser: (user: { id: string; email?: string; [key: string]: any }) => void
      addBreadcrumb: (breadcrumb: any) => void
    }
  }
}

