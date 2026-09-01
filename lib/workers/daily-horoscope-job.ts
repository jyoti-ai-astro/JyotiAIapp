import { adminDb } from '@/lib/firebase/admin'
import { generateDailyHoroscope } from '@/lib/engines/horoscope/daily-horoscope'
import { queueNotification } from '@/lib/services/notification-service'
import {
  ExecutorOptions,
  ExecutorResult,
  getNextCalendarDateKey,
  localHourToUtcDate,
  normalizeBatchSize,
  normalizeTimezone,
} from '@/lib/workers/executor-runtime'

export async function runDailyHoroscopeJob(
  options: ExecutorOptions = {}
): Promise<ExecutorResult> {
  if (!adminDb) {
    throw new Error('Firestore not initialized')
  }

  const batchSize = normalizeBatchSize(options.batchSize)
  const now = options.now ? new Date(options.now) : new Date()

  let query = adminDb
    .collection('users')
    .where('onboarded', '==', true)
    .orderBy('__name__')
    .limit(batchSize + 1)

  if (options.cursor) {
    query = query.startAfter(options.cursor)
  }

  const snapshot = await query.get()
  const hasMore = snapshot.docs.length > batchSize
  const docs = snapshot.docs.slice(0, batchSize)

  let processed = 0
  let skipped = 0
  let errors = 0

  for (const userDoc of docs) {
    try {
      const userData = userDoc.data()
      const uid = userDoc.id
      const rashi = userData.rashi

      if (!rashi) {
        skipped++
        continue
      }

      const timezone = normalizeTimezone(userData.timezone)
      const calendarKey = getNextCalendarDateKey(now, timezone)
      const scheduledFor = localHourToUtcDate(calendarKey, 5, timezone)

      const horoscope = await generateDailyHoroscope(
        rashi,
        userData.rashiMoon,
        userData.rashiSun,
        userData.ascendant
      )

      await queueNotification(
        uid,
        'daily',
        scheduledFor,
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
            timezone,
            calendarKey,
          },
        },
        `daily:${uid}:${calendarKey}`
      )

      processed++
    } catch (error) {
      console.error(`Error processing user ${userDoc.id}:`, error)
      errors++
    }
  }

  return {
    processed,
    skipped,
    errors,
    hasMore,
    nextCursor: hasMore && docs.length ? docs[docs.length - 1].id : null,
  }
}
