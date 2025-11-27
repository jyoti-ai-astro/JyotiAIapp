/**
 * Festival Background Job
 * Part B - Section 8: Notifications & Daily Insights
 * Milestone 7 - Step 5
 * 
 * Runs daily at midnight to check for festivals
 */

import { adminDb } from '@/lib/firebase/admin'
import { getFestivalToday, checkDashaSensitivity } from '@/lib/engines/festival/festival-engine'
import { queueNotification } from '@/lib/services/notification-service'

/**
 * Festival Job
 * Checks if today is a festival and queues notifications
 */
export async function runFestivalJob(): Promise<void> {
  if (!adminDb) {
    throw new Error('Firestore not initialized')
  }

  console.log('Starting festival job...')

  const festival = getFestivalToday()

  if (!festival) {
    console.log('No festival today')
    return
  }

  // Get all users
  const usersRef = adminDb.collection('users')
  const usersSnap = await usersRef.where('onboarded', '==', true).get()

  const today = new Date()
  today.setHours(6, 0, 0, 0) // 6 AM today

  let processed = 0
  let errors = 0

  for (const userDoc of usersSnap.docs) {
    try {
      const uid = userDoc.id

      // Check Dasha sensitivity
      let dashaSensitive = false
      let currentDasha = ''

      const kundaliRef = adminDb.collection('kundali').doc(uid)
      const kundaliSnap = await kundaliRef.get()

      if (kundaliSnap.exists) {
        const dashaSnap = await kundaliRef.collection('dasha').doc('vimshottari').get()
        if (dashaSnap.exists) {
          currentDasha = dashaSnap.data()?.currentMahadasha?.planet || ''
          dashaSensitive = checkDashaSensitivity(festival, currentDasha)
        }
      }

      // Queue festival notification
      await queueNotification(
        uid,
        'festival',
        today,
        {
          type: 'festival',
          title: `🎉 ${festival.name} - Festival Energy`,
          message: festival.description,
          category: 'festival',
          delivery: ['inapp', 'email'],
          metadata: {
            festivalName: festival.name,
            energy: festival.energy.influence,
            dashaSensitive,
            currentDasha,
            remedies: festival.remedies.join(', '),
            mantras: festival.mantras.join(', '),
          },
        }
      )

      processed++
    } catch (error) {
      console.error(`Error processing festival for user ${userDoc.id}:`, error)
      errors++
    }
  }

  console.log(`Festival job completed. Processed: ${processed}, Errors: ${errors}`)
}

/**
 * Export for Cloudflare Worker
 */
export default {
  async scheduled(event: ScheduledEvent, env: any, ctx: ExecutionContext) {
    await runFestivalJob()
  },
}

