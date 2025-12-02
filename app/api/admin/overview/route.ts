/**
 * Admin Overview Metrics API
 * 
 * Mega Build 4 - Admin Command Center
 * Aggregates metrics from existing collections
 */

import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'
import { envVars } from '@/lib/env/env.mjs'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  return withAdminAuth(async (req, admin) => {
    if (!adminDb) {
      return NextResponse.json(
        { error: 'FIREBASE_ADMIN credentials missing. Firestore not initialized.' },
        { status: 500 }
      )
    }

    try {
      const now = new Date()
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const todayEnd = new Date(todayStart)
      todayEnd.setDate(todayEnd.getDate() + 1)

      // Total users
      const usersSnapshot = await adminDb.collection('users').count().get()
      const totalUsers = usersSnapshot.data().count

      // Active subscriptions
      const subscriptionsSnapshot = await adminDb
        .collection('subscriptions')
        .where('status', '==', 'active')
        .get()
      const activeSubscriptions = subscriptionsSnapshot.size

      // One-time purchases (from payments collection)
      let totalOneTimePurchases = 0
      let oneTimeRevenueINR = 0

      const paymentsSnapshot = await adminDb.collectionGroup('orders').get()
      paymentsSnapshot.forEach((doc) => {
        const data = doc.data()
        if (data.status === 'completed' && data.amount) {
          totalOneTimePurchases++
          oneTimeRevenueINR += data.amount
        }
      })

      // Tickets in circulation
      let totalTicketsAiQuestions = 0
      let totalTicketsKundali = 0

      const usersWithTicketsSnapshot = await adminDb.collection('users').get()
      usersWithTicketsSnapshot.forEach((doc) => {
        const userData = doc.data()
        const legacyTickets = userData.legacyTickets || {}
        totalTicketsAiQuestions += legacyTickets.ai_questions || 0
        totalTicketsKundali += legacyTickets.kundali_basic || 0
      })

      // Guru questions today
      let guruQuestionsToday = 0
      try {
        const guruMessagesSnapshot = await adminDb
          .collectionGroup('messages')
          .where('createdAt', '>=', adminDb.Timestamp.fromDate(todayStart))
          .where('createdAt', '<', adminDb.Timestamp.fromDate(todayEnd))
          .count()
          .get()
        guruQuestionsToday = guruMessagesSnapshot.data().count
      } catch (err) {
        console.warn('Could not count Guru questions today:', err)
        // TODO: Guru messages may be in different collection structure
      }

      // Predictions generated today
      // TODO: Prediction usage not yet logged anywhere, currently always 0
      let predictionsGeneratedToday = 0

      // Timeline generated today
      // TODO: Timeline usage not yet logged anywhere, currently always 0
      let timelineGeneratedToday = 0

      return NextResponse.json({
        success: true,
        metrics: {
          totalUsers,
          activeSubscriptions,
          totalOneTimePurchases,
          oneTimeRevenueINR,
          totalTicketsAiQuestions,
          totalTicketsKundali,
          guruQuestionsToday,
          predictionsGeneratedToday,
          timelineGeneratedToday,
          lastUpdated: new Date().toISOString(),
        },
      })
    } catch (error: any) {
      console.error('Admin overview error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to fetch metrics' },
        { status: 500 }
      )
    }
  })(request)
}

