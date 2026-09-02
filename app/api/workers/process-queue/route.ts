export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { processNotificationQueue } from '@/lib/services/notification-service'
import { recordOperationalEvent } from '@/lib/observability/operational-events'

const JOB_ID = 'notification-queue'

async function updateJobState(data: Record<string, any>) {
  if (!adminDb) return

  await adminDb
    .collection('background_jobs')
    .doc(JOB_ID)
    .set(data, { merge: true })
}

export async function POST(request: NextRequest) {
  const startedAt = Date.now()

  try {
    const { envVars } = await import('@/lib/env/env.mjs')

    const apiKey = request.headers.get('x-api-key')
    const expectedKey = envVars.worker.apiKey
    const triggerSource =
      request.headers.get('x-trigger-source') || 'external-scheduler'

    if (!expectedKey) {
      console.error('Worker API key is not configured')

      return NextResponse.json(
        { error: 'Worker endpoint unavailable' },
        { status: 503 }
      )
    }

    if (!apiKey || apiKey !== expectedKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await updateJobState({
      lastRun: new Date(),
      lastStatus: 'running',
      lastTriggerSource: triggerSource,
    })

    await recordOperationalEvent('job.started', {
      jobId: JOB_ID,
      triggerSource,
    })

    const result = await processNotificationQueue()

    if (result.failed > 0) {
      const error: any = new Error(
        `Notification queue completed with ${result.failed} failed item` +
          (result.failed === 1 ? '' : 's')
      )
      error.code = 'QUEUE_ITEM_FAILURES'
      error.queueResult = result
      throw error
    }

    const durationMs = Date.now() - startedAt

    await updateJobState({
      lastSuccess: new Date(),
      lastStatus: 'success',
      lastDurationMs: durationMs,
      lastError: null,
      lastTriggerSource: triggerSource,
    })

    await recordOperationalEvent('job.succeeded', {
      jobId: JOB_ID,
      triggerSource,
      durationMs,
    })

    return NextResponse.json({
      success: true,
      message: 'Notification queue processed',
      durationMs,
      result,
    })
  } catch (error: any) {
    const durationMs = Date.now() - startedAt
    const message =
      error instanceof Error ? error.message : 'Failed to process queue'

    try {
      let failures = 1

      if (adminDb) {
        const current = await adminDb
          .collection('background_jobs')
          .doc(JOB_ID)
          .get()

        failures = Number(current.data()?.failures || 0) + 1
      }

      await updateJobState({
        lastFailure: new Date(),
        lastStatus: 'failed',
        lastDurationMs: durationMs,
        lastError: message.slice(0, 300),
        failures,
        lastQueueResult: error?.queueResult || null,
      })

      await recordOperationalEvent('job.failed', {
        jobId: JOB_ID,
        durationMs,
        errorCode: error?.code || error?.name || 'UNKNOWN',
      })
    } catch (loggingError) {
      console.error('Process queue failure logging error:', loggingError)
    }

    console.error('Process queue error:', error)

    return NextResponse.json(
      {
        error: message,
        result: error?.queueResult || null,
      },
      { status: 500 }
    )
  }
}
