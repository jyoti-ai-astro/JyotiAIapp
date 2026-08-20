import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Deprecated legacy endpoint.
 *
 * Launch v1 Kundali generation must use /api/kundali/generate-full so the
 * server can enforce authentication, canonical profile data, first-onboarding
 * free generation, entitlement checks, and verified location/timezone.
 */
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      code: 'LEGACY_KUNDALI_GENERATE_DISABLED',
      error: 'Use /api/kundali/generate-full for Kundali generation.',
    },
    { status: 410 }
  )
}
