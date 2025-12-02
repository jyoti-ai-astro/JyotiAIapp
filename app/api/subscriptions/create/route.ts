/**
 * Create Razorpay Subscription
 * 
 * Pricing & Payments v3 - Phase S2
 * 
 * Creates a Razorpay subscription for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { envVars } from '@/lib/env/env.mjs'
import { getSubscriptionPlanById, getRazorpayPlanIdForSubscription } from '@/lib/pricing/plans'
import { logEvent } from '@/lib/logging/log-event'

export async function POST(request: NextRequest) {
  try {
    // Phase LZ3: Payments kill switch
    if (envVars.app.disablePayments) {
      return NextResponse.json(
        { error: 'Payments temporarily disabled' },
        { status: 503 }
      )
    }

    // Verify session
    const sessionCookie = request.cookies.get('session')?.value
    if (!sessionCookie || !adminAuth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true)
    const uid = decodedClaims.uid

    const { planId } = await request.json()

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID required' }, { status: 400 })
    }

    // Get subscription plan
    const plan = getSubscriptionPlanById(planId)
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 })
    }

    // Get Razorpay plan ID from environment
    const razorpayPlanId = getRazorpayPlanIdForSubscription(plan)
    if (!razorpayPlanId) {
      return NextResponse.json(
        { error: `Razorpay plan ID not configured for ${plan.name}. Please set ${plan.razorpayPlanEnvKey} in environment variables.` },
        { status: 400 }
      )
    }

    // Initialize Razorpay
    const razorpayKeyId = envVars.razorpay.keyId
    const razorpayKeySecret = envVars.razorpay.keySecret

    if (!razorpayKeyId || !razorpayKeySecret) {
      return NextResponse.json(
        { error: 'RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET missing. Payment service not configured.' },
        { status: 500 }
      )
    }

    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    })

    // Get user email for customer creation
    let customerEmail = decodedClaims.email || null
    if (!customerEmail && adminDb) {
      const userRef = adminDb.collection('users').doc(uid)
      const userSnap = await userRef.get()
      if (userSnap.exists) {
        customerEmail = userSnap.data()?.email || null
      }
    }

    // Create Razorpay subscription
    const subscription = await razorpay.subscriptions.create({
      plan_id: razorpayPlanId,
      customer_notify: 1,
      total_count: 0, // Until cancelled
      notes: {
        userId: uid,
        planId: plan.id,
        subscriptionProductId: plan.subscriptionProductId,
      },
      ...(customerEmail && { customer: { email: customerEmail } }),
    })

    // Save subscription to Firestore
    if (adminDb) {
      const subscriptionRef = adminDb
        .collection('users')
        .doc(uid)
        .collection('subscriptions')
        .doc('current')

      await subscriptionRef.set({
        planId: plan.id,
        subscriptionProductId: plan.subscriptionProductId,
        razorpaySubscriptionId: subscription.id,
        status: subscription.status, // created, authenticated, active, etc.
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      // Also update user doc for quick access
      const userRef = adminDb.collection('users').doc(uid)
      await userRef.set(
        {
          subscription: {
            planId: plan.id,
            subscriptionProductId: plan.subscriptionProductId,
            razorpaySubscriptionId: subscription.id,
            status: subscription.status,
            active: subscription.status === 'active' || subscription.status === 'authenticated',
            lastSyncedAt: new Date(),
          },
          updatedAt: new Date(),
        },
        { merge: true }
      )

      // Phase Z3: Log subscription creation
      await logEvent('subscription.created', {
        planId: plan.id,
        subscriptionProductId: plan.subscriptionProductId,
        razorpaySubscriptionId: subscription.id,
        status: subscription.status,
      }, uid)
    }

    return NextResponse.json({
      subscriptionId: subscription.id,
      planId: plan.id,
      keyId: envVars.razorpay.publicKeyId || razorpayKeyId,
    })
  } catch (error: any) {
    console.error('Create subscription error:', error)
    // Phase Z3: Log error
    await logEvent('api.error', {
      endpoint: '/api/subscriptions/create',
      error: error.message || 'Unknown error',
      stack: error.stack,
    })
    return NextResponse.json(
      { error: error.message || 'Failed to create subscription' },
      { status: 500 }
    )
  }
}
