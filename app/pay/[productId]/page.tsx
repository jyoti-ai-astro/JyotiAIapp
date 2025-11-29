'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ShieldCheck, Zap, Crown, Check, Loader2, AlertCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useUserStore } from '@/store/user-store'
import { CosmicBackground } from '@/components/dashboard/CosmicBackground'
import { PageTransitionWrapper } from '@/components/global/PageTransitionWrapper'
import Script from 'next/script'
// Note: envVars is server-only, use NEXT_PUBLIC_RAZORPAY_KEY_ID directly

declare global {
  interface Window {
    Razorpay: any
  }
}

// Product Configuration
const PRODUCTS: Record<
  string,
  {
    name: string
    price: number
    type: 'ticket' | 'subscription'
    features: string[]
    icon: 'zap' | 'crown'
  }
> = {
  // One-time ticket packs
  quick: {
    name: 'Quick Question Pack',
    price: 99,
    type: 'ticket',
    features: ['1 AI Guru Question', 'Detailed Analysis', 'Instant Reply'],
    icon: 'zap',
  },
  '99': {
    name: 'Quick Readings',
    price: 99,
    type: 'ticket',
    features: [
      'Daily Horoscope (7 days)',
      'Name Correction / Name Numerology',
      'One AI Guru Question',
      'Lucky Number & Color',
    ],
    icon: 'zap',
  },
  deep: {
    name: 'Deep Dive Pack',
    price: 199,
    type: 'ticket',
    features: ['3 AI Guru Questions', 'Deep Karmic Analysis', 'Remedy Suggestions'],
    icon: 'zap',
  },
  '199': {
    name: 'Deep Insights',
    price: 199,
    type: 'ticket',
    features: [
      'Kundali Report (Basic)',
      'Relationship Compatibility (Lite)',
      'Career Reading (Lite)',
      '3 AI Guru Questions',
    ],
    icon: 'zap',
  },
  // Subscription plans
  starter: {
    name: 'Starter Plan',
    price: 499,
    type: 'subscription',
    features: ['5 Questions / Day', 'Daily Horoscope', 'Basic Remedies', 'Basic Kundali'],
    icon: 'crown',
  },
  advanced: {
    name: 'Advanced Plan',
    price: 999,
    type: 'subscription',
    features: ['Unlimited Chat', 'Full Kundali', 'All Remedies', 'Priority Support'],
    icon: 'crown',
  },
  supreme: {
    name: 'Supreme Plan',
    price: 1999,
    type: 'subscription',
    features: [
      'Everything in Advanced',
      'Career & Business Engine',
      'Pregnancy Insights',
      'Advanced Reports (PDF)',
      'Priority Support',
    ],
    icon: 'crown',
  },
}

export default function PaymentPage() {
  const params = useParams()
  const productId = (params?.productId as string) || ''
  const product = PRODUCTS[productId.toLowerCase()]

  const router = useRouter()
  const { user } = useUserStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)

  useEffect(() => {
    if (!product) {
      router.push('/pricing')
    }
  }, [product, router])

  useEffect(() => {
    if (!user) {
      router.push(`/login?redirect=/pay/${productId}`)
    }
  }, [user, router, productId])

  const handlePayment = async () => {
    if (!user || !razorpayLoaded) {
      return
    }

    setLoading(true)
    setError('')

    try {
      let orderData: any

      // Route to correct API based on product type
      if (product.type === 'ticket') {
        // Use one-time order API
        const numericId = productId === 'quick' || productId === '99' ? 99 : 199
        const res = await fetch('/api/pay/create-one-time-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ productId: numericId }),
        })

        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.error || 'Order creation failed')
        }

        orderData = await res.json()
      } else {
        // Use subscription order API
        const res = await fetch('/api/payments/order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            amount: product.price,
            planName: productId,
            reportType: 'subscription',
          }),
        })

        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.error || 'Order creation failed')
        }

        const data = await res.json()
        orderData = {
          id: data.order.id,
          amount: data.order.amount,
          currency: data.order.currency,
          key: data.order.key,
        }
      }

      // Initialize Razorpay
      const razorpayKeyId =
        product.type === 'ticket'
          ? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || ''
          : orderData.key

      const options = {
        key: razorpayKeyId,
        amount: product.type === 'ticket' ? orderData.amount : orderData.amount * 100,
        currency: 'INR',
        name: 'Jyoti AI',
        description: product.name,
        order_id: orderData.id,
        method: {
          upi: true, // Enable UPI for Indian users
        },
        handler: async function (response: any) {
          try {
            if (product.type === 'ticket') {
              // Verify one-time payment
              const verifyRes = await fetch('/api/pay/success-one-time', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                  order_id: orderData.id,
                  payment_id: response.razorpay_payment_id,
                  signature: response.razorpay_signature,
                  productId: productId === 'quick' ? '99' : productId === 'deep' ? '199' : productId,
                }),
              })

              if (!verifyRes.ok) {
                throw new Error('Payment verification failed')
              }

              router.push('/thanks?payment=success')
            } else {
              // Verify subscription payment
              const verifyRes = await fetch('/api/payments/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  planName: productId,
                }),
              })

              if (!verifyRes.ok) {
                throw new Error('Payment verification failed')
              }

              router.push('/thanks?payment=success&plan=' + productId)
            }
          } catch (err: any) {
            console.error('Payment verification error:', err)
            setError('Payment verification failed. Please contact support.')
            setLoading(false)
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#F4CE65', // Gold color
        },
        modal: {
          ondismiss: function () {
            setLoading(false)
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open({ method: { upi: true } })
    } catch (err: any) {
      console.error('Payment error:', err)
      setError(err.message || 'Payment initialization failed')
      setLoading(false)
    }
  }

  if (!product || !user) {
    return (
      <div className="min-h-screen bg-cosmic-navy text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  const IconComponent = product.icon === 'zap' ? Zap : Crown

  return (
    <PageTransitionWrapper>
      {/* Razorpay Script */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
        strategy="lazyOnload"
      />

      <div className="min-h-screen bg-cosmic-navy text-white flex items-center justify-center p-4 relative overflow-hidden">
        <CosmicBackground intensity={0.5} />

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-10 w-full max-w-md"
        >
          <Card className="bg-cosmic-indigo/60 backdrop-blur-xl border-white/10 p-8 space-y-8 shadow-2xl relative overflow-hidden">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 mx-auto flex items-center justify-center mb-4">
                <IconComponent className="w-8 h-8 text-gold" />
              </div>
              <h1 className="text-2xl font-bold font-display text-white">{product.name}</h1>
              <p className="text-white/60">
                {product.type === 'subscription' ? 'Monthly subscription' : 'One-time payment'}
              </p>
            </div>

            {/* Price Tag */}
            <div className="text-center py-6 bg-white/5 rounded-2xl border border-white/5">
              <span className="text-4xl font-bold text-gold">₹{product.price}</span>
              <span className="text-sm text-white/40 block mt-1">
                {product.type === 'subscription' ? '/month' : 'one-time payment'}
              </span>
            </div>

            {/* Features */}
            <div className="space-y-3">
              {product.features.map((feat, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-white/80">
                  <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-green-400" />
                  </div>
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            {/* Action */}
            <div className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}

              <Button
                onClick={handlePayment}
                disabled={loading || !razorpayLoaded}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold h-12 text-lg shadow-lg shadow-purple-500/25 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  `Pay ₹${product.price}${product.type === 'subscription' ? '/month' : ''}`
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-white/30">
                <ShieldCheck className="w-3 h-3" />
                Secure Payment via Razorpay
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </PageTransitionWrapper>
  )
}
