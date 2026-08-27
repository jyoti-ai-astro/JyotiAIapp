import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      code: 'LEGACY_GURU_CHAT_DISABLED',
      message: 'Legacy Guru chat is disabled for Launch v1. Use the canonical /api/guru endpoint.',
    },
    { status: 410 }
  )
}
