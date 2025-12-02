import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { envVars } from '@/lib/env/env.mjs'

import { getOneTimeProduct, isValidOneTimeProduct } from '@/lib/pricing/plans'

export async function POST(req: NextRequest) {
  try {
    // Phase LZ3: Payments kill switch
    if (envVars.app.disablePayments) {
      return NextResponse.json(
        { error: 'Payments temporarily disabled' },
        { status: 503 }
      )
    }

    // Verify session
    const sessionCookie = req.cookies.get('session')?.value
    if (!sessionCookie || !adminAuth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true)
    const uid = decodedClaims.uid

    const { productId } = await req.json()

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    // Get one-time product from single source of truth
    const product = getOneTimeProduct(String(productId))
    if (!product || !isValidOneTimeProduct(String(productId))) {
      return NextResponse.json({ error: 'Invalid product' }, { status: 400 })
    }

    const razorpayKeyId = envVars.razorpay.keyId
    const razorpayKeySecret = envVars.razorpay.keySecret

    if (!razorpayKeyId || !razorpayKeySecret) {
      return NextResponse.json(
        { error: 'RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET missing. Payment service not configured.' },
        { status: 500 }
      )
    }

    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    })

    const order = await razorpay.orders.create({
      amount: product.amountInINR * 100, // Convert to paise
      currency: 'INR',
      receipt: `one_time_${productId}_${Date.now()}_${uid}`,
      notes: {
        productId: String(productId),
        productIdInternal: product.id,
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
        productIdInternal: product.id,
        amount: product.amountInINR,
        tickets: product.tickets,
        status: 'created',
        createdAt: new Date(),
      })
    }

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      product: {
        name: product.name,
        amount: product.amountInINR,
        description: product.description,
      },
    })
  } catch (err: any) {
    console.error('Create one-time order error:', err)
    return NextResponse.json({ error: err.message || 'Failed to create order' }, { status: 500 })
  }
}

