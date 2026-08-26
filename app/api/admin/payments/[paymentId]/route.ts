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
    async () => {
      return NextResponse.json(
        {
          success: false,
          error:
            'Manual payment mutation is disabled. Payment and subscription state must be reconciled from Razorpay.',
        },
        { status: 410 }
      )
    },
    'payments.write'
  )(request)
}

/**
 * Refund endpoint intentionally disabled.
 *
 * JyotiAI must never mark a payment as refunded unless Razorpay
 * has actually processed the refund.
 *
 * A real refund implementation will:
 * 1. retrieve and validate the canonical payment;
 * 2. call Razorpay's refund API;
 * 3. persist Razorpay's refund ID/status;
 * 4. reconcile subsequent webhook events;
 * 5. record the acting administrator.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  return withAdminAuth(
    async () => {
      return NextResponse.json(
        {
          success: false,
          error:
            'Refunds are not enabled in JyotiAI Admin yet. No Razorpay refund has been performed.',
        },
        { status: 501 }
      )
    },
    'payments.refund'
  )(request)
}
