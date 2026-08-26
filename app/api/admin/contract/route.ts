export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'

export async function GET(request: NextRequest) {
  return withAdminAuth(
    async () => NextResponse.json({
      success: true,
      contract: {
        contract: 'mission-control',
        version: '2026-08-26-read-v1',
        capabilities: [
          'overview.v2',
          'subscriptions.retention',
          'reports.health',
          'guru.health',
          'growth.first-party',
          'monitoring.read',
          'audit.read',
        ],
        financialAuthority: 'provider-verified canonical JyotiAI records',
        mutationPolicy: 'no Mission Control mutations in this batch',
        scope: 'read-only-first-integration',
      },
    }),
    'logs.read'
  )(request)
}
