import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'
import Razorpay from 'razorpay'

/**
 * List Payments API
 * Milestone 10 - Step 5
 */
export async function GET(request: NextRequest) {
  return withAdminAuth(
    async (req, admin) => {
      if (!adminDb) {
        return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
      }

      try {
        const { searchParams } = new URL(req.url)
        const status = searchParams.get('status')
        const limit = parseInt(searchParams.get('limit') || '50')

        let query: any = adminDb.collection('payments')

        if (status) {
          query = query.where('status', '==', status)
        }

        const snapshot = await query.orderBy('createdAt', 'desc').limit(limit).get()

        const payments = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        // Calculate revenue stats
        const allPayments = await adminDb.collection('payments').get()
        let totalRevenue = 0
        let todayRevenue = 0
        let activeSubscriptions = 0
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        allPayments.forEach((doc) => {
          const data = doc.data()
          const amount = data.amount || 0
          totalRevenue += amount

          if (data.createdAt && data.createdAt.toDate() >= today) {
            todayRevenue += amount
          }

          if (data.status === 'success' && data.type === 'subscription') {
            activeSubscriptions++
          }
        })

        return NextResponse.json({
          success: true,
          payments,
          stats: {
            totalRevenue,
            todayRevenue,
            activeSubscriptions,
          },
        })
      } catch (error: any) {
        console.error('List payments error:', error)
        return NextResponse.json(
          { error: error.message || 'Failed to list payments' },
          { status: 500 }
        )
      }
    },
    'payments.read'
  )(request)
}

/**
 * Verify Payment Signature API
 * Milestone 10 - Step 5
 */
export async function POST(request: NextRequest) {
  return withAdminAuth(
    async (req, admin) => {
      try {
        const { paymentId, signature, orderId } = await req.json()

        if (!paymentId || !signature || !orderId) {
          return NextResponse.json(
            { error: 'paymentId, signature, and orderId are required' },
            { status: 400 }
          )
        }

        // Phase 31 - F46: Use validated environment variables
        const razorpayKeySecret = (await import('@/lib/env/env.mjs')).envVars.razorpay.keySecret
        if (!razorpayKeySecret) {
          return NextResponse.json({ error: 'Razorpay not configured' }, { status: 500 })
        }

        const crypto = require('crypto')
        const generatedSignature = crypto
          .createHmac('sha256', razorpayKeySecret)
          .update(orderId + '|' + paymentId)
          .digest('hex')

        const isValid = generatedSignature === signature

        return NextResponse.json({
          success: true,
          isValid,
          generatedSignature,
        })
      } catch (error: any) {
        console.error('Verify payment error:', error)
        return NextResponse.json(
          { error: error.message || 'Failed to verify payment' },
          { status: 500 }
        )
      }
    },
    'payments.read'
  )(request)
}

