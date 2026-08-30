/**
 * Cancel Razorpay Subscription
 * 
 * Pricing & Payments v3 - Phase S2
 * 
 * Cancels the user's active subscription
 */

import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { envVars } from '@/lib/env/env.mjs'
import { logEvent } from '@/lib/logging/log-event'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Verify session
    const sessionCookie = request.cookies.get('session')?.value
    if (!sessionCookie || !adminAuth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true)
    const uid = decodedClaims.uid

    if (!adminDb) {
      return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
    }

    // The authenticated user's stored subscription is authoritative.
    // Never trust an arbitrary client-supplied Razorpay subscription ID.
    let requestedSubscriptionId: string | undefined

    try {
      const body = await request.json()
      requestedSubscriptionId =
        typeof body?.subscriptionId === 'string'
          ? body.subscriptionId.trim()
          : undefined
    } catch {
      // Body is optional because the server resolves the subscription from Firestore.
    }

    const storedSubscriptionRef = adminDb
      .collection('users')
      .doc(uid)
      .collection('subscriptions')
      .doc('current')

    const storedSubscriptionSnap = await storedSubscriptionRef.get()
    if (!storedSubscriptionSnap.exists) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      )
    }

    const storedSubscriptionData = storedSubscriptionSnap.data()
    const razorpaySubscriptionId =
      storedSubscriptionData?.razorpaySubscriptionId

    if (!razorpaySubscriptionId) {
      return NextResponse.json(
        { error: 'No Razorpay subscription ID found' },
        { status: 404 }
      )
    }

    if (
      requestedSubscriptionId &&
      requestedSubscriptionId !== razorpaySubscriptionId
    ) {
      await logEvent(
        'api.error',
        {
          endpoint: '/api/subscriptions/cancel',
          phase: 'subscription_ownership_validation',
          reason: 'subscription_id_mismatch',
        },
        uid
      )

      return NextResponse.json(
        { error: 'Subscription does not belong to the authenticated account' },
        { status: 403 }
      )
    }

    // Initialize Razorpay
    const razorpayKeyId = envVars.razorpay.keyId
    const razorpayKeySecret = envVars.razorpay.keySecret

    if (!razorpayKeyId || !razorpayKeySecret) {
      return NextResponse.json(
        { error: 'Subscription management is temporarily unavailable. Please try again shortly.' },
        { status: 500 }
      )
    }

    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    })

    // Cancel subscription in Razorpay (hardened)
    let cancelResult = null;
    try {
      cancelResult = await razorpay.subscriptions.cancel(
        razorpaySubscriptionId,
        0
      );
    } catch (err: any) {
      console.error("Razorpay cancel error:", {
        statusCode: err?.statusCode,
        description: err?.error?.description,
        field: err?.error?.field,
        message: err?.message,
      });

      // ⚠️ If already cancelled → still treat as success
      if (err?.error?.description?.includes("already cancelled")) {
        cancelResult = { status: "cancelled", alreadyCancelled: true };
      } else {
        await logEvent(
          "api.error",
          {
            endpoint: "/api/subscriptions/cancel",
            phase: "razorpay.subscriptions.cancel",
            statusCode: err?.statusCode,
            description: err?.error?.description,
            field: err?.error?.field,
            message: err?.message,
          },
          uid
        );

        return NextResponse.json(
          { error: err?.error?.description || "Failed to cancel subscription" },
          { status: 500 }
        );
      }
    }

    // Update Firestore
    const subscriptionRef = adminDb
      .collection('users')
      .doc(uid)
      .collection('subscriptions')
      .doc('current')

    await subscriptionRef.set(
      {
        status: "cancelled",
        cancelledAt: new Date(),
        updatedAt: new Date(),
        razorpayCancelSnapshot: {
          id: cancelResult.id,
          status: cancelResult.status,
          endedAt: cancelResult.ended_at ?? null,
          currentEnd: cancelResult.current_end ?? null,
        }
      },
      { merge: true }
    );

    // Update user doc
    const userRef = adminDb.collection('users').doc(uid)
    await userRef.set(
      {
        subscription: {
          status: "cancelled",
          active: false,
          lastSyncedAt: new Date(),
        },
        updatedAt: new Date(),
      },
      { merge: true }
    );

    // Phase Z3: Log subscription cancellation
    await logEvent('subscription.cancelled', {
      razorpaySubscriptionId,
      cancelledAt: new Date().toISOString(),
    }, uid)

    return NextResponse.json({
      success: true,
      status: 'cancelled',
    })
  } catch (error: any) {
    console.error('Cancel subscription error:', error)
    // Phase Z3: Log error
    await logEvent('api.error', {
      endpoint: '/api/subscriptions/cancel',
      error: error.message || 'Unknown error',
      stack: error.stack,
    })
    return NextResponse.json(
      { error: error.message || 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}
