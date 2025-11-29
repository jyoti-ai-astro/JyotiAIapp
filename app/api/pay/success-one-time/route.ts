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

    // Define ticket mapping
    const ticketMap: Record<string, { ai_questions?: number; kundali_basic?: number }> = {
      '99': { ai_questions: 1 },
      '199': { ai_questions: 3, kundali_basic: 1 },
    }

    const ticketsToAdd = ticketMap[String(productId)]
    if (!ticketsToAdd) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })
    }

    // Get user document
    const userRef = adminDb.collection('users').doc(uid)
    const userSnap = await userRef.get()
    const currentUserData = userSnap.exists ? userSnap.data() : {}
    const currentTickets = currentUserData?.tickets || {}

    // Merge tickets (add to existing, don't replace)
    const updatedTickets = {
      ai_questions: (currentTickets.ai_questions || 0) + (ticketsToAdd.ai_questions || 0),
      kundali_basic: (currentTickets.kundali_basic || 0) + (ticketsToAdd.kundali_basic || 0),
    }

    // Update user document with tickets
    await userRef.set(
      {
        tickets: updatedTickets,
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
    const orderRef = adminDb
      .collection('payments')
      .doc(uid)
      .collection('one_time_orders')
      .doc(order_id)
    await orderRef.update({
      paymentId: payment_id,
      signature: signature,
      status: 'completed',
      completedAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      tickets: updatedTickets,
      payment: {
        orderId: order_id,
        paymentId: payment_id,
        status: 'completed',
      },
    })
  } catch (err: any) {
    console.error('One-time payment success error:', err)
    return NextResponse.json({ error: err.message || 'Failed to process payment' }, { status: 500 })
  }
}

