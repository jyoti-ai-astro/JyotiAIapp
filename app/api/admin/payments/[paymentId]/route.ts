import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'

export const dynamic = 'force-dynamic'

/**
 * Admin payment mutation guard
 *
 * Economic truth must come from Razorpay verification/reconciliation.
 * These legacy mutation paths are intentionally disabled until they are
 * replaced by provider-backed operations with audit + idempotency.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  return withAdminAuth(
    async () => {
      if (!adminDb) {
        return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
      }

      return NextResponse.json(
        {
          error: 'Direct payment-state mutation is disabled. Use provider-backed reconciliation.',
          paymentId: params.paymentId,
          code: 'PAYMENT_MUTATION_DISABLED',
        },
        { status: 409 }
      )
    },
    'payments.write'
  )(request)
}

/**
 * Refunds must call Razorpay and only reconcile local state after provider success.
 * This legacy Firestore-only refund path is intentionally disabled.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  return withAdminAuth(
    async () => {
      return NextResponse.json(
        {
          error: 'Refund execution is disabled until Razorpay-backed refund reconciliation is implemented.',
          paymentId: params.paymentId,
          code: 'REFUND_PROVIDER_REQUIRED',
        },
        { status: 409 }
      )
    },
    'payments.refund'
  )(request)
}
