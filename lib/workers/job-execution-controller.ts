import { randomUUID } from 'crypto'

import { adminDb } from '@/lib/firebase/admin'
import { recordOperationalEvent } from '@/lib/observability/operational-events'
import {
  ExecutorOptions,
  ExecutorResult,
  normalizeBatchSize,
} from '@/lib/workers/executor-runtime'

export type ExecutableProducerJobId =
  | 'daily-horoscope'
  | 'transit-alert'
  | 'festival'

export interface JobExecutionRequest {
  jobId: ExecutableProducerJobId
  triggerSource: string
  batchSize?: number
}

export interface JobExecutionResponse
  extends Omit<ExecutorResult, 'failedItemIds'> {
  jobId: ExecutableProducerJobId
  executionId: string
  durationMs: number
  status: 'success' | 'partial'
  deadLetteredItems: number
}

export class JobExecutionConflictError extends Error {
  constructor(message = 'Job execution is already active') {
    super(message)
    this.name = 'JobExecutionConflictError'
  }
}

const JOB_EXECUTION_LEASE_MS = 10 * 60 * 1000
const JOB_EXECUTION_HEARTBEAT_MS = 2 * 60 * 1000
const MAX_BATCH_FAILURE_ATTEMPTS = 3
const LOGICAL_RUN_MAX_AGE_MS = 24 * 60 * 60 * 1000

function jobRef(jobId: ExecutableProducerJobId) {
  if (!adminDb) {
    throw new Error('Firestore not initialized')
  }

  return adminDb.collection('background_jobs').doc(jobId)
}

function toDate(value: any): Date | null {
  if (!value) return null
  if (value instanceof Date) return value

  if (typeof value.toDate === 'function') {
    const converted = value.toDate()
    return converted instanceof Date ? converted : null
  }

  return null
}

async function loadExecutor(jobId: ExecutableProducerJobId) {
  switch (jobId) {
    case 'daily-horoscope': {
      const { runDailyHoroscopeJob } = await import(
        '@/lib/workers/daily-horoscope-job'
      )
      return runDailyHoroscopeJob
    }

    case 'transit-alert': {
      const { runTransitAlertJob } = await import(
        '@/lib/workers/transit-alert-job'
      )
      return runTransitAlertJob
    }

    case 'festival': {
      const { runFestivalJob } = await import(
        '@/lib/workers/festival-job'
      )
      return runFestivalJob
    }
  }
}

