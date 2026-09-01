import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  return NextResponse.json(
    {
      error: 'GURU_VOICE_UNAVAILABLE',
      message: 'Guru voice transcription is not available in the current launch version.',
    },
    { status: 501 }
  )
}
