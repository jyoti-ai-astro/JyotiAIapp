import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase/admin'

/**
 * Refresh Kundali
 * Part B - Section 4: Step 8
 * Regenerates kundali (useful if birth details were updated)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify session
    const sessionCookie = request.cookies.get('session')?.value
    if (!sessionCookie || !adminAuth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true)
    const uid = decodedClaims.uid

    // Phase 31 - F46: Use validated environment variables
    const { envVars } = await import('@/lib/env/env.mjs')
    
    // Call generate-full endpoint internally
    const generateResponse = await fetch(
      `${envVars.app.baseUrl}/api/kundali/generate-full`,
      {
        method: 'POST',
        headers: {
          Cookie: `session=${sessionCookie}`,
        },
      }
    )

    if (!generateResponse.ok) {
      const error = await generateResponse.json()
      throw new Error(error.error || 'Failed to regenerate kundali')
    }

    const data = await generateResponse.json()

    return NextResponse.json({
      success: true,
      message: 'Kundali refreshed successfully',
      kundali: data.kundali,
    })
  } catch (error: any) {
    console.error('Refresh kundali error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to refresh kundali' },
      { status: 500 }
    )
  }
}

