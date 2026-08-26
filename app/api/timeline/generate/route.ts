import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      code: 'LEGACY_TIMELINE_GENERATE_DISABLED',
      message: 'Legacy timeline generation is disabled for Launch v1. Use /api/timeline.',
    },
    { status: 410 }
  );
}
