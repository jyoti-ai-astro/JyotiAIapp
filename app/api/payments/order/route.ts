// Phase 31 - F46: Use validated environment variables
import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import Razorpay from 'razorpay'
import { envVars } from '@/lib/env/env.mjs'

/**
 * Create Razorpay Order
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

    const { amount, planName, reportType } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    // Phase 31 - F46: Initialize Razorpay with validated env vars
    const razorpayKeyId = envVars.razorpay.keyId
    const razorpayKeySecret = envVars.razorpay.keySecret

    if (!razorpayKeyId || !razorpayKeySecret) {
      return NextResponse.json({ error: 'Razorpay not configured' }, { status: 500 })
    }

    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    })

    // Create order
    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `order_${Date.now()}_${uid}`,
      notes: {
        userId: uid,
        planName: planName || 'Premium Report',
        reportType: reportType || 'premium',
      },
    })

    // Save order to Firestore
    const orderRef = adminDb.collection('payments').doc(uid).collection('orders').doc(order.id)
    await orderRef.set({
      orderId: order.id,
      amount,
      currency: 'INR',
      status: 'created',
      planName: planName || 'Premium Report',
      reportType: reportType || 'premium',
      createdAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount / 100, // Convert back to rupees
        currency: order.currency,
        key: razorpayKeyId,
      },
    })
  } catch (error: any) {
    console.error('Create order error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    )
  }
}

