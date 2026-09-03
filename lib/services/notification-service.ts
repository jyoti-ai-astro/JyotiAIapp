/**
 * Notification Service
 * Part B - Section 8: Notifications & Daily Insights
 * Milestone 7 - Step 6
 * 
 * Handles notification creation and dispatch
 */

import { adminDb } from '@/lib/firebase/admin'
import { sendEmail } from '@/lib/email/email-service'

export interface Notification {
  type: 'daily' | 'transit' | 'festival' | 'chakra' | 'system'
  title: string
  message: string
  category: string
  timestamp: Date
  read: boolean
  delivery: ('email' | 'inapp' | 'sms')[]
  metadata?: Record<string, any>
}

/**
 * Create notification
 */
export async function createNotification(
  userId: string,
  notification: Omit<Notification, 'timestamp' | 'read'>,
  deliveryKey?: string
): Promise<string> {
  if (!adminDb) {
    throw new Error('Firestore not initialized')
  }

  const normalizedDeliveryKey = deliveryKey
    ?.trim()
    .replace(/[^a-zA-Z0-9:_-]/g, '_')
    .slice(0, 400)

  const notificationId = normalizedDeliveryKey
    ? `notif_${normalizedDeliveryKey}`
    : `notif_${Date.now()}_${Math.random().toString(36).substring(7)}`

  const notificationRef = adminDb
    .collection('notifications')
    .doc(userId)
    .collection('items')
    .doc(notificationId)

  let dispatchClaimedAt: Date | null = null
  let dispatchLeaseExpiresAt: Date | null = null

  if (normalizedDeliveryKey) {
    const claimedAt = new Date()
    const leaseExpiresAt = new Date(
      claimedAt.getTime() + 5 * 60 * 1000
    )

    dispatchClaimedAt = claimedAt
    dispatchLeaseExpiresAt = leaseExpiresAt

    const dispatchState = await adminDb.runTransaction(
      async (transaction) => {
        const existing = await transaction.get(notificationRef)

        if (existing.exists) {
          const existingData = existing.data() || {}

          if (existingData.dispatchHandoffAt) {
            return 'handed-off' as const
          }

          if (
            existingData.dispatchState === 'ambiguous' ||
            existingData.dispatchAmbiguousAt
          ) {
            return 'ambiguous' as const
          }

          const existingClaimedAt =
            existingData.dispatchClaimedAt?.toDate?.()

          const existingLeaseExpiresAt =
            existingData.dispatchLeaseExpiresAt?.toDate?.()

          if (
            existingClaimedAt instanceof Date &&
            existingLeaseExpiresAt instanceof Date
          ) {
            if (
              existingLeaseExpiresAt.getTime() >
              claimedAt.getTime()
            ) {
              return 'in-flight' as const
            }

            transaction.set(
              notificationRef,
              {
                dispatchState: 'ambiguous',
                dispatchAmbiguousAt: claimedAt,
                dispatchLeaseExpiresAt: null,
              },
              { merge: true }
            )

            return 'ambiguous' as const
          }

          transaction.set(
            notificationRef,
            {
              dispatchState: 'claimed',
              dispatchClaimedAt: claimedAt,
              dispatchLeaseExpiresAt: leaseExpiresAt,
              dispatchAmbiguousAt: null,
            },
            { merge: true }
          )

          return 'claimed' as const
        }

        transaction.set(notificationRef, {
          ...notification,
          timestamp: claimedAt,
          read: false,
          deliveryKey: normalizedDeliveryKey,
          dispatchState: 'claimed',
          dispatchClaimedAt: claimedAt,
          dispatchLeaseExpiresAt: leaseExpiresAt,
          dispatchAmbiguousAt: null,
          dispatchHandoffAt: null,
        })

        return 'claimed' as const
      }
    )

    if (dispatchState === 'handed-off') {
      return notificationId
    }

    if (dispatchState === 'in-flight') {
      throw new Error(
        'Notification dispatch is already in progress'
      )
    }

    if (dispatchState === 'ambiguous') {
      throw new Error(
        'Notification dispatch outcome is ambiguous; automatic redispatch refused'
      )
    }
  } else {
    await notificationRef.set({
      ...notification,
      timestamp: new Date(),
      read: false,
      deliveryKey: null,
      dispatchState: 'claimed',
      dispatchClaimedAt: new Date(),
      dispatchLeaseExpiresAt: null,
      dispatchAmbiguousAt: null,
      dispatchHandoffAt: null,
    })
  }

  try {
    await dispatchNotification(userId, notification)
  } catch (error) {
    if (
      normalizedDeliveryKey &&
      dispatchClaimedAt &&
      dispatchLeaseExpiresAt &&
      error instanceof NotificationDispatchConfirmedFailure
    ) {
      await releaseConfirmedDispatchFailure(
        notificationRef,
        dispatchClaimedAt,
        dispatchLeaseExpiresAt
      )
    }

    throw error
  }

  await notificationRef.update({
    dispatchState: 'handed-off',
    dispatchHandoffAt: new Date(),
    dispatchLeaseExpiresAt: null,
  })

  return notificationId
}