export async function executeProducerJob(
  request: JobExecutionRequest
): Promise<JobExecutionResponse> {
  if (!adminDb) {
    throw new Error('Firestore not initialized')
  }

  const db = adminDb
  const startedAtMs = Date.now()
  const startedAt = new Date(startedAtMs)
  const executionId = randomUUID()
  const batchSize = normalizeBatchSize(request.batchSize)
  const ref = jobRef(request.jobId)

  const claim = await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref)
    const state = snapshot.exists ? snapshot.data() || {} : {}

    const currentLeaseExpiry = toDate(state.executionLeaseExpiresAt)
    const leaseActive =
      Boolean(state.executionId) &&
      currentLeaseExpiry instanceof Date &&
      currentLeaseExpiry.getTime() > startedAtMs

    if (leaseActive) {
      return {
        claimed: false as const,
        cursor: null as string | null,
      }
    }

    const cursor =
      typeof state.cursor === 'string' && state.cursor.trim()
        ? state.cursor
        : null

    const persistedLogicalRunStartedAt = toDate(
      state.logicalRunStartedAt
    )

    const logicalRunStale =
      persistedLogicalRunStartedAt instanceof Date &&
      startedAtMs - persistedLogicalRunStartedAt.getTime() >
        LOGICAL_RUN_MAX_AGE_MS

    const effectiveCursor = logicalRunStale ? null : cursor

    const logicalRunStartedAt = logicalRunStale
      ? startedAt
      : persistedLogicalRunStartedAt ?? startedAt

    const logicalRunDeadLetteredItems = logicalRunStale
      ? 0
      : Math.max(0, Number(state.logicalRunDeadLetteredItems || 0))

    const batchFailureItemIds =
      !logicalRunStale &&
      state.batchFailureCursor === effectiveCursor &&
      Array.isArray(state.batchFailureItemIds)
        ? state.batchFailureItemIds.filter(
            (itemId: unknown): itemId is string =>
              typeof itemId === 'string' && Boolean(itemId)
          )
        : []

    const batchFailureNextCursor =
      !logicalRunStale &&
      state.batchFailureCursor === effectiveCursor &&
      typeof state.batchFailureNextCursor === 'string'
        ? state.batchFailureNextCursor
        : null

    const batchFailureHasMore =
      !logicalRunStale &&
      state.batchFailureCursor === effectiveCursor &&
      typeof state.batchFailureHasMore === 'boolean'
        ? state.batchFailureHasMore
        : null

    transaction.set(
      ref,
      {
        executionId,
        executionStartedAt: startedAt,
        executionLeaseExpiresAt: new Date(
          startedAtMs + JOB_EXECUTION_LEASE_MS
        ),
        lastRun: startedAt,
        logicalRunStartedAt,
        lastStatus: 'running',
        lastTriggerSource: request.triggerSource,
        lastError: null,
        ...(logicalRunStale
          ? {
              cursor: null,
              hasMore: false,
              logicalRunDeadLetteredItems: 0,
              batchFailureCursor: null,
              batchFailureAttempts: 0,
              batchFailureItemIds: [],
              batchFailureNextCursor: null,
              batchFailureHasMore: null,
            }
          : {}),
      },
      { merge: true }
    )

    return {
      claimed: true as const,
      cursor: effectiveCursor,
      logicalRunStartedAt,
      logicalRunDeadLetteredItems,
      batchFailureItemIds,
      batchFailureNextCursor,
      batchFailureHasMore,
    }
  })

  if (!claim.claimed) {
    throw new JobExecutionConflictError()
  }

  await recordOperationalEvent('job.started', {
    jobId: request.jobId,
    triggerSource: request.triggerSource,
    executionId,
    batchSize,
  })

  let heartbeatTimer: ReturnType<typeof setInterval> | null = null
  let heartbeatInFlight = false

  const renewLease = async () => {
    if (heartbeatInFlight) return

    heartbeatInFlight = true

    try {
      await db.runTransaction(async (transaction) => {
        const snapshot = await transaction.get(ref)

        if (!snapshot.exists) {
          return
        }

        const state = snapshot.data() || {}

        if (state.executionId !== executionId) {
          return
        }

        transaction.set(
          ref,
          {
            executionLeaseExpiresAt: new Date(
              Date.now() + JOB_EXECUTION_LEASE_MS
            ),
          },
          { merge: true }
        )
      })
    } catch (error) {
      console.error(
        `[workers] Failed to renew execution lease for ${request.jobId}`,
        error
      )
    } finally {
      heartbeatInFlight = false
    }
  }

  try {
    heartbeatTimer = setInterval(() => {
      void renewLease()
    }, JOB_EXECUTION_HEARTBEAT_MS)

    const executor = await loadExecutor(request.jobId)

    const options: ExecutorOptions = {
      cursor: claim.cursor,
      batchSize,
      now: claim.logicalRunStartedAt,
      retryItemIds: claim.batchFailureItemIds.length
        ? claim.batchFailureItemIds
        : undefined,
    }

    const result = await executor(options)

    if (claim.batchFailureItemIds.length) {
      if (typeof claim.batchFailureHasMore === 'boolean') {
        result.hasMore = claim.batchFailureHasMore
      }

      result.nextCursor = claim.batchFailureNextCursor
    }

    const completedAt = new Date()
    const durationMs = Date.now() - startedAtMs

    if (result.errors > 0) {
      const message =
        `Producer batch completed with ${result.errors} item error` +
        (result.errors === 1 ? '' : 's')

      const accumulatedDeadLetteredItems =
        claim.logicalRunDeadLetteredItems +
        result.failedItemIds.length

      const deadLetterRef = db
        .collection('background_job_dead_letters')
        .doc(`${request.jobId}-${executionId}`)

      let batchFailureAttempt = 1
      let deadLettered = false

      await db.runTransaction(async (transaction) => {
        const snapshot = await transaction.get(ref)

        if (!snapshot.exists) {
          throw new Error(
            'Background job state disappeared during failed batch completion'
          )
        }

        const state = snapshot.data() || {}

        if (state.executionId !== executionId) {
          throw new JobExecutionConflictError(
            'Job execution lease ownership changed before failed batch completion'
          )
        }

        const persistedFailureCursor =
          typeof state.batchFailureCursor === 'string'
            ? state.batchFailureCursor
            : null

        const sameFailedBatch =
          persistedFailureCursor === claim.cursor

        batchFailureAttempt =
          sameFailedBatch
            ? Number(state.batchFailureAttempts || 0) + 1
            : 1

        deadLettered =
          batchFailureAttempt >= MAX_BATCH_FAILURE_ATTEMPTS

        if (deadLettered) {
          transaction.set(deadLetterRef, {
            jobId: request.jobId,
            executionId,
            failedItemIds: result.failedItemIds,
            failedItemCount: result.failedItemIds.length,
            cursor: claim.cursor,
            nextCursor: result.nextCursor,
            hasMore: result.hasMore,
            attempts: batchFailureAttempt,
            triggerSource: request.triggerSource,
            createdAt: completedAt,
          })
        }

        transaction.set(
          ref,
          {
            executionId: null,
            executionLeaseExpiresAt: null,
            executionStartedAt: null,
            cursor: deadLettered
              ? result.hasMore
                ? result.nextCursor
                : null
              : claim.cursor,
            hasMore: deadLettered ? result.hasMore : true,
            logicalRunStartedAt:
              deadLettered && !result.hasMore
                ? null
                : claim.logicalRunStartedAt,
            logicalRunDeadLetteredItems:
              deadLettered && !result.hasMore
                ? 0
                : deadLettered
                  ? accumulatedDeadLetteredItems
                  : claim.logicalRunDeadLetteredItems,
            batchFailureCursor: deadLettered
              ? null
              : claim.cursor,
            batchFailureAttempts: deadLettered
              ? 0
              : batchFailureAttempt,
            batchFailureItemIds: deadLettered
              ? []
              : result.failedItemIds,
            batchFailureNextCursor: deadLettered
              ? null
              : result.nextCursor,
            batchFailureHasMore: deadLettered
              ? null
              : result.hasMore,
            lastBatchProcessed: result.processed,
            lastBatchSkipped: result.skipped,
            lastBatchErrors: result.errors,
            lastFailure: completedAt,
            lastStatus: deadLettered ? 'partial' : 'failed',
            lastDurationMs: durationMs,
            lastError: deadLettered
              ? `${message}; ${result.failedItemIds.length} item` +
                (result.failedItemIds.length === 1 ? '' : 's') +
                ` dead-lettered after ${batchFailureAttempt} attempts`
              : message,
            lastTriggerSource: request.triggerSource,
            failures: Number(state.failures || 0) + 1,
            lastDeadLetterAt: deadLettered
              ? completedAt
              : state.lastDeadLetterAt || null,
            lastDeadLetterCount: deadLettered
              ? result.failedItemIds.length
              : Number(state.lastDeadLetterCount || 0),
          },
          { merge: true }
        )
      })

      if (deadLettered) {
        await recordOperationalEvent('job.failed', {
          jobId: request.jobId,
          triggerSource: request.triggerSource,
          executionId,
          durationMs,
          errorCode: 'BATCH_ITEMS_DEAD_LETTERED',
          deadLetteredItems: result.failedItemIds.length,
          logicalRunDeadLetteredItems: accumulatedDeadLetteredItems,
          batchFailureAttempt,
          hasMore: result.hasMore,
        })

        return {
          jobId: request.jobId,
          executionId,
          durationMs,
          status: 'partial',
          processed: result.processed,
          skipped: result.skipped,
          errors: result.errors,
          hasMore: result.hasMore,
          nextCursor: result.nextCursor,
          deadLetteredItems: accumulatedDeadLetteredItems,
        }
      }

      const batchError: any = new Error(message)
      batchError.code = 'BATCH_ITEM_ERRORS'
      batchError.statePersisted = true
      batchError.batchResult = {
        processed: result.processed,
        skipped: result.skipped,
        errors: result.errors,
        hasMore: true,
        nextCursor: claim.cursor,
      }

      throw batchError
    }

    const logicalRunDegraded =
      claim.logicalRunDeadLetteredItems > 0

    const terminalLogicalRunDegraded =
      !result.hasMore && logicalRunDegraded

    const logicalRunDeadLetterError =
      terminalLogicalRunDegraded
        ? `${claim.logicalRunDeadLetteredItems} item` +
          (claim.logicalRunDeadLetteredItems === 1 ? '' : 's') +
          ' dead-lettered during the logical run'
        : null

    await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(ref)

      if (!snapshot.exists) {
        throw new Error('Background job state disappeared during execution')
      }

      const state = snapshot.data() || {}

      if (state.executionId !== executionId) {
        throw new JobExecutionConflictError(
          'Job execution lease ownership changed before completion'
        )
      }

      transaction.set(
        ref,
        {
          executionId: null,
          executionLeaseExpiresAt: null,
          executionStartedAt: null,
          cursor: result.hasMore ? result.nextCursor : null,
          hasMore: result.hasMore,
          logicalRunStartedAt: result.hasMore
            ? claim.logicalRunStartedAt
            : null,
          logicalRunDeadLetteredItems: result.hasMore
            ? claim.logicalRunDeadLetteredItems
            : 0,
          lastBatchProcessed: result.processed,
          lastBatchSkipped: result.skipped,
          lastBatchErrors: result.errors,
          batchFailureCursor: null,
          batchFailureAttempts: 0,
          batchFailureItemIds: [],
          batchFailureNextCursor: null,
          batchFailureHasMore: null,
          ...(!result.hasMore && !terminalLogicalRunDegraded
            ? { lastSuccess: completedAt }
            : {}),
          lastStatus:
            result.hasMore || terminalLogicalRunDegraded
              ? 'partial'
              : 'success',
          lastDurationMs: durationMs,
          lastError: logicalRunDeadLetterError,
          lastTriggerSource: request.triggerSource,
        },
        { merge: true }
      )
    })

    if (!result.hasMore) {
      if (terminalLogicalRunDegraded) {
        await recordOperationalEvent('job.failed', {
          jobId: request.jobId,
          triggerSource: request.triggerSource,
          executionId,
          durationMs,
          errorCode: 'LOGICAL_RUN_DEAD_LETTERED',
          deadLetteredItems: claim.logicalRunDeadLetteredItems,
        })
      } else {
        await recordOperationalEvent('job.succeeded', {
          jobId: request.jobId,
          triggerSource: request.triggerSource,
          executionId,
          durationMs,
          processed: result.processed,
          skipped: result.skipped,
          errors: result.errors,
          hasMore: result.hasMore,
        })
      }
    }

    return {
      jobId: request.jobId,
      executionId,
      durationMs,
      status:
        result.hasMore || terminalLogicalRunDegraded
          ? 'partial'
          : 'success',
      processed: result.processed,
      skipped: result.skipped,
      errors: result.errors,
      hasMore: result.hasMore,
      nextCursor: result.nextCursor,
      deadLetteredItems: claim.logicalRunDeadLetteredItems,
    }
  } catch (error: any) {
    const durationMs = Date.now() - startedAtMs
    const message =
      error instanceof Error
        ? error.message.slice(0, 300)
        : 'Background job execution failed'

    try {
      if (error?.statePersisted !== true) {
        await db.runTransaction(async (transaction) => {
          const snapshot = await transaction.get(ref)

          if (!snapshot.exists) {
            return
          }

          const state = snapshot.data() || {}

          if (state.executionId !== executionId) {
            return
          }

          transaction.set(
            ref,
            {
              executionId: null,
              executionLeaseExpiresAt: null,
              executionStartedAt: null,
              lastFailure: new Date(),
              lastStatus: 'failed',
              lastDurationMs: durationMs,
              lastError: message,
              lastTriggerSource: request.triggerSource,
              failures: Number(state.failures || 0) + 1,
            },
            { merge: true }
          )
        })
      }

      await recordOperationalEvent('job.failed', {
        jobId: request.jobId,
        triggerSource: request.triggerSource,
        executionId,
        durationMs,
        errorCode: error?.code || error?.name || 'UNKNOWN',
      })
    } catch (loggingError) {
      console.error(
        'Background job execution failure logging error:',
        loggingError
      )
    }

    throw error
  } finally {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
    }
  }
}
