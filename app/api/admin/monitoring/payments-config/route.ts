import { NextRequest, NextResponse } from 'next/server'
import { envVars } from '@/lib/env/env.mjs'
import { withAdminAuth } from '@/lib/middleware/admin-middleware'

export const dynamic = 'force-dynamic'

export const GET = withAdminAuth(
  async () => {
    try {
      /*
       * Deliberately expose presence only.
       * Never return Razorpay credentials or secret values.
       */
      return NextResponse.json({
        hasKeyId: Boolean(envVars.razorpay?.keyId),
        hasSecret: Boolean(envVars.razorpay?.keySecret),
        hasPublicKeyId: Boolean(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID),
        hasStarterPlan: Boolean(process.env.RAZORPAY_PLAN_STARTER_ID),
        hasAdvancedPlan: Boolean(process.env.RAZORPAY_PLAN_ADVANCED_ID),
        hasSupremePlan: Boolean(process.env.RAZORPAY_PLAN_SUPREME_ID),
        isPaymentsDisabled:
          process.env.DISABLE_PAYMENTS === 'true' ||
          process.env.NEXT_PUBLIC_DISABLE_PAYMENTS === 'true' ||
          process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === 'false',
      })
    } catch (error) {
      console.error('Admin payments configuration check failed:', error)

      return NextResponse.json(
        { error: 'Failed to read payment configuration status' },
        { status: 500 }
      )
    }
  },
  'logs.read'
)

void (null as unknown as NextRequest)
