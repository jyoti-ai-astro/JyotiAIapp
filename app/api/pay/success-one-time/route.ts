import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import crypto from 'crypto'
import { envVars } from '@/lib/env/env.mjs'
import { getOneTimeProduct } from '@/lib/pricing/plans'
import { logEvent } from '@/lib/logging/log-event'

export async function POST(req: NextRequest) {
  try {
    // Verify session
    const sessionCookie = req.cookies.get('session')?.value
    if (!sessionCookie || !adminAuth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true)
    const uid = decodedClaims.uid

    if (!adminDb) {
      return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 })
    }

    const body = await req.json()
    const { order_id, payment_id, signature, productId } = body

    if (!order_id || !payment_id || !signature || !productId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify Razorpay signature
    const razorpayKeySecret = envVars.razorpay.keySecret
    if (!razorpayKeySecret) {
      return NextResponse.json(
        { error: 'RAZORPAY_KEY_SECRET missing. Payment verification not configured.' },
        { status: 500 }
      )
    }

    const text = `${order_id}|${payment_id}`
    const generatedSignature = crypto.createHmac('sha256', razorpayKeySecret).update(text).digest('hex')

    if (generatedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Get order details to determine what was purchased
    const orderRef = adminDb
      .collection('payments')
      .doc(uid)
      .collection('one_time_orders')
      .doc(order_id)
    const orderSnap = await orderRef.get()
    const orderData = orderSnap.exists ? orderSnap.data() : {}
    const productIdStr = String(orderData?.productId || productId)

    // Get one-time product from single source of truth
    const product = getOneTimeProduct(productIdStr)
    if (!product) {
      return NextResponse.json({ error: 'Invalid product' }, { status: 400 })
    }

    // Get user document
    const userRef = adminDb.collection('users').doc(uid)
    const userSnap = await userRef.get()
    const currentUserData = userSnap.exists ? userSnap.data() : {}

    // Fulfillment Logic based on product tickets
    const updates: any = {}

    // Add AI Guru tickets
    if (product.tickets.aiQuestions) {
      const currentAiGuruTickets = currentUserData?.aiGuruTickets || 0
      updates.aiGuruTickets = currentAiGuruTickets + product.tickets.aiQuestions
      
      // Also update legacy tickets field for backward compatibility
      const currentTickets = currentUserData?.tickets || 0
      updates.tickets = currentTickets + product.tickets.aiQuestions
    }

    // Add Kundali basic tickets
    if (product.tickets.kundaliBasic) {
      const currentKundaliTickets = currentUserData?.kundaliTickets || 0
      updates.kundaliTickets = currentKundaliTickets + product.tickets.kundaliBasic
    }

    // Add prediction credits if specified
    if (product.tickets.predictions) {
      const currentPredictions = currentUserData?.lifetimePredictions || 0
      updates.lifetimePredictions = currentPredictions + product.tickets.predictions
    }

    // Update user document
    const oneTimePurchase = {
      productId: String(productId),
      productIdInternal: product.id,
      paymentId: payment_id,
      orderId: order_id,
      date: new Date(),
      tickets: product.tickets,
      amount: product.amountInINR,
    }
    
    await userRef.set(
      {
        ...updates,
        oneTimePurchases: adminDb.FieldValue.arrayUnion(oneTimePurchase),
      },
      { merge: true }
    )

    // Update order status
    await orderRef.update({
      paymentId: payment_id,
      signature: signature,
      status: 'completed',
      completedAt: new Date(),
    })

    // Phase Z3: Log successful payment
    await logEvent('payment.success', {
      orderId: order_id,
      paymentId: payment_id,
      productId: String(productId),
      amount: product.amountInINR,
      tickets: product.tickets,
    }, uid)

    return NextResponse.redirect(new URL('/thanks?payment=success', req.url))
  } catch (err: any) {
    console.error('One-time payment success error:', err)
    // Phase Z3: Log error
    await logEvent('api.error', {
      endpoint: '/api/pay/success-one-time',
      error: err.message || 'Unknown error',
      stack: err.stack,
    })
    return NextResponse.json({ error: err.message || 'Failed to process payment' }, { status: 500 })
  }
}