class NotificationDispatchConfirmedFailure extends Error {
  constructor() {
    super('Notification email dispatch was not confirmed')
    this.name = 'NotificationDispatchConfirmedFailure'
  }
}

async function releaseConfirmedDispatchFailure(
  notificationRef: FirebaseFirestore.DocumentReference,
  expectedClaimedAt: Date,
  expectedLeaseExpiresAt: Date
): Promise<void> {
  if (!adminDb) {
    return
  }

  await adminDb.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(notificationRef)

    if (!snapshot.exists) {
      return
    }

    const data = snapshot.data() || {}

    if (
      data.dispatchHandoffAt ||
      data.dispatchState !== 'claimed'
    ) {
      return
    }

    const claimedAt = data.dispatchClaimedAt?.toDate?.()
    const leaseExpiresAt =
      data.dispatchLeaseExpiresAt?.toDate?.()

    if (
      !(claimedAt instanceof Date) ||
      !(leaseExpiresAt instanceof Date) ||
      claimedAt.getTime() !== expectedClaimedAt.getTime() ||
      leaseExpiresAt.getTime() !== expectedLeaseExpiresAt.getTime()
    ) {
      return
    }

    transaction.set(
      notificationRef,
      {
        dispatchState: 'retryable',
        dispatchClaimedAt: null,
        dispatchLeaseExpiresAt: null,
        dispatchAmbiguousAt: null,
      },
      { merge: true }
    )
  })
}

/**
 * Dispatch notification (in-app, email, etc.)
 */
async function dispatchNotification(
  userId: string,
  notification: Omit<Notification, 'timestamp' | 'read'>
): Promise<void> {
  // Get user email
  if (!adminDb) return

  const userRef = adminDb.collection('users').doc(userId)
  const userSnap = await userRef.get()
  const userEmail = userSnap.exists ? userSnap.data()?.email : null

  // Send email if email delivery is enabled
  if (notification.delivery.includes('email') && userEmail) {
    try {
      const emailHtml = generateNotificationEmail(notification)
      const emailSent = await sendEmail({
        to: userEmail,
        subject: notification.title,
        htmlBody: emailHtml,
        category: 'alert',
        queueOnFailure: false,
      })

      if (!emailSent) {
        throw new NotificationDispatchConfirmedFailure()
      }
    } catch (error) {
      console.error('Failed to send notification email:', error)
      throw error
    }
  }
}

/**
 * Generate notification email HTML
 */
