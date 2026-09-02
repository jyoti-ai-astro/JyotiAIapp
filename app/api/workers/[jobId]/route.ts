import { NextRequest, NextResponse } from 'next/server'

import { envVars } from '@/lib/env/env.mjs'
import {
  executeProducerJob,
  ExecutableProducerJobId,
  JobExecutionConflictError,
} from '@/lib/workers/job-execution-controller'

export const dynamic = 'force-dynamic'

const EXECUTABLE_JOBS = new Set<ExecutableProducerJobId>([
  'daily-horoscope',
  'transit-alert',
  'festival',
])

function isExecutableJobId(
  value: string
): value is ExecutableProducerJobId {
  return EXECUTABLE_JOBS.has(value as ExecutableProducerJobId)
}

function unauthorized() {
  return NextResponse.json(
    {
      success: false,
      error: 'Unauthorized',
    },
    { status: 401 }
  )
}

export async function POST(
  request: NextRequest,
  context: { params: { jobId: string } }
) {
  const expectedApiKey = envVars.worker.apiKey
  const suppliedApiKey = request.headers.get('x-api-key')

  if (
    !expectedApiKey ||
    !suppliedApiKey ||
    suppliedApiKey !== expectedApiKey
  ) {
    return unauthorized()
  }

  const jobId = context.params.jobId

  if (!isExecutableJobId(jobId)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unknown or non-executable worker job',
      },
      { status: 404 }
    )
  }

  let body: unknown = {}

  try {
    const raw = await request.text()
    body = raw ? JSON.parse(raw) : {}
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid JSON body',
      },
      { status: 400 }
    )
  }

  const payload =
    body && typeof body === 'object'
      ? (body as Record<string, unknown>)
      : {}

  const requestedBatchSize =
    typeof payload.batchSize === 'number' &&
    Number.isFinite(payload.batchSize)
      ? payload.batchSize
      : undefined

  const triggerSourceHeader =
    request.headers.get('x-trigger-source')?.trim()

  const triggerSource =
    triggerSourceHeader
      ? triggerSourceHeader.slice(0, 100)
      : 'worker-api'

  try {
    const result = await executeProducerJob({
      jobId,
      triggerSource,
      batchSize: requestedBatchSize,
    })

    return NextResponse.json({
      success: true,
      result,
    })
  } catch (error) {
    if (error instanceof JobExecutionConflictError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Job execution already active',
        },
        { status: 409 }
      )
    }

    console.error('Worker execution failed:', {
      jobId,
      error:
        error instanceof Error
          ? error.message
          : 'Unknown worker execution failure',
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Worker execution failed',
      },
      { status: 500 }
    )
  }
}
