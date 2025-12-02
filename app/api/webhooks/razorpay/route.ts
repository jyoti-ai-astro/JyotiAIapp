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
 * - payment.failed
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { adminDb } from '@/lib/firebase/admin'
import { envVars } from '@/lib/env/env.mjs'
import { logEvent } from '@/lib/logging/log-event'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature')

    if (!signature) {
      await logEvent('webhook.failed', {
        error: 'Missing signature header',
        source: 'razorpay',
      })
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    // Verify webhook signature
    const webhookSecret = envVars.razorpay.webhookSecret
    if (!webhookSecret) {
      await logEvent('webhook.failed', {
        error: 'RAZORPAY_WEBHOOK_SECRET not configured',
        source: 'razorpay',
      })
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex')

    if (signature !== expectedSignature) {
      await logEvent('webhook.failed', {
        error: 'Invalid signature',
        source: 'razorpay',
      })
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Parse webhook payload
    const payload = JSON.parse(body)
    const event = payload.event
    const entity = payload.payload?.subscription?.entity || payload.payload?.payment?.entity

    // Phase Z3: Log webhook received
    await logEvent('webhook.received', {
      event,
      entityId: entity?.id,
      source: 'razorpay',
    }, entity?.notes?.userId)

    if (!adminDb) {
      await logEvent('webhook.failed', {
        error: 'Firestore not initialized',
        event,
        source: 'razorpay',
      })
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 })
    }

    // Handle subscription events
    if (event.startsWith('subscription.')) {
      const subscriptionId = entity?.id
      const userId = entity?.notes?.userId

      if (!subscriptionId) {
        await logEvent('webhook.failed', {
          error: 'Missing subscription ID',
          event,
          source: 'razorpay',
        })
        return NextResponse.json({ error: 'Missing subscription ID' }, { status: 400 })
      }

      // Find subscription in Firestore
      const subscriptionsSnapshot = await adminDb
        .collectionGroup('subscriptions')
        .where('razorpaySubscriptionId', '==', subscriptionId)
        .limit(1)
        .get()

      if (subscriptionsSnapshot.empty) {
        await logEvent('webhook.failed', {
          error: 'Subscription not found in Firestore',
          event,
          subscriptionId,
          source: 'razorpay',
        })
        return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
      }

      const subscriptionDoc = subscriptionsSnapshot.docs[0]
      const subscriptionRef = subscriptionDoc.ref

      // Update subscription based on event
      let status = entity?.status
      let active = false

      switch (event) {
        case 'subscription.activated':
          status = 'active'
          active = true
          await logEvent('subscription.activated', {
            subscriptionId,
            userId,
          }, userId)
          break

        case 'subscription.charged':
          // Subscription was charged successfully
          status = 'active'
          active = true
          await logEvent('subscription.charged', {
            subscriptionId,
            userId,
            paymentId: payload.payload?.payment?.entity?.id,
          }, userId)
          break

        case 'subscription.halted':
          status = 'halted'
          active = false
          await logEvent('subscription.halted', {
            subscriptionId,
            userId,
            reason: entity?.pause_at || 'unknown',
          }, userId)
          break

        case 'subscription.completed':
          status = 'completed'
          active = false
          await logEvent('subscription.expired', {
            subscriptionId,
            userId,
          }, userId)
          break

        case 'subscription.pending':
          status = 'pending'
          active = false
          break

        default:
          // Update status from entity
          status = entity?.status || subscriptionDoc.data()?.status
          active = status === 'active' || status === 'authenticated'
      }

      // Update Firestore
      await subscriptionRef.set(
        {
          status,
          active,
          lastSyncedAt: new Date(),
          updatedAt: new Date(),
        },
        { merge: true }
      )

      // Update user doc if userId is available
      if (userId) {
        const userRef = adminDb.collection('users').doc(userId)
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
        )
      }
    }

    // Handle payment.failed event
    if (event === 'payment.failed') {
      const payment = payload.payload?.payment?.entity
      await logEvent('payment.failed', {
        paymentId: payment?.id,
        orderId: payment?.order_id,
        error: payment?.error_description || payment?.error_code,
        amount: payment?.amount,
      }, payment?.notes?.userId)
    }

    // Phase Z3: Log webhook verified
    await logEvent('webhook.verified', {
      event,
      entityId: entity?.id,
      source: 'razorpay',
    })

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Razorpay webhook error:', error)
    await logEvent('webhook.failed', {
      error: error.message || 'Unknown error',
      stack: error.stack,
      source: 'razorpay',
    })
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

