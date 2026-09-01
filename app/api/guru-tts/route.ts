import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  return NextResponse.json(
    {
      error: 'GURU_TTS_UNAVAILABLE',
      message: 'Guru text-to-speech is not available in the current launch version.',
    },
    { status: 501 }
  )
}
