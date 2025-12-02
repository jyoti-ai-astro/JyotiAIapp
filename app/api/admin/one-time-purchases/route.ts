/**
 * Admin: Get One-Time Purchases
 * 
 * Pricing & Payments v3 - Phase I
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'
import { adminDb } from '@/lib/firebase/admin'
import { getOneTimeProduct } from '@/lib/pricing/plans'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  return withAdminAuth(async (req, admin) => {
    if (!adminDb) {
      return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
    }

    try {
      const purchases: any[] = []
      const usersSnapshot = await adminDb.collection('users').get()

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data()
        const email = userData?.email || 'N/A'
        const oneTimePurchases = userData?.oneTimePurchases || []

        for (const purchase of oneTimePurchases) {
          const product = getOneTimeProduct(purchase.productId)
          purchases.push({
            email,
            productId: purchase.productId,
            productName: product?.name || 'Unknown',
            paymentId: purchase.paymentId || 'N/A',
            orderId: purchase.orderId || 'N/A',
            date: purchase.date?.toDate?.()?.toISOString() || purchase.date || new Date().toISOString(),
            amount: product?.amountInINR || 0,
          })
        }
      }

      // Sort by date (newest first)
      purchases.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      return NextResponse.json({
        success: true,
        purchases,
      })
    } catch (error: any) {
      console.error('Get one-time purchases error:', error)
      return NextResponse.json({ error: error.message || 'Failed to fetch purchases' }, { status: 500 })
    }
  })(request)
}