function generateNotificationEmail(notification: Omit<Notification, 'timestamp' | 'read'>): string {
  const icon = getNotificationIcon(notification.type)
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #0D0A33 0%, #5A3FEF 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: #fff; margin: 0; font-size: 28px;">${icon} ${notification.title}</h1>
      </div>
      <div style="background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
        <p>${notification.message}</p>
        ${notification.metadata ? `
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 20px;">
            ${Object.entries(notification.metadata).map(([key, value]) => `
              <p style="margin: 5px 0;"><strong>${key}:</strong> ${value}</p>
            `).join('')}
          </div>
        ` : ''}
      </div>
    </body>
    </html>
  `
}

/**
 * Get notification icon
 */
function getNotificationIcon(type: string): string {
  const icons: Record<string, string> = {
    daily: '🌟',
    transit: '🔮',
    festival: '🎉',
    chakra: '✨',
    system: '📢',
  }
  return icons[type] || '📬'
}

/**
 * Queue notification for background processing
 */
export async function queueNotification(
  userId: string,
  type: string,
  scheduledFor: Date,
  payload: any,
  idempotencyKey?: string
): Promise<string> {
  if (!adminDb) {
    throw new Error('Firestore not initialized')
  }

  const normalizedKey = idempotencyKey
    ?.trim()
    .replace(/[^a-zA-Z0-9:_-]/g, '_')
    .slice(0, 400)

  const queueId = normalizedKey
    ? `queue_${normalizedKey}`
    : `queue_${Date.now()}_${Math.random().toString(36).substring(7)}`

  const queueRef = adminDb.collection('notification_queue').doc(queueId)

  if (normalizedKey) {
    const existing = await queueRef.get()

    if (existing.exists) {
      return queueId
    }
  }

  await queueRef.set({
    userId,
    type,
    scheduledFor,
    processed: false,
    payload,
    idempotencyKey: normalizedKey || null,
    createdAt: new Date(),
  })

  return queueId
}

/**
 * Process notification queue (to be called by cron job)
 */
export interface NotificationQueueProcessResult {
  due: number
  claimed: number
  processed: number
  failed: number
  skipped: number
  leaseConflicts: number
  hasMore: boolean
}

export async function processNotificationQueue(): Promise<NotificationQueueProcessResult> {
  if (!adminDb) {
    return {
      due: 0,
      claimed: 0,
      processed: 0,
      failed: 0,
      skipped: 0,
      leaseConflicts: 0,
      hasMore: false,
    }
  }

  const now = new Date()
  const leaseDurationMs = 5 * 60 * 1000
  const runLeaseId =
    `lease_${Date.now()}_${Math.random().toString(36).substring(7)}`

  const queueRef = adminDb.collection('notification_queue')
  const queueSnap = await queueRef
    .where('processed', '==', false)
    .where('scheduledFor', '<=', now)
    .limit(101)
    .get()

  const queueDocs = queueSnap.docs.slice(0, 100)
  const hasMore = queueSnap.docs.length > queueDocs.length

  const result: NotificationQueueProcessResult = {
    due: queueDocs.length,
    claimed: 0,
    processed: 0,
    failed: 0,
    skipped: 0,
    leaseConflicts: 0,
    hasMore,
  }

  for (const doc of queueDocs) {
    let claimed = false

    try {
      const claimOutcome = await adminDb.runTransaction(
        async (transaction): Promise<'claimed' | 'skipped' | 'leased'> => {
          const fresh = await transaction.get(doc.ref)

          if (!fresh.exists) {
            return 'skipped'
          }

          const data = fresh.data() || {}

          if (data.processed === true) {
            return 'skipped'
          }

          const leaseExpiresAt = data.leaseExpiresAt?.toDate?.()

          if (
            data.processing === true &&
            leaseExpiresAt instanceof Date &&
            leaseExpiresAt.getTime() > Date.now()
          ) {
            return 'leased'
          }

          transaction.update(doc.ref, {
            processing: true,
            leaseId: runLeaseId,
            leaseExpiresAt: new Date(Date.now() + leaseDurationMs),
            lastAttemptAt: new Date(),
            attempts: Number(data.attempts || 0) + 1,
            error: null,
          })

          return 'claimed'
        }
      )

      claimed = claimOutcome === 'claimed'

      if (!claimed) {
        result.skipped++

        if (claimOutcome === 'leased') {
          result.leaseConflicts++
          result.hasMore = true
        }

        continue
      }

      result.claimed++

      const queueItem = doc.data()

      await createNotification(
        queueItem.userId,
        queueItem.payload,
        doc.id
      )

      const markedProcessed = await adminDb.runTransaction(
        async (transaction) => {
          const fresh = await transaction.get(doc.ref)

          if (!fresh.exists) {
            return false
          }

          const data = fresh.data() || {}

          if (
            data.processed === true ||
            data.leaseId !== runLeaseId
          ) {
            return false
          }

          transaction.update(doc.ref, {
            processed: true,
            processedAt: new Date(),
            processing: false,
            leaseId: null,
            leaseExpiresAt: null,
            error: null,
          })

          return true
        }
      )

      if (!markedProcessed) {
        throw new Error(
          'Notification queue lease ownership changed before completion'
        )
      }

      result.processed++
    } catch (error) {
      console.error('Failed to process notification:', error)
      result.failed++

      if (!claimed) {
        continue
      }

      try {
        await adminDb.runTransaction(async (transaction) => {
          const fresh = await transaction.get(doc.ref)

          if (!fresh.exists) {
            return
          }

          const data = fresh.data() || {}

          if (
            data.processed === true ||
            data.leaseId !== runLeaseId
          ) {
            return
          }

          transaction.update(doc.ref, {
            processing: false,
            leaseId: null,
            leaseExpiresAt: null,
            error:
              error instanceof Error
                ? error.message.slice(0, 300)
                : 'Notification processing failed',
          })
        })
      } catch (releaseError) {
        console.error(
          'Failed to release notification lease:',
          releaseError
        )
      }
    }
  }

  return result
}
