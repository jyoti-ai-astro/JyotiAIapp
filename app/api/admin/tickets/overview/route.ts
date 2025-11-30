/**
 * Admin Tickets Overview API
 * 
 * Mega Build 4 - Admin Command Center
 * Aggregated ticket stats and user list
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
      let totalAiQuestions = 0
      let totalKundali = 0
      const usersWithTickets: any[] = []

      const usersSnapshot = await adminDb.collection('users').get()
      usersSnapshot.forEach((doc) => {
        const userData = doc.data()
        const legacyTickets = userData.legacyTickets || {}
        const aiQuestions = legacyTickets.ai_questions || 0
        const kundali = legacyTickets.kundali_basic || 0

        totalAiQuestions += aiQuestions
        totalKundali += kundali

        if (aiQuestions > 0 || kundali > 0) {
          usersWithTickets.push({
            uid: doc.id,
            email: userData.email || '',
            name: userData.name || userData.displayName || 'No name',
            aiQuestions,
            kundali,
            lastUpdated: userData.updatedAt?.toDate?.()?.toISOString() || userData.createdAt?.toDate?.()?.toISOString() || null,
          })
        }
      })

      return NextResponse.json({
        success: true,
        stats: {
          totalAiQuestions,
          totalKundali,
          usersWithTickets: usersWithTickets.length,
        },
        users: usersWithTickets.sort((a, b) => (b.aiQuestions + b.kundali) - (a.aiQuestions + a.kundali)),
      })
    } catch (error: any) {
      console.error('Tickets overview error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to fetch ticket stats' },
        { status: 500 }
      )
    }
  })(request)
}

