/**
 * Transit Alert Background Job
 * Part B - Section 8: Notifications & Daily Insights
 * Milestone 7 - Step 5
 * 
 * Runs hourly to detect and alert about upcoming transits
 */

import { adminDb } from '@/lib/firebase/admin'
import { getUpcomingTransits, matchTransitsWithKundali } from '@/lib/engines/transit/transit-engine'
import { queueNotification } from '@/lib/services/notification-service'

/**
 * Transit Alert Job
 * Detects transits in next 24 hours and queues alerts
 */
export async function runTransitAlertJob(): Promise<void> {
  if (!adminDb) {
    throw new Error('Firestore not initialized')
  }

  console.log('Starting transit alert job...')

  // Get upcoming transits (next 24 hours)
  const tomorrow = new Date()
  tomorrow.setHours(tomorrow.getHours() + 24)
  const transits = await getUpcomingTransits(new Date(), 1)

  if (transits.length === 0) {
    console.log('No transits detected')
    return
  }

  // Get all users with kundali
  const kundaliRef = adminDb.collection('kundali')
  const kundaliSnap = await kundaliRef.get()

  let processed = 0
  let errors = 0

  for (const kundaliDoc of kundaliSnap.docs) {
    try {
      const uid = kundaliDoc.id

      // Get D1 chart
      const D1Snap = await kundaliDoc.ref.collection('D1').doc('chart').get()
      if (!D1Snap.exists) {
        continue
      }

      const D1Data = D1Snap.data()
      const userTransits = matchTransitsWithKundali(transits, {
        grahas: D1Data?.grahas || {},
        bhavas: D1Data?.bhavas || {},
      })

      // Queue notifications for strong/medium impact transits
      for (const userTransit of userTransits) {
        if (userTransit.transit.impact === 'strong' || userTransit.transit.impact === 'medium') {
          const transitDate = new Date(userTransit.transit.date)
          transitDate.setHours(transitDate.getHours() - 2) // Alert 2 hours before

          await queueNotification(
            uid,
            'transit',
            transitDate,
            {
              type: 'transit',
              title: `🔮 ${userTransit.transit.planet} Transit Alert`,
              message: `${userTransit.transit.event}: ${userTransit.transit.description}`,
              category: 'transit',
              delivery: ['inapp', 'email'],
              metadata: {
                planet: userTransit.transit.planet,
                impact: userTransit.transit.impact,
                affectedAreas: userTransit.affectedAreas.join(', '),
                recommendation: userTransit.transit.recommendation,
              },
            }
          )
        }
      }

      processed++
    } catch (error) {
      console.error(`Error processing transit for user ${kundaliDoc.id}:`, error)
      errors++
    }
  }

  console.log(`Transit alert job completed. Processed: ${processed}, Errors: ${errors}`)
}

/**
 * Export for Cloudflare Worker
 */
export default {
  async scheduled(event: ScheduledEvent, env: any, ctx: ExecutionContext) {
    await runTransitAlertJob()
  },
}

