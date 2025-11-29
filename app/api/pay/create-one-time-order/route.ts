import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { envVars } from '@/lib/env/env.mjs'

const PRODUCTS: Record<string, { amount: number; description: string }> = {
  99: {
    amount: 99,
    description: 'Quick Reading (1 question / name correction / daily horoscope)',
  },
  199: {
    amount: 199,
    description: 'Deep Insight (Basic Kundali / 3 AI Guru questions)',
  },
}

export async function POST(req: NextRequest) {
  try {
    // Verify session
    const sessionCookie = req.cookies.get('session')?.value
    if (!sessionCookie || !adminAuth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true)
    const uid = decodedClaims.uid

    const { productId } = await req.json()

    if (!productId || !PRODUCTS[productId]) {
      return NextResponse.json({ error: 'Invalid product' }, { status: 400 })
    }

    const razorpayKeyId = envVars.razorpay.keyId
    const razorpayKeySecret = envVars.razorpay.keySecret

    if (!razorpayKeyId || !razorpayKeySecret) {
      return NextResponse.json({ error: 'Razorpay not configured' }, { status: 500 })
    }

    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    })

    const order = await razorpay.orders.create({
      amount: PRODUCTS[productId].amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `one_time_${productId}_${Date.now()}_${uid}`,
      notes: {
        productId: String(productId),
        type: 'one_time',
        userId: uid,
      },
    })

    // Save order to Firestore
    if (adminDb) {
      const orderRef = adminDb
        .collection('payments')
        .doc(uid)
        .collection('one_time_orders')
        .doc(order.id)
      await orderRef.set({
        orderId: order.id,
        productId: String(productId),
        amount: PRODUCTS[productId].amount,
        status: 'created',
        createdAt: new Date(),
      })
    }

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      product: PRODUCTS[productId],
    })
  } catch (err: any) {
    console.error('Create one-time order error:', err)
    return NextResponse.json({ error: err.message || 'Failed to create order' }, { status: 500 })
  }
}

