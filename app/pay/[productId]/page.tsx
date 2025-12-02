'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ShieldCheck, Zap, Crown, Check, Loader2, AlertCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useUserStore } from '@/store/user-store'
import Script from 'next/script'
import DashboardPageShell from '@/src/ui/layout/DashboardPageShell'
import { getOneTimeProduct, isValidOneTimeProduct, type OneTimeProduct } from '@/lib/pricing/plans'

// Get payments disabled status from environment
const isPaymentsDisabled = process.env.NEXT_PUBLIC_DISABLE_PAYMENTS === 'true'

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function PaymentPage() {
  const params = useParams()
  const productId = (params?.productId as string) || ''
  const product = getOneTimeProduct(productId)

  const router = useRouter()
  const { user } = useUserStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)

  useEffect(() => {
    if (!product || !isValidOneTimeProduct(productId)) {
      router.push('/pricing')
    }
  }, [product, router, productId])

  useEffect(() => {
    if (!user) {
      router.push(`/login?redirect=/pay/${productId}`)
    }
  }, [user, router, productId])

  const handlePayment = async () => {
    if (!user || !razorpayLoaded || !product) {
      return
    }

    setLoading(true)
    setError('')

    try {
      // Use one-time order API
      const res = await fetch('/api/pay/create-one-time-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ productId: productId }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Order creation failed')
      }

      const orderData = await res.json()

      // Initialize Razorpay
      const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || ''

      const options = {
        key: razorpayKeyId,
        amount: orderData.amount, // Amount is already in paise from API
        currency: 'INR',
        name: 'Jyoti AI',
        description: product.description,
        order_id: orderData.id,
        method: {
          upi: true,
        },
        handler: async function (response: any) {
          try {
            // Verify one-time payment
            const verifyRes = await fetch('/api/pay/success-one-time', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                order_id: orderData.id,
                payment_id: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                productId: product.productId,
              }),
            })

            if (!verifyRes.ok) {
              throw new Error('Payment verification failed')
            }

            router.push('/thanks?payment=success')
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
          color: '#F4CE65',
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

  if (!product) {
    return null
  }

  const iconMap: Record<string, any> = {
    quick_99: Zap,
    deep_199: Sparkles,
    supreme_299: Crown,
  }

  const Icon = iconMap[product.id] || Sparkles

  return (
    <DashboardPageShell title="Complete Payment" subtitle={`${product.name} - ${product.label}`}>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
      />

      <div className="max-w-2xl mx-auto space-y-6">
        {isPaymentsDisabled && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-200 p-4 rounded-lg flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5" />
            <span>Payments are currently disabled. Please try again later.</span>
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/30 text-red-200 p-4 rounded-lg flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </motion.div>
        )}

        <Card className="bg-cosmic-indigo/60 backdrop-blur-xl border-white/10 p-8">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-gold/60 flex items-center justify-center">
                <Icon className="w-8 h-8 text-black" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{product.name}</h2>
                <p className="text-gold text-lg font-semibold">{product.label}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <p className="text-white/80 mb-4">{product.description}</p>
              <ul className="space-y-2">
                {product.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-white/70">
                    <Check className="w-4 h-4 text-gold" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white/60">Total Amount</span>
                <span className="text-3xl font-bold text-gold">₹{product.amountInINR}</span>
              </div>
            </div>

            <Button
              onClick={handlePayment}
              disabled={loading || !razorpayLoaded || isPaymentsDisabled}
              className="w-full gold-btn py-6 text-lg"
            >
              {isPaymentsDisabled ? (
                'Payments Temporarily Disabled'
              ) : loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5 mr-2" />
                  Pay ₹{product.amountInINR} Securely
                </>
              )}
            </Button>

            <p className="text-xs text-white/50 text-center">
              Secure payment powered by Razorpay. Your payment information is encrypted and secure.
            </p>
          </div>
        </Card>
      </div>
    </DashboardPageShell>
  )
}
