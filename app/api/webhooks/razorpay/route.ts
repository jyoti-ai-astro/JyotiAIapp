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
        error: 'Payment webhook is not available',
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
    const db = adminDb;

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

      // Resolve the owner canonically from the Firestore document path:
      // users/{uid}/subscriptions/current
      //
      // Razorpay notes are useful metadata, but some event payloads may
      // not expose notes consistently. Firestore ownership is the fallback.
      const firestoreUserId = subscriptionDoc.ref.parent.parent?.id;
      const resolvedUserId = userId || firestoreUserId;

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
              userId: resolvedUserId,
              paymentId: payload.payload?.payment?.entity?.id,
            },
            resolvedUserId
          );
          break;

        case 'subscription.charged':
          status = 'active';
          active = true;
          await logEvent(
            'subscription.charged',
            {
              subscriptionId,
              userId: resolvedUserId,
              paymentId: payload.payload?.payment?.entity?.id,
            },
            resolvedUserId
          );
          break;

        case 'subscription.halted':
          status = 'halted';
          active = false;
          await logEvent(
            'subscription.halted',
            {
              subscriptionId,
              userId: resolvedUserId,
              reason: subscriptionEntity?.pause_at || 'unknown',
            },
            resolvedUserId
          );
          break;

        case 'subscription.completed':
          status = 'completed';
          active = false;
          await logEvent(
            'subscription.expired',
            {
              subscriptionId,
              userId: resolvedUserId,
            },
            resolvedUserId
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

      // Keep the top-level user subscription snapshot synchronized.
      // Prefer Razorpay notes when available, with Firestore ownership
      // as the canonical fallback.
      if (resolvedUserId) {
        const userRef = adminDb.collection('users').doc(resolvedUserId);
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
        throw new Error('Retryable one-time webhook failure: missing order ID');
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
            throw new Error(
              'Retryable one-time webhook failure: canonical order not found'
            );
          } else {
            const orderRef = oneTimeOrdersSnap.docs[0].ref;

            // Extract userId from Firestore path: payments/{uid}/one_time_orders/{orderId}
            const paymentsDocRef = orderRef.parent.parent; // -> payments/{uid}
            const userId = paymentsDocRef?.id;

            const fulfillment = await db.runTransaction(async (transaction) => {
              const lockedOrderSnap = await transaction.get(orderRef);
              const orderData = lockedOrderSnap.exists ? lockedOrderSnap.data() as any : {};

              if (orderData?.fulfilledAt) {
                return {
                  alreadyFulfilled: true,
                  tickets: orderData?.tickets || {},
                  productIdInternal: orderData?.productIdInternal as string | undefined,
                };
              }

              const tickets = orderData?.tickets || {};
              const productIdInternal: string | undefined =
                orderData?.productIdInternal;

              transaction.set(
                orderRef,
                {
                  status: 'paid',
                  paidAt: new Date(),
                  razorpayEvent: event,
                  paymentId: payment?.id,
                  fulfilledAt: new Date(),
                  fulfillmentSource: 'razorpay-webhook',
                },
                { merge: true }
              );

              if (userId) {
                const userRef = db.collection('users').doc(userId);
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

                transaction.set(userRef, update, { merge: true });
              }

              return {
                alreadyFulfilled: false,
                tickets,
                productIdInternal,
              };
            });

            if (fulfillment.alreadyFulfilled) {
              await logEvent(
                'payment.success',
                {
                  source: 'razorpay-webhook',
                  reason: 'already_fulfilled',
                  event,
                  orderId,
                },
                userId
              );
              return NextResponse.json({ received: true });
            }

            if (userId) {
              await logEvent(
                'payment.success',
                {
                  source: 'razorpay-webhook',
                  event,
                  orderId,
                  paymentId: payment?.id,
                  ticketsCredited: fulfillment.tickets,
                  productIdInternal: fulfillment.productIdInternal,
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
          throw err;
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
