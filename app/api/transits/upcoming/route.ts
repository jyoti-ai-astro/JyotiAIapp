import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('session')?.value

    if (!sessionCookie || !adminAuth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await adminAuth.verifySessionCookie(sessionCookie, true)

    return NextResponse.json(
      {
        success: false,
        code: 'TRANSIT_ENGINE_UNAVAILABLE',
        message:
          'Personalized transit calculations are temporarily unavailable while JyotiAI completes canonical ephemeris integration.',
      },
      { status: 503 }
    )
  } catch {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
}
