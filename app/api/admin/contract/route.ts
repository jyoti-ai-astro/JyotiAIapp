export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'

export async function GET(request: NextRequest) {
  return withAdminAuth(
    async () => NextResponse.json({
      success: true,
      contract: {
        contract: 'mission-control',
        version: '2026-08-26',
        capabilities: [
          'overview.v2',
          'users.segmented',
          'customer360.v1',
          'payments.attribution',
          'subscriptions.retention',
          'reports.health',
          'guru.health',
          'knowledge.catalog',
          'growth.first-party',
          'jobs.read',
          'monitoring.read',
          'audit.read',
          'backups.metadata',
          'staff.rbac',
          'settings.allowlist',
        ],
        financialAuthority: 'provider-verified canonical JyotiAI records',
        mutationPolicy: 'dedicated audited endpoints only',
      },
    }),
    'logs.read'
  )(request)
}
