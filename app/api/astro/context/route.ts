/**
 * Astro Context API
 * 
 * MEGA BUILD 1 - Phase 7 Core
 * API endpoint to fetch cached astro context for client components
 */

import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase/admin'
import { getCachedAstroContext } from '@/lib/engines/astro-context-builder'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Verify session
    const sessionCookie = request.cookies.get('session')?.value
    if (!sessionCookie || !adminAuth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true)
    const uid = decodedClaims.uid

    // Get cached astro context
    const astroContext = await getCachedAstroContext(uid)

    if (!astroContext) {
      return NextResponse.json(
        { error: 'Astro context not available. Please complete onboarding.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      astro: astroContext,
    })
  } catch (error: any) {
    console.error('Astro context API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get astro context' },
      { status: 500 }
    )
  }
}

