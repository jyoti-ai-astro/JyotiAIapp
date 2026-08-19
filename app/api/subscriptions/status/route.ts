/**
 * Get Subscription Status
 *
 * Pricing & Payments v3 - Phase S2
 *
 * Returns current subscription info for the authenticated user.
 * Razorpay is treated as the source of truth when available,
 * but we fall back to Firestore gracefully.
 */

import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { envVars } from '@/lib/env/env.mjs'
import { logEvent } from '@/lib/logging/log-event'

export const dynamic = 'force-dynamic'

type NormalizedSubscription = {
  planId: string | null
  subscriptionProductId: string | null
  subscriptionId: string | null
  status: string | null
  active: boolean
  lastSyncedAt: Date | null
}

const ACTIVE_STATUSES = new Set(['active', 'authenticated', 'completed', 'created'])

function toDateOrNull(value: any): Date | null {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value?.toDate === 'function') return value.toDate()
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

/**
 * Normalize Firestore subscription snapshot into a consistent shape.
 */
function normalizeFromFirestore(data: any | null | undefined): NormalizedSubscription {
  if (!data) {
    return {
      planId: null,
      subscriptionProductId: null,
      subscriptionId: null,
      status: null,
      active: false,
      lastSyncedAt: null,
    }
  }

  const subObj = data.subscription || {}

  const planId =
    data.planId ??
    subObj.planId ??
    null

  const subscriptionProductId =
    data.subscriptionProductId ??
    subObj.subscriptionProductId ??
    null

  const subscriptionId =
    data.razorpaySubscriptionId ??
    subObj.razorpaySubscriptionId ??
    null

  const status: string | null =
    data.status ??
    subObj.status ??
    null

  let active: boolean
  if (typeof data.active === 'boolean') {
    active = data.active
  } else if (typeof subObj.active === 'boolean') {
    active = subObj.active
  } else if (status) {
    active = ACTIVE_STATUSES.has(status)
  } else {
    active = false
  }

  const lastSyncedAt =
    toDateOrNull(data.lastSyncedAt) ??
    toDateOrNull(subObj.lastSyncedAt) ??
    null

  return {
    planId,
    subscriptionProductId,
    subscriptionId,
    status,
    active,
    lastSyncedAt,
  }
}

/**
 * Normalize Razorpay subscription response into our shape.
 */
function normalizeFromRazorpay(
  razorSub: any,
  previous?: NormalizedSubscription
): NormalizedSubscription {
  const status: string | null = razorSub?.status ?? previous?.status ?? null

  const active = status ? ACTIVE_STATUSES.has(status) : previous?.active ?? false

  const notes = razorSub?.notes ?? {}
  const planId =
    notes.planId ??
    previous?.planId ??
    null

  const subscriptionProductId =
    notes.subscriptionProductId ??
    previous?.subscriptionProductId ??
    null

  const subscriptionId = razorSub?.id ?? previous?.subscriptionId ?? null

  return {
    planId,
    subscriptionProductId,
    subscriptionId,
    status,
    active,
    lastSyncedAt: new Date(),
  }
}

export async function GET(request: NextRequest) {
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

    // Read query params
    const { searchParams } = new URL(request.url)
    const refresh =
      searchParams.get('refresh') === 'true' ||
      searchParams.get('forceSync') === 'true'

    // Read Firestore snapshot
    const subscriptionRef = adminDb
      .collection('users')
      .doc(uid)
      .collection('subscriptions')
      .doc('current')

    const subscriptionSnap = await subscriptionRef.get()
    const subscriptionData = subscriptionSnap.exists ? subscriptionSnap.data() : null

    let normalized = normalizeFromFirestore(subscriptionData)

    // If nothing stored at all, return empty status early
    if (!normalized.subscriptionId && !subscriptionData) {
      return NextResponse.json({
        active: false,
        planId: null,
        productId: null,
        razorpaySubscriptionId: null,
        status: null,
      })
    }

    // Decide if we should sync from Razorpay
    const razorpayKeyId = envVars.razorpay.keyId
    const razorpayKeySecret = envVars.razorpay.keySecret

    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000)
    const shouldSync =
      !!normalized.subscriptionId &&
      !!razorpayKeyId &&
      !!razorpayKeySecret &&
      (refresh || !normalized.lastSyncedAt || normalized.lastSyncedAt < twelveHoursAgo)

    if (shouldSync && normalized.subscriptionId) {
      try {
        const razorpay = new Razorpay({
          key_id: razorpayKeyId!,
          key_secret: razorpayKeySecret!,
        })

        const razorpaySubscription = await razorpay.subscriptions.fetch(
          normalized.subscriptionId
        )

        // Normalize merged data
        normalized = normalizeFromRazorpay(razorpaySubscription, normalized)

        // Persist back to Firestore
        const isActive = normalized.active

        await subscriptionRef.set(
          {
            planId: normalized.planId,
            subscriptionProductId: normalized.subscriptionProductId,
            razorpaySubscriptionId: normalized.subscriptionId,
            status: normalized.status,
            active: isActive,
            lastSyncedAt: new Date(),
            updatedAt: new Date(),
            raw: razorpaySubscription,
          },
          { merge: true }
        )

        const userRef = adminDb.collection('users').doc(uid)
        await userRef.set(
          {
            subscription: {
              planId: normalized.planId,
              subscriptionProductId: normalized.subscriptionProductId,
              razorpaySubscriptionId: normalized.subscriptionId,
              status: normalized.status,
              active: isActive,
              lastSyncedAt: new Date(),
            },
            updatedAt: new Date(),
          },
          { merge: true }
        )

        await logEvent(
          'subscription.synced',
          {
            razorpaySubscriptionId: normalized.subscriptionId,
            status: normalized.status,
            isActive,
          },
          uid
        )
      } catch (error: any) {
        console.error('Error refreshing subscription from Razorpay:', error)
        await logEvent(
          'api.error',
          {
            endpoint: '/api/subscriptions/status',
            action: 'sync',
            error: error?.message || 'Unknown error',
            razorpaySubscriptionId: normalized.subscriptionId,
          },
          uid
        )
        // Fall through using Firestore-normalized data
      }
    }

    // Final effective response
    return NextResponse.json({
      active: normalized.active,
      planId: normalized.planId,
      productId: normalized.subscriptionProductId,
      razorpaySubscriptionId: normalized.subscriptionId,
      status: normalized.status,
    })
  } catch (error: any) {
    console.error('Get subscription status error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to get subscription status' },
      { status: 500 }
    )
  }
}
