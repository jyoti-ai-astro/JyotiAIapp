import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'

/**
 * Get Logs API
 * Milestone 10 - Step 9
 */
export async function GET(request: NextRequest) {
  return withAdminAuth(
    async (req, admin) => {
      if (!adminDb) {
        return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
      }

      try {
        const { searchParams } = new URL(req.url)
        const logType = searchParams.get('type') || 'error' // error, warn, info, api, ai, email, cron
        const level = searchParams.get('level')
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')
        const limit = parseInt(searchParams.get('limit') || '100')

        let query: any

        switch (logType) {
          case 'api':
          case 'ai':
          case 'email':
          case 'cron':
            query = adminDb.collection('logs').doc(logType).collection('items')
            break
          default:
            query = adminDb.collection('logs').doc(logType).collection('items')
        }

        if (level) {
          query = query.where('level', '==', level)
        }

        if (startDate) {
          query = query.where('timestamp', '>=', adminDb.Timestamp.fromDate(new Date(startDate)))
        }

        if (endDate) {
          query = query.where('timestamp', '<=', adminDb.Timestamp.fromDate(new Date(endDate)))
        }

        const snapshot = await query.orderBy('timestamp', 'desc').limit(limit).get()

        const logs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        return NextResponse.json({
          success: true,
          logs,
          count: logs.length,
        })
      } catch (error: any) {
        console.error('Get logs error:', error)
        return NextResponse.json(
          { error: error.message || 'Failed to get logs' },
          { status: 500 }
        )
      }
    },
    'logs.read'
  )(request)
}

