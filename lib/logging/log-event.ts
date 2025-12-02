/**
 * Event Logging System
 * 
 * Phase Z - Production Validation & Monitoring
 * 
 * Centralized logging to Firestore for monitoring and debugging
 */

import { adminDb } from '@/lib/firebase/admin'

export type LogEventType =
  | 'subscription.created'
  | 'subscription.activated'
  | 'subscription.cancelled'
  | 'subscription.expired'
  | 'subscription.synced'
  | 'payment.success'
  | 'payment.failed'
  | 'payment.order_created'
  | 'webhook.received'
  | 'webhook.verified'
  | 'webhook.failed'
  | 'api.error'
  | 'ticket.consumed'
  | 'ticket.added'

export interface LogEventData {
  type: LogEventType
  data: Record<string, any>
  userId?: string
  metadata?: {
    ip?: string
    userAgent?: string
    [key: string]: any
  }
  createdAt: Date
}

/**
 * Log an event to Firestore
 */
export async function logEvent(
  type: LogEventType,
  data: Record<string, any>,
  userId?: string,
  metadata?: LogEventData['metadata']
): Promise<void> {
  if (!adminDb) {
    console.warn('Firestore not initialized, skipping event log')
    return
  }

  try {
    const logEntry: LogEventData = {
      type,
      data,
      userId,
      metadata,
      createdAt: new Date(),
    }

    await adminDb.collection('app_logs').add(logEntry)
  } catch (error: any) {
    // Don't throw - logging failures shouldn't break the app
    console.error('Failed to log event:', error)
  }
}

/**
 * Get recent logs by type
 */
export async function getRecentLogs(
  type?: LogEventType,
  limit: number = 20
): Promise<LogEventData[]> {
  if (!adminDb) {
    return []
  }

  try {
    let query = adminDb.collection('app_logs').orderBy('createdAt', 'desc').limit(limit)

    if (type) {
      query = query.where('type', '==', type) as any
    }

    const snapshot = await query.get()
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
    })) as LogEventData[]
  } catch (error: any) {
    console.error('Failed to get recent logs:', error)
    return []
  }
}

