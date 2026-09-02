/**
 * Admin Monitoring - Payment Failures
 *
 * Phase Z - Production Validation & Monitoring
 */

import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'

export const dynamic = 'force-dynamic'

export const GET = withAdminAuth(
  async () => {
    try {
      if (!adminDb) {
        return NextResponse.json(
          { error: 'Firestore not initialized' },
          { status: 500 }
        )
      }

      const failures: Array<Record<string, any>> = []
      const pageSize = 200
      const maxPages = 50
      let lastDocument: any = null
      let scanTruncated = false

      for (let page = 0; page < maxPages && failures.length < 20; page += 1) {
        let query = adminDb
          .collection('app_logs')
          .orderBy('createdAt', 'desc')
          .limit(pageSize)

        if (lastDocument) {
          query = query.startAfter(lastDocument)
        }

        const logsSnapshot = await query.get()

        if (logsSnapshot.empty) {
          break
        }

        for (const doc of logsSnapshot.docs) {
          if (doc.data().type !== 'payment.failed') {
            continue
          }

          failures.push({
            id: doc.id,
            ...doc.data(),
            createdAt:
              doc.data().createdAt?.toDate?.() ||
              doc.data().createdAt,
          })

          if (failures.length >= 20) {
            break
          }
        }

        if (logsSnapshot.size < pageSize) {
          break
        }

        lastDocument =
          logsSnapshot.docs[logsSnapshot.docs.length - 1] || null

        if (page === maxPages - 1 && failures.length < 20) {
          scanTruncated = true
        }
      }

      return NextResponse.json(failures.slice(0, 20), {
        headers: {
          'X-JyotiAI-Log-Scan-Truncated': scanTruncated ? 'true' : 'false',
        },
      })
    } catch (error: any) {
      console.error('Get payment failures error:', error)

      return NextResponse.json(
        { error: error.message || 'Failed to get payment failures' },
        { status: 500 }
      )
    }
  },
  'logs.read'
)

void (null as unknown as NextRequest)
