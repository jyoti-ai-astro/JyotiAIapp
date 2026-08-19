// app/api/webhooks/razorpay/route.ts

/**
 * Razorpay Webhook Handler
 *
 * Phase Z - Production Validation & Monitoring
 *
 * Handles Razorpay webhook events:
 * - subscription.pending
 * - subscription.activated
 * - subscription.charged
 * - subscription.halted
 * - subscription.completed
 * - payment.captured / order.paid  (one-time orders → tickets)
 * - payment.failed
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminDb } from '@/lib/firebase/admin';
import { envVars } from '@/lib/env/env.mjs';
import { logEvent } from '@/lib/logging/log-event';
import { FieldValue } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

function verifySignature(body: string, signature: string | null, secret: string) {
  if (!signature) return false;

  const expected = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  return signature === expected;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    const webhookSecret = envVars.razorpay.webhookSecret;
    if (!webhookSecret) {
      await logEvent('webhook.failed', {
        error: 'RAZORPAY_WEBHOOK_SECRET not configured',
        source: 'razorpay',
      });
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    if (!verifySignature(body, signature, webhookSecret)) {
      await logEvent('webhook.failed', {
        error: 'Invalid or missing signature',
        source: 'razorpay',
      });
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse webhook payload
    const payload = JSON.parse(body);
    const event = payload.event as string;

    // Prefer subscription entity, then payment, then order
    const subscriptionEntity = payload.payload?.subscription?.entity;
    const paymentEntity = payload.payload?.payment?.entity;
    const orderEntity = payload.payload?.order?.entity;

    const entity = subscriptionEntity || paymentEntity || orderEntity || null;

    // Phase Z3: Log webhook received
    await logEvent(
      'webhook.received',
      {
        event,
        entityId: entity?.id,
        source: 'razorpay',
      },
      entity?.notes?.userId
    );

    if (!adminDb) {
      await logEvent('webhook.failed', {
        error: 'Firestore not initialized',
        event,
        source: 'razorpay',
      });
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    /**
     * 1️⃣ SUBSCRIPTION EVENTS (existing behaviour)
     */
    if (event.startsWith('subscription.') || event === 'invoice.paid') {
      const subscriptionId = subscriptionEntity?.id;
      const userId = subscriptionEntity?.notes?.userId;

      if (!subscriptionId) {
        await logEvent('webhook.failed', {
          error: 'Missing subscription ID',
          event,
          source: 'razorpay',
        });
        return NextResponse.json(
          { error: 'Missing subscription ID' },
          { status: 400 }
        );
      }

      // Find subscription in Firestore
      const subscriptionsSnapshot = await adminDb
        .collectionGroup('subscriptions')
        .where('razorpaySubscriptionId', '==', subscriptionId)
        .limit(1)
        .get();

      if (subscriptionsSnapshot.empty) {
        await logEvent('webhook.failed', {
          error: 'Subscription not found in Firestore',
          event,
          subscriptionId,
          source: 'razorpay',
        });
        return NextResponse.json(
          { error: 'Subscription not found' },
          { status: 404 }
        );
      }

      const subscriptionDoc = subscriptionsSnapshot.docs[0];
      const subscriptionRef = subscriptionDoc.ref;

      // Update subscription based on event
      let status = subscriptionEntity?.status;
      let active = false;

      switch (event) {
        case 'subscription.activated':
        case 'subscription.authenticated':
        case 'invoice.paid':
          status = 'active';
          active = true;
          await logEvent(
            'subscription.activated',
            {
              subscriptionId,
              userId,
              paymentId: payload.payload?.payment?.entity?.id,
            },
            userId
          );
          break;

        case 'subscription.charged':
          status = 'active';
          active = true;
          await logEvent(
            'subscription.charged',
            {
              subscriptionId,
              userId,
              paymentId: payload.payload?.payment?.entity?.id,
            },
            userId
          );
          break;

        case 'subscription.halted':
          status = 'halted';
          active = false;
          await logEvent(
            'subscription.halted',
            {
              subscriptionId,
              userId,
              reason: subscriptionEntity?.pause_at || 'unknown',
            },
            userId
          );
          break;

        case 'subscription.completed':
          status = 'completed';
          active = false;
          await logEvent(
            'subscription.expired',
            {
              subscriptionId,
              userId,
            },
            userId
          );
          break;

        case 'subscription.pending':
          status = 'pending';
          active = false;
          break;

        default:
          status =
            subscriptionEntity?.status || (subscriptionDoc.data() as any)?.status;
          active = status === 'active' || status === 'authenticated';
      }

      // Update Firestore subscription record
      await subscriptionRef.set(
        {
          status,
          active,
          lastSyncedAt: new Date(),
          updatedAt: new Date(),
        },
        { merge: true }
      );

      // Update user doc if userId is available
      if (userId) {
        const userRef = adminDb.collection('users').doc(userId);
        await userRef.set(
          {
            subscription: {
              status,
              active,
              lastSyncedAt: new Date(),
            },
            updatedAt: new Date(),
          },
          { merge: true }
        );
      }
    }

    /**
     * 2️⃣ ONE-TIME ORDERS → TICKETS
     *
     * payment.captured / order.paid
     */
    if (event === 'payment.captured' || event === 'order.paid') {
      const payment = paymentEntity || payload.payload?.payment?.entity || null;
      const orderId: string | undefined =
        payment?.order_id || orderEntity?.id || payment?.id;

      if (!orderId) {
        await logEvent('webhook.failed', {
          source: 'razorpay',
          reason: 'missing_order_id',
          event,
        });
      } else {
        try {
          // Find our one-time order document by orderId
          const oneTimeOrdersSnap = await adminDb
            .collectionGroup('one_time_orders')
            .where('orderId', '==', orderId)
            .limit(1)
            .get();

          if (oneTimeOrdersSnap.empty) {
            await logEvent('webhook.failed', {
              source: 'razorpay',
              reason: 'one_time_order_not_found',
              event,
              orderId,
            });
          } else {
            const orderDoc = oneTimeOrdersSnap.docs[0];
            const orderRef = orderDoc.ref;
            const orderData = orderDoc.data() as any;

            const tickets = orderData?.tickets || {};
            const productIdInternal: string | undefined =
              orderData?.productIdInternal;

            // Extract userId from Firestore path: payments/{uid}/one_time_orders/{orderId}
            const paymentsDocRef = orderRef.parent.parent; // -> payments/{uid}
            const userId = paymentsDocRef?.id;

            // Mark order as paid (idempotent)
            await orderRef.set(
              {
                status: 'paid',
                paidAt: new Date(),
                razorpayEvent: event,
                paymentId: payment?.id,
              },
              { merge: true }
            );

            if (userId) {
              const userRef = adminDb.collection('users').doc(userId);

              const update: Record<string, any> = { updatedAt: new Date() };

              if (tickets.aiQuestions) {
                update.aiGuruTickets = FieldValue.increment(tickets.aiQuestions);
                update.tickets = FieldValue.increment(tickets.aiQuestions);
                update['legacyTickets.ai_questions'] = FieldValue.increment(tickets.aiQuestions);
              }

              if (tickets.kundaliBasic) {
                update.kundaliTickets = FieldValue.increment(tickets.kundaliBasic);
                update['legacyTickets.kundali_basic'] = FieldValue.increment(tickets.kundaliBasic);
              }

              if (tickets.predictions) {
                update.lifetimePredictions = FieldValue.increment(tickets.predictions);
              }

              await userRef.set(update, { merge: true });

              await logEvent(
                'payment.success',
                {
                  source: 'razorpay-webhook',
                  event,
                  orderId,
                  paymentId: payment?.id,
                  ticketsCredited: tickets,
                  productIdInternal,
                },
                userId
              );
            }
          }
        } catch (err: any) {
          console.error('[razorpay-webhook] one-time handler error', err);
          await logEvent('webhook.failed', {
            source: 'razorpay',
            reason: 'one_time_exception',
            event,
            orderId,
            error: err?.message,
          });
        }
      }
    }

    /**
     * 3️⃣ PAYMENT FAILED
     */
    if (event === 'payment.failed') {
      const payment = payload.payload?.payment?.entity;
      await logEvent(
        'payment.failed',
        {
          paymentId: payment?.id,
          orderId: payment?.order_id,
          error: payment?.error_description || payment?.error_code,
          amount: payment?.amount,
        },
        payment?.notes?.userId
      );
    }

    // ============================================
    // ✅ NEW: Handle one-time payments via webhook
    // ============================================
    if (event === 'payment.captured' || event === 'order.paid') {
      const payment = payload.payload?.payment?.entity;
      const orderId = payment?.order_id;
      const userId = payment?.notes?.userId;
      const productId = payment?.notes?.productId;

      if (orderId && userId && productId && adminDb) {
        try {
          const orderRef = adminDb
            .collection('payments')
            .doc(userId)
            .collection('one_time_orders')
            .doc(orderId);

          await orderRef.set(
            {
              status: 'completed',
              paymentId: payment?.id,
              completedAt: new Date(),
            },
            { merge: true }
          );

          await logEvent(
            'ticket.webhook_fulfilled',
            {
              orderId,
              paymentId: payment?.id,
              productId,
              amount: payment?.amount / 100,
            },
            userId
          );
        } catch (err) {
          console.error("Webhook fulfillment error:", err);
        }
      }
    }

    // Phase Z3: Log webhook verified
    await logEvent('webhook.verified', {
      event,
      entityId: entity?.id,
      source: 'razorpay',
    });

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Razorpay webhook error:', error);
    await logEvent('webhook.failed', {
      error: error?.message || 'Unknown error',
      stack: error?.stack,
      source: 'razorpay',
    });
    return NextResponse.json(
      { error: error?.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
