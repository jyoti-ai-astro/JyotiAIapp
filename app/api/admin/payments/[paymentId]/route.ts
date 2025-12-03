import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'

export const dynamic = 'force-dynamic'

/**
 * Fix Failed Payment API
 * Milestone 10 - Step 5
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  return withAdminAuth(
    async (req, admin) => {
      if (!adminDb) {
        return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
      }

      try {
        const { paymentId } = params
        const { action, userId } = await req.json()

        if (!userId) {
          return NextResponse.json({ error: 'userId is required' }, { status: 400 })
        }

        const paymentRef = adminDb.collection('payments').doc(paymentId)
        const paymentSnap = await paymentRef.get()

        if (!paymentSnap.exists) {
          return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
        }

        switch (action) {
          case 'retry':
            // Mark for retry
            await paymentRef.update({
              status: 'pending',
              retryAt: new Date(),
            })
            break

          case 'mark_success':
            // Manually mark as success
            await paymentRef.update({
              status: 'success',
              manuallyVerified: true,
              verifiedBy: admin.uid,
              verifiedAt: new Date(),
            })

            // Activate subscription if applicable
            if (paymentSnap.data()?.type === 'subscription') {
              await adminDb.collection('subscriptions').doc(userId).set({
                userId,
                status: 'active',
                plan: paymentSnap.data()?.plan || 'premium',
                activatedAt: new Date(),
                activatedBy: admin.uid,
              })
            }
            break

          default:
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
        }

        return NextResponse.json({ success: true })
      } catch (error: any) {
        console.error('Fix payment error:', error)
        return NextResponse.json(
          { error: error.message || 'Failed to fix payment' },
          { status: 500 }
        )
      }
    },
    'payments.write'
  )(request)
}

/**
 * Process Refund API
 * Milestone 10 - Step 5
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  return withAdminAuth(
    async (req, admin) => {
      try {
        const { paymentId } = params
        const { amount, reason } = await req.json()

        if (!amount) {
          return NextResponse.json({ error: 'Amount is required' }, { status: 400 })
        }

        // In production, integrate with Razorpay refund API
        // For now, just update Firestore
        if (!adminDb) {
          return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
        }

        const paymentRef = adminDb.collection('payments').doc(paymentId)
        await paymentRef.update({
          refunded: true,
          refundAmount: amount,
          refundReason: reason,
          refundedAt: new Date(),
          refundedBy: admin.uid,
        })

        return NextResponse.json({ success: true })
      } catch (error: any) {
        console.error('Refund error:', error)
        return NextResponse.json(
          { error: error.message || 'Failed to process refund' },
          { status: 500 }
        )
      }
    },
    'payments.refund'
  )(request)
}

