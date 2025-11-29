import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import crypto from 'crypto'
import { envVars } from '@/lib/env/env.mjs'

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
      return NextResponse.json({ error: 'Razorpay not configured' }, { status: 500 })
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
    const planName = (orderData?.productId || String(productId)).toLowerCase()

    // Get user document
    const userRef = adminDb.collection('users').doc(uid)
    const userSnap = await userRef.get()
    const currentUserData = userSnap.exists ? userSnap.data() : {}

    // Fulfillment Logic: Quick/Deep packs add tickets, subscriptions update subscription
    const updates: any = {}

    if (planName.includes('99') || planName.includes('quick')) {
      // Quick Pack: Add 1 Ticket
      const currentTickets = currentUserData?.tickets || 0
      updates.tickets = (currentTickets || 0) + 1
    } else if (planName.includes('199') || planName.includes('deep')) {
      // Deep Pack: Add 3 Tickets
      const currentTickets = currentUserData?.tickets || 0
      updates.tickets = (currentTickets || 0) + 3
    } else if (['starter', 'advanced', 'supreme'].some((p) => planName.includes(p))) {
      // Subscription Plans
      const cleanPlan = ['starter', 'advanced', 'supreme'].find((p) => planName.includes(p))
      if (cleanPlan) {
        updates.subscription = cleanPlan
        updates.subscriptionExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +30 Days
      }
    }

    // Update user document
    await userRef.set(
      {
        ...updates,
        oneTimePurchases: adminDb.FieldValue.arrayUnion({
          productId: String(productId),
          paymentId: payment_id,
          orderId: order_id,
          date: new Date(),
        }),
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

    return NextResponse.redirect(new URL('/thanks?payment=success', req.url))
  } catch (err: any) {
    console.error('One-time payment success error:', err)
    return NextResponse.json({ error: err.message || 'Failed to process payment' }, { status: 500 })
  }
}

