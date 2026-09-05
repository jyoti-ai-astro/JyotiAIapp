import { adminDb } from '@/lib/firebase/admin'
import {
  getFestivalForDate,
  checkDashaSensitivity,
} from '@/lib/engines/festival/festival-engine'
import { queueNotification } from '@/lib/services/notification-service'
import {
  ExecutorOptions,
  ExecutorResult,
  getCalendarDateKey,
  getNextCalendarDateKey,
  localHourToUtcDate,
  normalizeBatchSize,
  normalizeTimezone,
} from '@/lib/workers/executor-runtime'

export async function runFestivalJob(
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
  const failedItemIds: string[] = []

  for (const userDoc of docs) {
    if (
      options.retryItemIds?.length &&
      !options.retryItemIds.includes(userDoc.id)
    ) {
      skipped++
      continue
    }

    try {
      const uid = userDoc.id
      const userData = userDoc.data()
      const timezone = normalizeTimezone(userData.timezone)
      let calendarKey = getCalendarDateKey(now, timezone)
      let scheduledFor = localHourToUtcDate(calendarKey, 6, timezone)

      if (scheduledFor.getTime() <= now.getTime()) {
        calendarKey = getNextCalendarDateKey(now, timezone)
        scheduledFor = localHourToUtcDate(calendarKey, 6, timezone)
      }

      const [year, month, day] = calendarKey.split('-').map(Number)
      const festival = getFestivalForDate(
        new Date(year, month - 1, day, 12, 0, 0)
      )

      if (!festival) {
        skipped++
        continue
      }

      let dashaSensitive = false
      let currentDasha = ''

      const kundaliRef = adminDb.collection('kundali').doc(uid)
      const kundaliSnap = await kundaliRef.get()

      if (kundaliSnap.exists) {
        const dashaSnap = await kundaliRef
          .collection('dasha')
          .doc('vimshottari')
          .get()

        if (dashaSnap.exists) {
          currentDasha =
            dashaSnap.data()?.currentMahadasha?.planet || ''
          dashaSensitive = checkDashaSensitivity(
            festival,
            currentDasha
          )
        }
      }

      await queueNotification(
        uid,
        'festival',
        scheduledFor,
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
            timezone,
            calendarKey,
          },
        },
        `festival:${uid}:${festival.name}:${calendarKey}`
      )

      processed++
    } catch (error) {
      console.error(`Error processing festival for user ${userDoc.id}:`, error)
      errors++
      failedItemIds.push(userDoc.id)
    }
  }

  return {
    processed,
    skipped,
    errors,
    failedItemIds,
    hasMore,
    nextCursor: hasMore && docs.length ? docs[docs.length - 1].id : null,
  }
}
