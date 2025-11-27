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
  notification: Omit<Notification, 'timestamp' | 'read'>
): Promise<string> {
  if (!adminDb) {
    throw new Error('Firestore not initialized')
  }

  const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substring(7)}`
  const notificationRef = adminDb
    .collection('notifications')
    .doc(userId)
    .collection('items')
    .doc(notificationId)

  await notificationRef.set({
    ...notification,
    timestamp: new Date(),
    read: false,
  })

  // Dispatch notification
  await dispatchNotification(userId, notification)

  return notificationId
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
      await sendEmail({
        to: userEmail,
        subject: notification.title,
        htmlBody: emailHtml,
        category: 'alert',
      })
    } catch (error) {
      console.error('Failed to send notification email:', error)
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
  payload: any
): Promise<string> {
  if (!adminDb) {
    throw new Error('Firestore not initialized')
  }

  const queueId = `queue_${Date.now()}_${Math.random().toString(36).substring(7)}`
  const queueRef = adminDb.collection('notification_queue').doc(queueId)

  await queueRef.set({
    userId,
    type,
    scheduledFor,
    processed: false,
    payload,
    createdAt: new Date(),
  })

  return queueId
}

/**
 * Process notification queue (to be called by cron job)
 */
export async function processNotificationQueue(): Promise<void> {
  if (!adminDb) {
    return
  }

  const now = new Date()
  const queueRef = adminDb.collection('notification_queue')
  const queueSnap = await queueRef
    .where('processed', '==', false)
    .where('scheduledFor', '<=', now)
    .limit(100)
    .get()

  for (const doc of queueSnap.docs) {
    const queueItem = doc.data()
    try {
      await createNotification(queueItem.userId, queueItem.payload)
      await doc.ref.update({ processed: true, processedAt: new Date() })
    } catch (error) {
      console.error('Failed to process notification:', error)
      await doc.ref.update({ processed: false, error: (error as Error).message })
    }
  }
}

