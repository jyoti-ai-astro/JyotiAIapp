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

export interface JobExecutionResponse extends ExecutorResult {
  jobId: ExecutableProducerJobId
  executionId: string
  durationMs: number
  status: 'success'
}

export class JobExecutionConflictError extends Error {
  constructor(message = 'Job execution is already active') {
    super(message)
    this.name = 'JobExecutionConflictError'
  }
}

const JOB_EXECUTION_LEASE_MS = 10 * 60 * 1000

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

  const startedAtMs = Date.now()
  const startedAt = new Date(startedAtMs)
  const executionId = randomUUID()
  const batchSize = normalizeBatchSize(request.batchSize)
  const ref = jobRef(request.jobId)

  const claim = await adminDb.runTransaction(async (transaction) => {
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

    transaction.set(
      ref,
      {
        executionId,
        executionStartedAt: startedAt,
        executionLeaseExpiresAt: new Date(
          startedAtMs + JOB_EXECUTION_LEASE_MS
        ),
        lastRun: startedAt,
        lastStatus: 'running',
        lastTriggerSource: request.triggerSource,
        lastError: null,
      },
      { merge: true }
    )

    return {
      claimed: true as const,
      cursor,
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

  try {
    const executor = await loadExecutor(request.jobId)

    const options: ExecutorOptions = {
      cursor: claim.cursor,
      batchSize,
    }

    const result = await executor(options)
    const completedAt = new Date()
    const durationMs = Date.now() - startedAtMs

    await adminDb.runTransaction(async (transaction) => {
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
          lastBatchProcessed: result.processed,
          lastBatchSkipped: result.skipped,
          lastBatchErrors: result.errors,
          lastSuccess: completedAt,
          lastStatus: 'success',
          lastDurationMs: durationMs,
          lastError: null,
          lastTriggerSource: request.triggerSource,
        },
        { merge: true }
      )
    })

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

    return {
      jobId: request.jobId,
      executionId,
      durationMs,
      status: 'success',
      ...result,
    }
  } catch (error: any) {
    const durationMs = Date.now() - startedAtMs
    const message =
      error instanceof Error
        ? error.message.slice(0, 300)
        : 'Background job execution failed'

    try {
      await adminDb.runTransaction(async (transaction) => {
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
  }
}
