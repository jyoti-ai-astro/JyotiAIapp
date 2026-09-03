export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'
import { envVars } from '@/lib/env/env.mjs'

type JobDefinition = {
  id: string
  name: string
  schedule: string
  configured: boolean
  schedulerConfigured: boolean
  endpoint: string | null
}

const JOB_DEFINITIONS: JobDefinition[] = [
  {
    id: 'daily-horoscope',
    name: 'Daily Horoscope Job',
    schedule: '5 AM daily',
    configured: true,
    schedulerConfigured: false,
    endpoint: '/api/workers/daily-horoscope',
  },
  {
    id: 'transit-alert',
    name: 'Transit Alert Job',
    schedule: 'Hourly',
    configured: true,
    schedulerConfigured: false,
    endpoint: '/api/workers/transit-alert',
  },
  {
    id: 'festival',
    name: 'Festival Job',
    schedule: 'Midnight daily',
    configured: true,
    schedulerConfigured: false,
    endpoint: '/api/workers/festival',
  },
  {
    id: 'notification-queue',
    name: 'Notification Queue Worker',
    schedule: 'External scheduler required',
    configured: true,
    schedulerConfigured: false,
    endpoint: '/api/workers/process-queue',
  },
]

function deriveStatus(definition: JobDefinition, state: Record<string, any> | undefined) {
  if (!definition.configured) return 'unconfigured'
  if (!definition.schedulerConfigured && !state?.lastRun) return 'unscheduled'
  if (state?.lastStatus === 'failed') return 'failed'
  if (state?.lastStatus === 'running') return 'running'
  if (state?.lastStatus === 'partial') return 'partial'
  if (state?.lastStatus === 'success' && !definition.schedulerConfigured) return 'manual-only'
  if (state?.lastStatus === 'success') return 'healthy'
  return 'unknown'
}

export async function GET(request: NextRequest) {
  return withAdminAuth(
    async () => {
      if (!adminDb) {
        return NextResponse.json(
          { error: 'Firestore not initialized' },
          { status: 500 }
        )
      }

      try {
        const snapshot = await adminDb.collection('background_jobs').get()
        const persisted = new Map(
          snapshot.docs.map((doc) => [doc.id, doc.data()])
        )

        const jobs = JOB_DEFINITIONS.map((definition) => {
          const state = persisted.get(definition.id)

          return {
            ...definition,
            ...(state || {}),
            status: deriveStatus(definition, state),
            failures: Number(state?.failures || 0),
            lastRun: state?.lastRun || null,
            lastSuccess: state?.lastSuccess || null,
            lastFailure: state?.lastFailure || null,
            lastDurationMs: state?.lastDurationMs || null,
            lastError: state?.lastError || null,
          }
        })

        return NextResponse.json({
          success: true,
          jobs,
          scheduler: {
            configured: false,
            source: 'none-detected-in-repository',
          },
        })
      } catch (error: any) {
        console.error('Get jobs error:', error)
        return NextResponse.json(
          { error: error?.message || 'Failed to get jobs' },
          { status: 500 }
        )
      }
    },
    'logs.read'
  )(request)
}

export async function POST(request: NextRequest) {
  return withAdminAuth(
    async (req, admin) => {
      try {
        const { jobId } = await req.json()
        const definition = JOB_DEFINITIONS.find((job) => job.id === jobId)

        if (!definition) {
          return NextResponse.json(
            { error: 'Invalid job ID' },
            { status: 400 }
          )
        }

        if (!definition.configured || !definition.endpoint) {
          return NextResponse.json(
            {
              error: 'Job is not implemented as an executable worker route',
              status: 'unconfigured',
            },
            { status: 409 }
          )
        }

        const workerKey = envVars.worker.apiKey

        if (!workerKey) {
          return NextResponse.json(
            { error: 'Worker API key is not configured' },
            { status: 503 }
          )
        }

        const response = await fetch(`${req.nextUrl.origin}${definition.endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': workerKey,
            'x-trigger-source': `admin:${admin.uid}`,
          },
          cache: 'no-store',
        })

        const payload = await response.json().catch(() => null)

        if (!response.ok) {
          return NextResponse.json(
            {
              error: payload?.error || 'Worker execution failed',
              status: 'failed',
            },
            { status: response.status }
          )
        }

        const hasMore = payload?.result?.hasMore === true
        const workerPartial =
          payload?.result?.status === 'partial'
        const rawDeadLetteredItems =
          payload?.result?.deadLetteredItems
        const deadLetteredItems =
          typeof rawDeadLetteredItems === 'number' &&
          Number.isFinite(rawDeadLetteredItems)
            ? Math.max(0, Math.floor(rawDeadLetteredItems))
            : 0

        return NextResponse.json({
          success: true,
          status:
            workerPartial || hasMore
              ? 'partial'
              : 'completed',
          hasMore,
          deadLetteredItems,
          worker: payload || null,
        })
      } catch (error: any) {
        console.error('Trigger job error:', error)
        return NextResponse.json(
          { error: error?.message || 'Failed to trigger job' },
          { status: 500 }
        )
      }
    },
    'jobs.trigger'
  )(request)
}
