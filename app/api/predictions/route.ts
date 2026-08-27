/**
 * Predictions API Route
 * 
 * Mega Build 2 - Prediction Engine + Timeline Engine
 * API endpoint for 12-month predictions
 */

import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase/admin'
import { AstroContextError, buildAstroContext } from '@/lib/engines/astro-context-builder'
import { runPredictionEngine } from '@/lib/engines/prediction-engine-v2'
import { ensureFeatureAccess, consumeFeatureTicket } from '@/lib/payments/ticket-service'
import type { FeatureKey } from '@/lib/payments/feature-access'

export const dynamic = 'force-dynamic'

/**
 * Timeout helper for promises
 */
async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string
): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`TIMEOUT:${label}`))
    }, ms)
  })

  return Promise.race([promise, timeout])
}

export async function POST(request: NextRequest) {
  // Top-level try/catch to ensure we never throw unhandled errors
  try {
    // Get user session
    const sessionCookie = request.cookies.get('session')?.value
    let userId: string | null = null

    if (sessionCookie && adminAuth) {
      try {
        const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true)
        userId = decodedClaims.uid
      } catch (error) {
        // Not authenticated
        return NextResponse.json(
          {
            status: 'error',
            code: 'UNAUTHENTICATED',
            message: 'Please log in to generate predictions.',
          },
          { status: 401 }
        )
      }
    } else {
      return NextResponse.json(
        {
          status: 'error',
          code: 'UNAUTHENTICATED',
          message: 'Please log in to generate predictions.',
        },
        { status: 401 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        {
          status: 'error',
          code: 'UNAUTHENTICATED',
          message: 'Please log in to generate predictions.',
        },
        { status: 401 }
      )
    }

    // Phase S: Ticket enforcement
    const featureKey: FeatureKey = 'predictions'
    try {
      await ensureFeatureAccess(userId, featureKey)
    } catch (err: any) {
      if (err.code === 'NO_TICKETS') {
        return NextResponse.json(
          {
            status: 'error',
            code: 'NO_TICKETS',
            message: 'You have no credits left for this feature.',
          },
          { status: 403 }
        )
      }
      throw err
    }

    // Parse request body
    let body: { question?: string | null } = {}
    try {
      body = await request.json()
    } catch (error) {
      return NextResponse.json(
        {
          status: 'error',
          code: 'INVALID_INPUT',
          message: 'Invalid request body.',
        },
        { status: 400 }
      )
    }

    const { question } = body

    // Get canonical AstroContext before spending OpenAI/report generation work.
    let astroContext
    try {
      astroContext = await buildAstroContext(userId)
    } catch (error: any) {
      if (error instanceof AstroContextError) {
        return NextResponse.json(
          {
            status: 'error',
            code: error.code,
            message: error.message,
          },
          { status: 409 }
        )
      }

      console.error('Error building astro context:', error)
      return NextResponse.json(
        {
          status: 'error',
          code: 'ASTRO_CONTEXT_FAILED',
          message: 'Unable to load your Kundali context. Please try again.',
        },
        { status: 500 }
      )
    }

    // Create AbortController with 30s timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    try {
      // Call prediction engine with timeout
      const result = await withTimeout(
        runPredictionEngine({
          astroContext,
          userQuestion: question ?? null,
          ragMode: 'light',
          signal: controller.signal,
        }),
        30000,
        'prediction-engine'
      )

      clearTimeout(timeoutId)

      // Phase S: Consume ticket after successful generation
      if (
        result.status === 'error' ||
        !result.usedAstroContext ||
        result.sections.length === 0 ||
        !result.overview
      ) {
        return NextResponse.json(
          {
            status: 'error',
            code: 'PREDICTION_GENERATION_FAILED',
            message: 'Unable to generate personalized predictions. Please try again.',
          },
          { status: 502 }
        )
      }

      try {
        await consumeFeatureTicket(userId, featureKey)
      } catch (err: any) {
        console.error('Ticket consumption error:', err)
        return NextResponse.json(
          {
            status: 'error',
            code: 'TICKET_CONSUMPTION_FAILED',
            message: 'Prediction generated, but credit consumption failed. Please retry or contact support.',
          },
          { status: 409 }
        )
      }

      // Return result
      return NextResponse.json({
        status: result.status,
        data: result,
      })
    } catch (error: any) {
      clearTimeout(timeoutId)

      // Check if timeout
      if (error.message?.includes('TIMEOUT')) {
        return NextResponse.json(
          {
            status: 'error',
            code: 'PREDICTION_TIMEOUT',
            message: 'Prediction generation timed out. Please try again.',
          },
          { status: 504 }
        )
      }

      // Check if aborted
      if (error.name === 'AbortError' || controller.signal.aborted) {
        return NextResponse.json(
          {
            status: 'error',
            code: 'PREDICTION_TIMEOUT',
            message: 'Prediction generation timed out. Please try again.',
          },
          { status: 504 }
        )
      }

      console.error('Error in prediction engine:', error)
      return NextResponse.json(
        {
          status: 'error',
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while generating predictions. Please try again.',
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Unhandled error in predictions API:', error)
    return NextResponse.json(
      {
        status: 'error',
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while generating predictions. Please try again.',
      },
      { status: 500 }
    )
  }
}
