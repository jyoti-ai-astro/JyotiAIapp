/**
 * Predictions API Route
 * 
 * Mega Build 2 - Prediction Engine + Timeline Engine
 * API endpoint for 12-month predictions
 */

import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase/admin'
import { getCachedAstroContext } from '@/lib/engines/astro-context-builder'
import { runPredictionEngine } from '@/lib/engines/prediction-engine-v2'

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

    // Get AstroContext
    let astroContext = null
    try {
      astroContext = await getCachedAstroContext(userId)
    } catch (error) {
      console.error('Error fetching astro context:', error)
      // Continue with null context (will return degraded mode)
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

