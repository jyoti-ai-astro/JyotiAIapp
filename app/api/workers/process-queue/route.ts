export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { processNotificationQueue } from '@/lib/services/notification-service'

/**
 * Process Notification Queue
 * Part B - Section 8: Notifications & Daily Insights
 * Milestone 7 - Step 6
 * 
 * This endpoint should be called by a cron job or scheduled task
 * 
 * Security: Should be protected with API key or server-only access
 */
export async function POST(request: NextRequest) {
  try {
    // Phase 31 - F46: Use validated environment variables
    const { envVars } = await import('@/lib/env/env.mjs')
    
    // Verify API key (for security)
    const apiKey = request.headers.get('x-api-key')
    const expectedKey = envVars.worker.apiKey

    if (expectedKey && apiKey !== expectedKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Process notification queue
    await processNotificationQueue()

    return NextResponse.json({
      success: true,
      message: 'Notification queue processed',
    })
  } catch (error: any) {
    console.error('Process queue error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process queue' },
      { status: 500 }
    )
  }
}

