/**
 * Deprecated report generation route.
 *
 * Launch v1 uses one persisted report system at /api/reports/generate.
 * Keep this route as a temporary compatibility redirect so old callers do not
 * generate ephemeral browser-only PDF blobs.
 */

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  return NextResponse.redirect(new URL('/api/reports/generate', request.url), 307)
}
