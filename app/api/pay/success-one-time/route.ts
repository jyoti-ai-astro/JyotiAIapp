import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { FieldValue } from 'firebase-admin/firestore'
import crypto from 'crypto'
import { envVars } from '@/lib/env/env.mjs'
import { getOneTimeProduct } from '@/lib/pricing/plans'
import { logEvent } from '@/lib/logging/log-event'

export const dynamic = 'force-dynamic'

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

    if (!order_id || !payment_id || !signature) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify Razorpay signature
    const razorpayKeySecret = envVars.razorpay.keySecret
    if (!razorpayKeySecret) {
      return NextResponse.json(
        { error: 'Payment verification is temporarily unavailable. Please try again shortly.' },
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

    // The server-created Firestore order is authoritative for fulfillment.
    // The client may report a product ID for compatibility, but it can never
    // choose which entitlement is granted.
    if (!orderSnap.exists) {
      await logEvent(
        'api.error',
        {
          endpoint: '/api/pay/success-one-time',
          phase: 'order_authority_validation',
          reason: 'canonical_order_not_found',
          orderId: order_id,
          paymentId: payment_id,
        },
        uid
      )

      return NextResponse.json(
        { error: 'Payment order not found. Please contact support.' },
        { status: 404 }
      )
    }

    const orderData = orderSnap.data()
    const canonicalProductId = String(orderData?.productId || '')

    if (!canonicalProductId) {
      return NextResponse.json(
        { error: 'Payment order is missing product information' },
        { status: 409 }
      )
    }

    if (productId && String(productId) !== canonicalProductId) {
      await logEvent(
        'api.error',
        {
          endpoint: '/api/pay/success-one-time',
          phase: 'product_authority_validation',
          reason: 'client_product_mismatch',
          orderId: order_id,
          canonicalProductId,
        },
        uid
      )

      return NextResponse.json(
        { error: 'Payment product does not match the original order' },
        { status: 409 }
      )
    }

    if (orderData?.fulfilledAt) {
      return NextResponse.json({
        success: true,
        orderId: order_id,
        paymentId: payment_id,
        productId: canonicalProductId,
        alreadyFulfilled: true,
      })
    }

    const product = getOneTimeProduct(canonicalProductId)
    if (!product) {
      return NextResponse.json(
        { error: 'Payment order references an invalid product' },
        { status: 409 }
      )
    }

    if (
      Number(orderData?.amount) !== product.amountInINR ||
      orderData?.productIdInternal !== product.id
    ) {
      await logEvent(
        'api.error',
        {
          endpoint: '/api/pay/success-one-time',
          phase: 'order_integrity_validation',
          reason: 'canonical_order_mismatch',
          orderId: order_id,
          canonicalProductId,
        },
        uid
      )

      return NextResponse.json(
        { error: 'Payment order failed integrity validation' },
        { status: 409 }
      )
    }

    const userRef = adminDb.collection('users').doc(uid)

    // ============================================
    // ✅ Unified Ticket Fulfillment (Clean + Correct)
    // ============================================
    const updates: any = {
      updatedAt: new Date(),
    };

    // ✔ AI Guru Tickets
    if (product.tickets.aiQuestions) {
      const qty = product.tickets.aiQuestions;
      updates.aiGuruTickets = FieldValue.increment(qty);
      updates.tickets = FieldValue.increment(qty); // legacy
      updates["legacyTickets.ai_questions"] = FieldValue.increment(qty);
    }

    // ✔ Kundali Tickets
    if (product.tickets.kundaliBasic) {
      const qty = product.tickets.kundaliBasic;
      updates.kundaliTickets = FieldValue.increment(qty);
      updates["legacyTickets.kundali_basic"] = FieldValue.increment(qty);
    }

    // ✔ Prediction Tickets
    if (product.tickets.predictions) {
      const qty = product.tickets.predictions;
      updates.lifetimePredictions = FieldValue.increment(qty);
    }

    const oneTimePurchase = {
      productId: canonicalProductId,
      productIdInternal: product.id,
      paymentId: payment_id,
      orderId: order_id,
      date: new Date(),
      tickets: product.tickets,
      amount: product.amountInINR,
    }

    const fulfillment = await adminDb.runTransaction(async (transaction) => {
      const lockedOrderSnap = await transaction.get(orderRef)

      if (!lockedOrderSnap.exists) {
        throw new Error('Canonical payment order disappeared during fulfillment')
      }

      const lockedOrderData = lockedOrderSnap.data()
      const lockedProductId = String(lockedOrderData?.productId || '')

      if (
        lockedProductId !== canonicalProductId ||
        lockedOrderData?.productIdInternal !== product.id ||
        Number(lockedOrderData?.amount) !== product.amountInINR
      ) {
        throw new Error('Canonical payment order changed during fulfillment')
      }

      if (lockedOrderData?.fulfilledAt) {
        return { alreadyFulfilled: true }
      }

      transaction.set(
        userRef,
        {
          ...updates,
          oneTimePurchases: FieldValue.arrayUnion(oneTimePurchase),
        },
        { merge: true }
      )

      transaction.set(
        orderRef,
        {
          paymentId: payment_id,
          signature: signature,
          status: 'completed',
          completedAt: new Date(),
          fulfilledAt: new Date(),
          fulfillmentSource: 'success-endpoint',
        },
        { merge: true }
      )

      return { alreadyFulfilled: false }
    })

    if (fulfillment.alreadyFulfilled) {
      return NextResponse.json({
        success: true,
        orderId: order_id,
        paymentId: payment_id,
        productId: canonicalProductId,
        alreadyFulfilled: true,
      })
    }

    // Phase Z3: Log successful payment
    await logEvent('payment.success', {
      orderId: order_id,
      paymentId: payment_id,
      productId: canonicalProductId,
      amount: product.amountInINR,
      tickets: product.tickets,
    }, uid)

    // Send payment receipt email
    try {
      const { sendPaymentReceipt } = await import('@/lib/email/email-service')
      const userSnap = await userRef.get()
      const userData = userSnap.exists ? userSnap.data() : {}
      const userEmail = userData?.email || decodedClaims.email
      
      if (userEmail) {
        await sendPaymentReceipt(
          userEmail,
          product.amountInINR,
          payment_id,
          undefined, // planName (not applicable for one-time)
          undefined, // expiryDate (not applicable for one-time)
          product.name // productName
        ).catch(err => console.error('Failed to send payment receipt email:', err))
      }
    } catch (emailError) {
      console.error('Payment receipt email error:', emailError)
      // Don't fail the payment if email fails
    }

    return NextResponse.json({
      success: true,
      orderId: order_id,
      paymentId: payment_id,
      productId: canonicalProductId,
      ticketsGranted: product.tickets,
    })
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
