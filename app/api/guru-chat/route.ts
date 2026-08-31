import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  return NextResponse.json(
    {
      error: 'LEGACY_GURU_ROUTE_DISABLED',
      message: 'This legacy Guru endpoint is disabled. Use the current Jyoti Guru experience.',
    },
    { status: 410 }
  )
}
