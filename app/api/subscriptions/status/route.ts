/**
 * Get Subscription Status
 * 
 * Pricing & Payments v3 - Phase S2
 * 
 * Returns current subscription info for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { envVars } from '@/lib/env/env.mjs'

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

    // Check if refresh/force sync is requested
    const { searchParams } = new URL(request.url)
    const refresh = searchParams.get('refresh') === 'true' || searchParams.get('forceSync') === 'true'

    // Get subscription from Firestore
    const subscriptionRef = adminDb
      .collection('users')
      .doc(uid)
      .collection('subscriptions')
      .doc('current')

    const subscriptionSnap = await subscriptionRef.get()
    const subscriptionData = subscriptionSnap.exists ? subscriptionSnap.data() : null

    // Phase Z1: Auto-sync if last sync > 12 hours or if refresh/forceSync is requested
    const lastSyncedAt = subscriptionData?.lastSyncedAt?.toDate?.() || subscriptionData?.lastSyncedAt
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000)
    const shouldSync = refresh || (subscriptionData?.razorpaySubscriptionId && (!lastSyncedAt || new Date(lastSyncedAt) < twelveHoursAgo))

    // If should sync and we have a Razorpay subscription ID, fetch from Razorpay
    if (shouldSync && subscriptionData?.razorpaySubscriptionId) {
      const razorpayKeyId = envVars.razorpay.keyId
      const razorpayKeySecret = envVars.razorpay.keySecret

      if (razorpayKeyId && razorpayKeySecret) {
        try {
          const razorpay = new Razorpay({
            key_id: razorpayKeyId,
            key_secret: razorpayKeySecret,
          })

          const razorpaySubscription = await razorpay.subscriptions.fetch(
            subscriptionData.razorpaySubscriptionId
          )

          // Update Firestore with latest status
          const isActive = razorpaySubscription.status === 'active' || razorpaySubscription.status === 'authenticated'

          await subscriptionRef.set(
            {
              ...subscriptionData,
              status: razorpaySubscription.status,
              active: isActive,
              lastSyncedAt: new Date(), // Phase Z1: Track last sync time
              updatedAt: new Date(),
            },
            { merge: true }
          )

          // Update user doc
          const userRef = adminDb.collection('users').doc(uid)
          await userRef.set(
            {
              subscription: {
                planId: subscriptionData.planId,
                subscriptionProductId: subscriptionData.subscriptionProductId,
                razorpaySubscriptionId: subscriptionData.razorpaySubscriptionId,
                status: razorpaySubscription.status,
                active: isActive,
                lastSyncedAt: new Date(), // Phase Z1: Track last sync time
              },
              updatedAt: new Date(),
            },
            { merge: true }
          )

          // Phase Z3: Log successful sync
          await logEvent('subscription.synced', {
            razorpaySubscriptionId: subscriptionData.razorpaySubscriptionId,
            status: razorpaySubscription.status,
            isActive,
          }, uid)

          return NextResponse.json({
            active: isActive,
            planId: subscriptionData.planId,
            productId: subscriptionData.subscriptionProductId,
            razorpaySubscriptionId: subscriptionData.razorpaySubscriptionId,
            status: razorpaySubscription.status,
          })
        } catch (error: any) {
          console.error('Error refreshing subscription from Razorpay:', error)
          // Phase Z3: Log sync error
          await logEvent('api.error', {
            endpoint: '/api/subscriptions/status',
            action: 'sync',
            error: error.message || 'Unknown error',
            razorpaySubscriptionId: subscriptionData?.razorpaySubscriptionId,
          }, uid)
          // Fall through to return Firestore data
        }
      }
    }

    // Return Firestore data
    if (!subscriptionData) {
      return NextResponse.json({
        active: false,
        planId: null,
        productId: null,
        razorpaySubscriptionId: null,
        status: null,
      })
    }

    const isActive = subscriptionData.status === 'active' || subscriptionData.status === 'authenticated'

    return NextResponse.json({
      active: isActive,
      planId: subscriptionData.planId || null,
      productId: subscriptionData.subscriptionProductId || null,
      razorpaySubscriptionId: subscriptionData.razorpaySubscriptionId || null,
      status: subscriptionData.status || null,
    })
  } catch (error: any) {
    console.error('Get subscription status error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get subscription status' },
      { status: 500 }
    )
  }
}
