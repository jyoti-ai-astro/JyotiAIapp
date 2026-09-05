import { adminDb } from '@/lib/firebase/admin'
import {
  getUpcomingTransits,
  matchTransitsWithKundali,
} from '@/lib/engines/transit/transit-engine'
import { queueNotification } from '@/lib/services/notification-service'
import {
  ExecutorOptions,
  ExecutorResult,
  normalizeBatchSize,
} from '@/lib/workers/executor-runtime'

export async function runTransitAlertJob(
  options: ExecutorOptions = {}
): Promise<ExecutorResult> {
  if (!adminDb) {
    throw new Error('Firestore not initialized')
  }

  const batchSize = normalizeBatchSize(options.batchSize)
  const now = options.now ? new Date(options.now) : new Date()
  const transits = await getUpcomingTransits(now, 1)

  if (transits.length === 0) {
    return {
      processed: 0,
      skipped: 0,
      errors: 0,
      failedItemIds: [],
      hasMore: false,
      nextCursor: null,
    }
  }

  let query = adminDb
    .collection('kundali')
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

  for (const kundaliDoc of docs) {
    if (
      options.retryItemIds?.length &&
      !options.retryItemIds.includes(kundaliDoc.id)
    ) {
      skipped++
      continue
    }

    try {
      const uid = kundaliDoc.id
      const D1Snap = await kundaliDoc.ref.collection('D1').doc('chart').get()

      if (!D1Snap.exists) {
        skipped++
        continue
      }

      const D1Data = D1Snap.data()
      const userTransits = matchTransitsWithKundali(transits, {
        grahas: D1Data?.grahas || {},
        bhavas: D1Data?.bhavas || {},
      })

      for (const userTransit of userTransits) {
        if (
          userTransit.transit.impact !== 'strong' &&
          userTransit.transit.impact !== 'medium'
        ) {
          continue
        }

        const transitInstant = new Date(userTransit.transit.date)
        const scheduledFor = new Date(
          transitInstant.getTime() - 2 * 60 * 60 * 1000
        )

        await queueNotification(
          uid,
          'transit',
          scheduledFor,
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
          },
          `transit:${uid}:${userTransit.transit.planet}:${transitInstant.toISOString()}`
        )
      }

      processed++
    } catch (error) {
      console.error(`Error processing transit for user ${kundaliDoc.id}:`, error)
      errors++
      failedItemIds.push(kundaliDoc.id)
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
