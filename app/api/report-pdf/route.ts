import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      code: 'LEGACY_REPORT_PDF_DISABLED',
      message: 'Legacy report PDF generation is disabled for Launch v1. Use /api/reports/generate and /api/reports/download.',
    },
    { status: 410 }
  );
}
