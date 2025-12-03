export const dynamic = 'force-dynamic'
/**
 * Payments Config Check (Dev Tool)
 * 
 * Launch Guardrails - Phase LZ2
 * 
 * Returns payment configuration status for smoke testing
 */

import { NextRequest, NextResponse } from 'next/server'
import { envVars } from '@/lib/env/env.mjs'

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      hasKeyId: !!envVars.razorpay.keyId,
      hasSecret: !!envVars.razorpay.keySecret,
      hasPublicKeyId: !!envVars.razorpay.publicKeyId,
      hasStarterPlan: !!envVars.razorpay.planStarterId,
      hasAdvancedPlan: !!envVars.razorpay.planAdvancedId,
      hasSupremePlan: !!envVars.razorpay.planSupremeId,
      paymentsDisabled: envVars.app.disablePayments,
      appEnv: envVars.app.env,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get payments config' },
      { status: 500 }
    )
  }
}

