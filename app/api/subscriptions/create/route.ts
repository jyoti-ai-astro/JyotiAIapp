// app/api/subscriptions/create/route.ts

/**
 * Create Razorpay Subscription
 *
 * Pricing & Payments v3 - Phase S2
 *
 * Creates a Razorpay subscription for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { envVars } from '@/lib/env/env.mjs';
import {
  getSubscriptionPlanById,
  getRazorpayPlanIdForSubscription,
} from '@/lib/pricing/plans';
import { logEvent } from '@/lib/logging/log-event';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Phase LZ3: Payments kill switch (defensive)
    if (envVars?.app?.disablePayments) {
      return NextResponse.json(
        { error: 'Payments temporarily disabled' },
        { status: 503 }
      );
    }

    // Verify session
    const sessionCookie = request.cookies.get('session')?.value;
    if (!sessionCookie || !adminAuth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decodedClaims = await adminAuth.verifySessionCookie(
      sessionCookie,
      true
    );
    const uid = decodedClaims.uid;

    // Parse body safely
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const planId = body?.planId;
    if (!planId) {
      return NextResponse.json({ error: 'Plan ID required' }, { status: 400 });
    }

    // Get subscription plan
    const plan = getSubscriptionPlanById(planId);
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 });
    }

    // Get Razorpay plan ID from environment
    const razorpayPlanId = getRazorpayPlanIdForSubscription(plan);
    if (!razorpayPlanId) {
      return NextResponse.json(
        {
          error: `Razorpay plan ID not configured for ${plan.name}. Please set ${plan.razorpayPlanEnvKey} in environment variables.`,
        },
        { status: 400 }
      );
    }

    // Initialize Razorpay (defensive)
    const razorpayKeyId = envVars?.razorpay?.keyId;
    const razorpayKeySecret = envVars?.razorpay?.keySecret;

    if (!razorpayKeyId || !razorpayKeySecret) {
      return NextResponse.json(
        {
          error:
            'RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET missing. Payment service not configured.',
        },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });

    // Get user email for customer creation
    let customerEmail = (decodedClaims as any).email || null;

    if (!customerEmail && adminDb) {
      try {
        const userRef = adminDb.collection('users').doc(uid);
        const userSnap = await userRef.get();
        if (userSnap.exists) {
          customerEmail = userSnap.data()?.email || null;
        }
      } catch (emailErr) {
        console.warn(
          'Subscription: failed to fetch user email from Firestore, continuing:',
          emailErr
        );
      }
    }

    // Create Razorpay subscription
    // NOTE: Do NOT send a `customer` object – this Razorpay account expects
    // only plan-based subscriptions without inline customer details.
    let subscription;
    try {
      const subscriptionPayload: any = {
        plan_id: razorpayPlanId,
        // JyotiAI subscriptions use a 12-cycle monthly contract.
        // total_count: 1 caused Razorpay to complete the subscription
        // immediately after the first successful monthly payment.
        total_count: 12,
        customer_notify: 1,        // Notify customer via Razorpay
        notes: {
          userId: uid,
          planId: plan.id,
          subscriptionProductId: plan.subscriptionProductId,
        },
      };

      // If we have an email, keep it only in notes for debugging/audit
      if (customerEmail) {
        subscriptionPayload.notes.customerEmail = customerEmail;
      }

      subscription = await razorpay.subscriptions.create(subscriptionPayload);
    } catch (err: any) {
      console.error('Razorpay subscription.create error:', {
        statusCode: err?.statusCode,
        error: err?.error,
        description: err?.error?.description,
        field: err?.error?.field,
        message: err?.message,
      });

      await logEvent(
        'api.error',
        {
          endpoint: '/api/subscriptions/create',
          phase: 'razorpay.subscriptions.create',
          statusCode: err?.statusCode,
          description: err?.error?.description,
          field: err?.error?.field,
          message: err?.message,
        },
        uid
      );

      return NextResponse.json(
        { error: err?.error?.description || 'Failed to create subscription' },
        { status: 500 }
      );
    }

    // Save subscription to Firestore (non-blocking errors)
    if (adminDb) {
      try {
        const subscriptionRef = adminDb
          .collection('users')
          .doc(uid)
          .collection('subscriptions')
          .doc('current');

        await subscriptionRef.set({
          planId: plan.id,
          subscriptionProductId: plan.subscriptionProductId,
          razorpaySubscriptionId: subscription.id,
          status: subscription.status, // created, authenticated, active, etc.
          razorpaySnapshot: {
            id: subscription.id,
            status: subscription.status,
            planId: subscription.plan_id,
            currentStart: subscription.current_start ?? null,
            currentEnd: subscription.current_end ?? null,
            chargeAt: subscription.charge_at ?? null,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Also update user doc for quick access
        const userRef = adminDb.collection('users').doc(uid);
        const subStatus = subscription.status;
        const isActiveSnapshot =
          subStatus === 'active' ||
          subStatus === 'authenticated';

        await userRef.set(
          {
            subscription: {
              planId: plan.id,
              subscriptionProductId: plan.subscriptionProductId,
              razorpaySubscriptionId: subscription.id,
              status: subStatus,
              active: isActiveSnapshot,
              lastSyncedAt: new Date(),
            },
            updatedAt: new Date(),
          },
          { merge: true }
        );

        // Phase Z3: Log subscription creation
        await logEvent(
          'subscription.created',
          {
            planId: plan.id,
            subscriptionProductId: plan.subscriptionProductId,
            razorpaySubscriptionId: subscription.id,
            status: subscription.status,
          },
          uid
        );
      } catch (firestoreErr) {
        console.error(
          'Subscription Firestore/logEvent error (non-blocking):',
          firestoreErr
        );
      }
    }

    return NextResponse.json({
      subscriptionId: subscription.id,
      planId: plan.id,
      keyId: envVars?.razorpay?.publicKeyId || razorpayKeyId,
    });
  } catch (error: any) {
    console.error('Create subscription error:', error);
    // Phase Z3: Log error (non-fatal)
    try {
      await logEvent('api.error', {
        endpoint: '/api/subscriptions/create',
        error: error?.message || 'Unknown error',
        stack: error?.stack,
      });
    } catch (logErr: any) {
      console.error('Error logging subscription API error:', logErr);
    }

    return NextResponse.json(
      { error: error?.message || 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
