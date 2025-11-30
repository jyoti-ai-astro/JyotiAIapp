/**
 * Admin Guru Logs API
 * 
 * Mega Build 4 - Admin Command Center
 * Returns last N Guru sessions/messages with debug info
 */

import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  return withAdminAuth(async (req, admin) => {
    if (!adminDb) {
      return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
    }

    try {
      const { searchParams } = new URL(req.url)
      const limit = parseInt(searchParams.get('limit') || '50')
      const todayOnly = searchParams.get('today') === 'true'

      const now = new Date()
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const todayEnd = new Date(todayStart)
      todayEnd.setDate(todayEnd.getDate() + 1)

      const sessions: any[] = []

      // Get Guru messages from guruChat collection
      let query = adminDb.collectionGroup('messages')
        .orderBy('createdAt', 'desc')
        .limit(limit)

      if (todayOnly) {
        query = query
          .where('createdAt', '>=', adminDb.Timestamp.fromDate(todayStart))
          .where('createdAt', '<', adminDb.Timestamp.fromDate(todayEnd))
      }

      const snapshot = await query.get()

      for (const doc of snapshot.docs) {
        const data = doc.data()
        const userId = doc.ref.parent.parent?.id || 'unknown'

        // Get user email
        let userEmail = 'N/A'
        try {
          if (userId !== 'unknown') {
            const userRef = adminDb.collection('users').doc(userId)
            const userSnap = await userRef.get()
            if (userSnap.exists) {
              userEmail = userSnap.data()?.email || 'N/A'
            }
          }
        } catch (err) {
          console.warn(`Could not fetch user ${userId}:`, err)
        }

        // Extract debug info from message data
        const question = data.message || data.question || 'N/A'
        const answer = data.response || data.answer || 'N/A'
        const answerSummary = answer.length > 200 ? answer.substring(0, 200) + '...' : answer

        // Extract mode and flags from contextUsed or status
        const contextUsed = data.contextUsed || {}
        const status = data.status || {}
        const usedAstroContext = contextUsed.astroContext !== undefined || status.usedAstroContext || false
        const usedRag = contextUsed.rag !== undefined || status.usedRag || false
        const mode = data.mode || contextUsed.mode || status.mode || 'general'
        const errorCode = data.errorCode || status.errorCode || null

        sessions.push({
          id: doc.id,
          userId,
          userEmail,
          question,
          answer,
          answerSummary,
          mode,
          usedAstroContext,
          usedRag,
          errorCode,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || null,
          debugPayload: {
            contextUsed,
            status,
            sources: data.sources || [],
            confidence: data.confidence || null,
          },
        })
      }

      // Calculate stats
      const stats = {
        total: sessions.length,
        withAstroContext: sessions.filter((s) => s.usedAstroContext).length,
        withRag: sessions.filter((s) => s.usedRag).length,
        errors: sessions.filter((s) => s.errorCode).length,
      }

      return NextResponse.json({
        success: true,
        sessions,
        stats,
      })
    } catch (error: any) {
      console.error('Guru logs error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to fetch Guru logs' },
        { status: 500 }
      )
    }
  })(request)
}

