import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase/admin'
import {
  AstroContextError,
  buildAstroContext,
} from '@/lib/engines/astro-context-builder'

export const dynamic = 'force-dynamic'

/**
 * Canonical authenticated AstroContext read endpoint.
 *
 * AstroContext is built from the verified JyotiAI Kundali pipeline.
 * This endpoint exists for authenticated product pages that need to
 * display chart context such as Sun sign, Moon sign, Ascendant and
 * current Mahadasha.
 *
 * Personalized generation engines such as Guru, Predictions,
 * Timeline and Reports must continue to build AstroContext
 * server-side rather than trusting client-supplied astrology data.
 */
export async function GET(request: NextRequest) {
  try {
    if (!adminAuth) {
      return NextResponse.json(
        {
          success: false,
          code: 'AUTH_UNAVAILABLE',
          message: 'Authentication service is unavailable.',
        },
        { status: 500 }
      )
    }

    const sessionCookie = request.cookies.get('session')?.value

    if (!sessionCookie) {
      return NextResponse.json(
        {
          success: false,
          code: 'UNAUTHENTICATED',
          message: 'Please log in to view your astrology context.',
        },
        { status: 401 }
      )
    }

    let uid: string

    try {
      const decodedClaims = await adminAuth.verifySessionCookie(
        sessionCookie,
        true
      )

      uid = decodedClaims.uid
    } catch {
      return NextResponse.json(
        {
          success: false,
          code: 'INVALID_SESSION',
          message: 'Your session has expired. Please log in again.',
        },
        { status: 401 }
      )
    }

    try {
      const astro = await buildAstroContext(uid)

      if (!astro) {
        return NextResponse.json(
          {
            success: false,
            code: 'ASTRO_CONTEXT_MISSING',
            message:
              'Generate or refresh your verified Kundali before requesting personalized astrology context.',
          },
          { status: 409 }
        )
      }

      return NextResponse.json({
        success: true,
        astro,
      })
    } catch (error: any) {
      if (error instanceof AstroContextError) {
        return NextResponse.json(
          {
            success: false,
            code: error.code || 'ASTRO_CONTEXT_FAILED',
            message:
              error.message ||
              'Unable to build your verified astrology context.',
          },
          { status: 409 }
        )
      }

      throw error
    }
  } catch (error: any) {
    console.error('AstroContext API error:', error)

    return NextResponse.json(
      {
        success: false,
        code: 'ASTRO_CONTEXT_FAILED',
        message: 'Unable to load astrology context.',
      },
      { status: 500 }
    )
  }
}
