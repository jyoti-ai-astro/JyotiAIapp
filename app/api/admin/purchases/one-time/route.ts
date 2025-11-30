/**
 * Admin One-Time Purchases API
 * 
 * Mega Build 4 - Admin Command Center
 * List of one-time purchases from payments collection
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
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '50')
      const statusFilter = searchParams.get('status') || 'ALL'
      const productFilter = searchParams.get('product') || 'ALL'
      const offset = (page - 1) * limit

      const purchases: any[] = []

      // Get all orders from payments collection
      const ordersSnapshot = await adminDb.collectionGroup('orders').get()

      ordersSnapshot.forEach((doc) => {
        const data = doc.data()
        const orderId = doc.id
        const userId = doc.ref.parent.parent?.id || 'unknown'

        // Filter by status
        if (statusFilter !== 'ALL' && data.status !== statusFilter) {
          return
        }

        // Filter by product (amount)
        if (productFilter !== 'ALL') {
          const amount = data.amount || 0
          if (productFilter === '99' && amount !== 99) return
          if (productFilter === '199' && amount !== 199) return
        }

        purchases.push({
          id: orderId,
          userId,
          productId: data.amount || 0,
          amount: data.amount || 0,
          status: data.status || 'pending',
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || null,
          paymentId: data.paymentId || null,
          orderId: data.orderId || orderId,
          planName: data.planName || null,
        })
      })

      // Sort by date (newest first)
      purchases.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return dateB - dateA
      })

      // Paginate
      const paginatedPurchases = purchases.slice(offset, offset + limit)

      // Get user emails
      for (const purchase of paginatedPurchases) {
        if (purchase.userId && purchase.userId !== 'unknown') {
          try {
            const userRef = adminDb.collection('users').doc(purchase.userId)
            const userSnap = await userRef.get()
            if (userSnap.exists) {
              purchase.userEmail = userSnap.data()?.email || 'N/A'
              purchase.userName = userSnap.data()?.name || userSnap.data()?.displayName || 'N/A'
            }
          } catch (err) {
            console.warn(`Could not fetch user ${purchase.userId}:`, err)
          }
        }
      }

      return NextResponse.json({
        success: true,
        purchases: paginatedPurchases,
        pagination: {
          page,
          limit,
          total: purchases.length,
          hasMore: offset + limit < purchases.length,
        },
      })
    } catch (error: any) {
      console.error('One-time purchases error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to fetch purchases' },
        { status: 500 }
      )
    }
  })(request)
}

