/**
 * Logging Pipeline + Error Boundary Integration
 * Milestone 9 - Step 5
 * 
 * Centralized logging system with error boundary integration
 */

import { adminDb } from '@/lib/firebase/admin'
import { logError, logWarning, logInfo } from '@/lib/utils/error-handler'

export interface LogEntry {
  timestamp: Date
  level: 'error' | 'warn' | 'info' | 'debug'
  message: string
  context?: {
    userId?: string
    endpoint?: string
    userAgent?: string
    ip?: string
    metadata?: Record<string, any>
  }
  error?: {
    message: string
    stack?: string
    name?: string
  }
}

/**
 * Log levels
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

/**
 * Logger class
 */
export class Logger {
  private static instance: Logger
  private logBuffer: LogEntry[] = []
  private flushInterval: NodeJS.Timeout | null = null

  private constructor() {
    // Flush logs every 5 seconds
    this.flushInterval = setInterval(() => {
      this.flushLogs()
    }, 5000)
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  /**
   * Log error
   */
  async error(
    message: string,
    error?: Error,
    context?: LogEntry['context']
  ): Promise<void> {
    const entry: LogEntry = {
      timestamp: new Date(),
      level: 'error',
      message,
      context,
      error: error
        ? {
            message: error.message,
            stack: error.stack,
            name: error.name,
          }
        : undefined,
    }

    this.logBuffer.push(entry)

    // Also log immediately to error handler
    if (error) {
      await logError(error, context)
    } else {
      await logError(message, context)
    }

    // Flush if buffer is large
    if (this.logBuffer.length >= 100) {
      await this.flushLogs()
    }
  }

  /**
   * Log warning
   */
  async warn(message: string, context?: LogEntry['context']): Promise<void> {
    const entry: LogEntry = {
      timestamp: new Date(),
      level: 'warn',
      message,
      context,
    }

    this.logBuffer.push(entry)
    await logWarning(message, context)

    if (this.logBuffer.length >= 100) {
      await this.flushLogs()
    }
  }

  /**
   * Log info
   */
  async info(message: string, context?: LogEntry['context']): Promise<void> {
    const entry: LogEntry = {
      timestamp: new Date(),
      level: 'info',
      message,
      context,
    }

    this.logBuffer.push(entry)
    await logInfo(message, context)

    if (this.logBuffer.length >= 100) {
      await this.flushLogs()
    }
  }

  /**
   * Log debug
   */
  async debug(message: string, context?: LogEntry['context']): Promise<void> {
    if (process.env.NODE_ENV !== 'development') {
      return // Skip debug logs in production
    }

    const entry: LogEntry = {
      timestamp: new Date(),
      level: 'debug',
      message,
      context,
    }

    this.logBuffer.push(entry)
    console.debug(`[DEBUG] ${message}`, context)
  }

  /**
   * Flush logs to Firestore
   */
  async flushLogs(): Promise<void> {
    if (this.logBuffer.length === 0 || !adminDb) {
      return
    }

    const logsToFlush = [...this.logBuffer]
    this.logBuffer = []

    try {
      const batch = adminDb.batch()
      const timestamp = new Date()

      logsToFlush.forEach((entry) => {
        const logRef = adminDb
          .collection('logs')
          .doc(entry.level)
          .collection('items')
          .doc(`${timestamp.getTime()}_${Math.random().toString(36).substring(7)}`)

        batch.set(logRef, {
          ...entry,
          timestamp: adminDb.Timestamp.fromDate(entry.timestamp),
        })
      })

      await batch.commit()
    } catch (error) {
      console.error('Failed to flush logs:', error)
      // Re-add logs to buffer if flush fails
      this.logBuffer.unshift(...logsToFlush)
    }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
    }
    this.flushLogs()
  }
}

/**
 * Get logger instance
 */
export function getLogger(): Logger {
  return Logger.getInstance()
}

/**
 * Log API request
 */
export async function logAPIRequest(
  endpoint: string,
  method: string,
  userId?: string,
  metadata?: Record<string, any>
): Promise<void> {
  const logger = getLogger()
  await logger.info(`${method} ${endpoint}`, {
    userId,
    endpoint,
    metadata: {
      ...metadata,
      method,
    },
  })
}

/**
 * Log API error
 */
export async function logAPIError(
  endpoint: string,
  error: Error,
  userId?: string,
  metadata?: Record<string, any>
): Promise<void> {
  const logger = getLogger()
  await logger.error(`API Error: ${endpoint}`, error, {
    userId,
    endpoint,
    metadata,
  })
}

