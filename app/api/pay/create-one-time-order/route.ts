// app/api/pay/create-one-time-order/route.ts

import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { envVars } from '@/lib/env/env.mjs';
import { getOneTimeProduct, isValidOneTimeProduct } from '@/lib/pricing/plans';
import { logEvent } from '@/lib/logging/log-event';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // Phase LZ3: Payments kill switch (defensive)
    if (envVars?.app?.disablePayments) {
      return NextResponse.json(
        { error: 'Payments temporarily disabled' },
        { status: 503 }
      );
    }

    // Verify session
    const sessionCookie = req.cookies.get('session')?.value;
    if (!sessionCookie || !adminAuth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    const uid = decodedClaims.uid;

    // Parse body
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const productId = body?.productId;
    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    // Get one-time product from single source of truth
    const product = getOneTimeProduct(String(productId));
    if (!product || !isValidOneTimeProduct(String(productId))) {
      return NextResponse.json({ error: 'Invalid product' }, { status: 400 });
    }

    const razorpayKeyId = envVars?.razorpay?.keyId;
    const razorpayKeySecret = envVars?.razorpay?.keySecret;

    if (!razorpayKeyId || !razorpayKeySecret) {
      return NextResponse.json(
        {
          error:
            'RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET missing. Payment service not configured.',
        },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });

    // FINAL FIXED RECEIPT (ALWAYS < 40 chars)
    const receipt = `ot_${productId}_${Date.now()}`; // e.g. "ot_99_1733490000000"

    let order;
    try {
      order = await razorpay.orders.create({
        amount: product.amountInINR * 100, // Convert to paise
        currency: 'INR',
        receipt,
        notes: {
          productId: String(productId),
          productIdInternal: product.id,
          type: 'one_time',
          userId: uid,
        },
      });
    } catch (err: any) {
      console.error('[payments] Razorpay order create error:', {
        statusCode: err?.statusCode,
        error: err?.error,
        message: err?.message,
      });

      // Log structured error for later debugging (safe logger strips undefined)
      await logEvent(
        'api.error',
        {
          endpoint: '/api/pay/create-one-time-order',
          phase: 'razorpay.orders.create',
          statusCode: err?.statusCode,
          errorCode: err?.error?.code,
          errorDescription: err?.error?.description,
          message: err?.message || 'Unknown Razorpay error',
        },
        uid
      );

      if (err?.statusCode === 401) {
        return NextResponse.json(
          {
            error:
              'Razorpay authentication failed. Please verify RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local (test key + secret pair from the same Razorpay account).',
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          error:
            err?.error?.description ||
            err?.message ||
            'Failed to create order with Razorpay',
        },
        { status: 500 }
      );
    }

    // Save order to Firestore (non-blocking failures logged only)
    if (adminDb) {
      try {
        const orderRef = adminDb
          .collection('payments')
          .doc(uid)
          .collection('one_time_orders')
          .doc(order.id);

        await orderRef.set({
          orderId: order.id,
          productId: String(productId),
          productIdInternal: product.id,
          amount: product.amountInINR,
          tickets: product.tickets,
          status: 'created',
          createdAt: new Date(),
        });

        await logEvent(
          'payment.order_created',
          {
            orderId: order.id,
            productId: String(productId),
            amount: product.amountInINR,
            currency: order.currency,
          },
          uid
        );
      } catch (logErr: any) {
        console.error('Non-blocking order log/write error:', logErr);
      }
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
    });
  } catch (err: any) {
    console.error('Create one-time order outer error:', err);

    try {
      await logEvent(
        'api.error',
        {
          endpoint: '/api/pay/create-one-time-order',
          phase: 'outer',
          error: err?.message || 'Unknown error',
        }
      );
    } catch (logErr: any) {
      console.error('Error logging API error:', logErr);
    }

    return NextResponse.json(
      { error: err?.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
