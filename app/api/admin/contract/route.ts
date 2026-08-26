import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  return withAdminAuth(async () => NextResponse.json({
    success: true,
    contract: 'mission-control',
    version: '2026-08-26.1',
    capabilities: [
      'dashboard.intelligence',
      'users.customer360',
      'payments.attribution',
      'subscriptions.retention',
      'reports.operations',
      'guru.operations',
      'knowledge.readsafe',
      'growth.firstparty',
      'audit.sanitized',
      'backups.metadata',
    ],
  }), 'monitoring.read')(request)
}
