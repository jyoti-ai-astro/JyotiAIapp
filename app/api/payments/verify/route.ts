// Phase 31 - F46: Use validated environment variables
import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import crypto from 'crypto'
import { sendPaymentReceipt } from '@/lib/email/email-service'
import { envVars } from '@/lib/env/env.mjs'

export const dynamic = 'force-dynamic'

/**
 * Verify Razorpay Payment
 * Part B - Section 7: Payments
 * Milestone 6 - Step 6
 */
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

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, reportType } = await request.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 })
    }

    // Phase 31 - F46: Verify signature with validated env vars
    const razorpayKeySecret = envVars.razorpay.keySecret
    if (!razorpayKeySecret) {
      return NextResponse.json(
        { error: 'RAZORPAY_KEY_SECRET missing. Payment verification not configured.' },
        { status: 500 }
      )
    }

    const text = `${razorpay_order_id}|${razorpay_payment_id}`
    const generatedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(text)
      .digest('hex')

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Get order details
    const orderRef = adminDb.collection('payments').doc(uid).collection('orders').doc(razorpay_order_id)
    const orderSnap = await orderRef.get()

    if (!orderSnap.exists) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const orderData = orderSnap.data()

    // Update order status
    await orderRef.update({
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      status: 'completed',
      completedAt: new Date(),
    })

    // Create/update subscription
    const subscriptionRef = adminDb.collection('subscriptions').doc(uid)
    const subscriptionSnap = await subscriptionRef.get()

    const planName = orderData?.planName || 'Premium Report'
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + 30) // 30 days validity

    if (subscriptionSnap.exists) {
      await subscriptionRef.update({
        status: 'active',
        planName,
        reportType: reportType || 'premium',
        expiryDate,
        updatedAt: new Date(),
      })
    } else {
      await subscriptionRef.set({
        status: 'active',
        planName,
        reportType: reportType || 'premium',
        expiryDate,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    // Get user email for receipt
    const userRef = adminDb.collection('users').doc(uid)
    const userSnap = await userRef.get()
    const userEmail = userSnap.exists ? userSnap.data()?.email : null

    // Send payment receipt email
    if (userEmail) {
      try {
        await sendPaymentReceipt(
          userEmail,
          orderData?.amount || 0,
          razorpay_payment_id,
          planName,
          expiryDate
        )
      } catch (emailError) {
        console.error('Failed to send payment receipt:', emailError)
      }
    }

    return NextResponse.json({
      success: true,
      payment: {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        status: 'completed',
      },
      subscription: {
        status: 'active',
        planName,
        expiryDate: expiryDate.toISOString(),
      },
    })
  } catch (error: any) {
    console.error('Verify payment error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to verify payment' },
      { status: 500 }
    )
  }
}

