/**
 * Error Handler & Logging
 * Part B - Section 10: DevOps & Performance
 * Milestone 8 - Step 15
 * 
 * Centralized error handling and logging
 */

import { adminDb } from '@/lib/firebase/admin'

export interface ErrorLog {
  errorId: string
  timestamp: Date
  level: 'error' | 'warn' | 'info'
  message: string
  stack?: string
  userId?: string
  endpoint?: string
  metadata?: Record<string, any>
}

/**
 * Log error to Firestore
 */
export async function logError(
  error: Error | string,
  context?: {
    userId?: string
    endpoint?: string
    metadata?: Record<string, any>
  }
): Promise<void> {
  try {
    if (!adminDb) {
      console.error('Firestore not initialized, logging to console only')
      console.error(error)
      return
    }

    const errorId = `error_${Date.now()}_${Math.random().toString(36).substring(7)}`
    const errorMessage = typeof error === 'string' ? error : error.message
    const errorStack = typeof error === 'string' ? undefined : error.stack

    const errorLog: ErrorLog = {
      errorId,
      timestamp: new Date(),
      level: 'error',
      message: errorMessage,
      stack: errorStack,
      userId: context?.userId,
      endpoint: context?.endpoint,
      metadata: context?.metadata,
    }

    await adminDb.collection('logs').doc('errors').collection('items').doc(errorId).set(errorLog)
  } catch (logError) {
    // Fallback to console if Firestore logging fails
    console.error('Failed to log error:', logError)
    console.error('Original error:', error)
  }
}

/**
 * Log warning
 */
export async function logWarning(
  message: string,
  context?: {
    userId?: string
    endpoint?: string
    metadata?: Record<string, any>
  }
): Promise<void> {
  try {
    if (!adminDb) {
      console.warn(message, context)
      return
    }

    const logId = `warn_${Date.now()}_${Math.random().toString(36).substring(7)}`

    await adminDb.collection('logs').doc('warnings').collection('items').doc(logId).set({
      logId,
      timestamp: new Date(),
      level: 'warn',
      message,
      userId: context?.userId,
      endpoint: context?.endpoint,
      metadata: context?.metadata,
    })
  } catch (error) {
    console.warn(message, context)
  }
}

/**
 * Log info
 */
export async function logInfo(
  message: string,
  context?: {
    userId?: string
    endpoint?: string
    metadata?: Record<string, any>
  }
): Promise<void> {
  try {
    if (!adminDb) {
      console.log(message, context)
      return
    }

    const logId = `info_${Date.now()}_${Math.random().toString(36).substring(7)}`

    await adminDb.collection('logs').doc('info').collection('items').doc(logId).set({
      logId,
      timestamp: new Date(),
      level: 'info',
      message,
      userId: context?.userId,
      endpoint: context?.endpoint,
      metadata: context?.metadata,
    })
  } catch (error) {
    console.log(message, context)
  }
}

/**
 * Create error response
 */
export function createErrorResponse(
  error: Error | string,
  statusCode: number = 500,
  context?: {
    userId?: string
    endpoint?: string
  }
): { error: string; statusCode: number } {
  const errorMessage = typeof error === 'string' ? error : error.message

  // Log error
  logError(error, context).catch((logErr) => {
    console.error('Failed to log error:', logErr)
  })

  return {
    error: errorMessage,
    statusCode,
  }
}

