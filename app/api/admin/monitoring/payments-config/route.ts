import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase/admin'
import { envVars } from '@/lib/env/env.mjs'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('session')?.value

    if (!sessionCookie || !adminAuth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true)

    if (decodedClaims.isAdmin !== true) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

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
}
