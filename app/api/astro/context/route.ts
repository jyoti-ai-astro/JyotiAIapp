import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      code: 'LEGACY_ASTRO_CONTEXT_DISABLED',
      message:
        'Legacy astro context is disabled for Launch v1. Use canonical feature APIs backed by verified Kundali data.',
    },
    { status: 410 }
  );
}
