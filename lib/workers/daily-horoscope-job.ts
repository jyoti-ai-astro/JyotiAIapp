/**
 * Daily Horoscope Background Job
 * Part B - Section 8: Notifications & Daily Insights
 * Milestone 7 - Step 5
 * 
 * Runs daily at 5 AM to generate and queue horoscopes
 * 
 * Note: This should be deployed as a Cloudflare Worker cron job
 * or similar background job service
 */

import { adminDb } from '@/lib/firebase/admin'
import { generateDailyHoroscope } from '@/lib/engines/horoscope/daily-horoscope'
import { queueNotification } from '@/lib/services/notification-service'

/**
 * Daily Horoscope Job
 * Processes all users and generates daily horoscopes
 */
export async function runDailyHoroscopeJob(): Promise<void> {
  if (!adminDb) {
    throw new Error('Firestore not initialized')
  }

  console.log('Starting daily horoscope job...')

  // Get all users
  const usersRef = adminDb.collection('users')
  const usersSnap = await usersRef.where('onboarded', '==', true).get()

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(5, 0, 0, 0) // 5 AM tomorrow

  let processed = 0
  let errors = 0

  for (const userDoc of usersSnap.docs) {
    try {
      const userData = userDoc.data()
      const uid = userDoc.id
      const rashi = userData.rashi

      if (!rashi) {
        continue
      }

      // Generate horoscope
      const horoscope = await generateDailyHoroscope(
        rashi,
        userData.rashiMoon,
        userData.rashiSun,
        userData.ascendant
      )

      // Queue notification
      await queueNotification(
        uid,
        'daily',
        tomorrow,
        {
          type: 'daily',
          title: `🌟 Your Daily Horoscope - ${rashi}`,
          message: horoscope.general,
          category: 'horoscope',
          delivery: ['inapp', 'email'],
          metadata: {
            rashi,
            luckyColor: horoscope.luckyColor,
            luckyNumber: horoscope.luckyNumber,
            energyLevel: horoscope.energyLevel,
          },
        }
      )

      processed++
    } catch (error) {
      console.error(`Error processing user ${userDoc.id}:`, error)
      errors++
    }
  }

  console.log(`Daily horoscope job completed. Processed: ${processed}, Errors: ${errors}`)
}

/**
 * Export for Cloudflare Worker
 */
export default {
  async scheduled(event: ScheduledEvent, env: any, ctx: ExecutionContext) {
    await runDailyHoroscopeJob()
  },
}

