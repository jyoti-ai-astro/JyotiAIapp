'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ShieldCheck, Zap, Crown, Check, AlertCircle, MessageCircle, Ticket } from 'lucide-react'
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
      return
    }
    
    // Allow page to render first, then check auth
    // This prevents immediate redirect and allows user to see the page
    if (!user) {
      // Small delay to allow page to render
      const timer = setTimeout(() => {
        router.push(`/login?redirect=/pay/${productId}`)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [product, router, productId, user])

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

            if (verifyRes.ok) {
              router.push(`/thanks?payment=success&product=${productId}`)
            } else {
              const data = await verifyRes.json().catch(() => ({}))
              throw new Error(data.error || 'Payment verification failed')
            }
          } catch (err: any) {
            console.error('Payment verification error:', err)
            setError('Payment verification failed. Please contact support.')
            setLoading(false)
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '', // Razorpay will capture email if user is not logged in
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
    deep_199: MessageCircle,
    supreme_299: Crown,
  }

  const Icon = iconMap[product.id] || Ticket

  return (
    <DashboardPageShell title="Complete payment" subtitle="Review your reading pack before continuing to Razorpay.">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
      />

      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {isPaymentsDisabled && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-warning/35 bg-warning/10 p-4 text-primary lg:col-span-2"
            role="status"
          >
            <AlertCircle className="w-5 h-5" />
            <span>Payments are currently disabled. Please try again later.</span>
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-danger/35 bg-danger/10 p-4 text-primary lg:col-span-2"
            role="alert"
          >
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </motion.div>
        )}

        <Card className="bg-card p-6 md:p-8">
          <div className="space-y-7">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-saffron/35 bg-saffron/12">
                <Icon className="h-8 w-8 text-saffron" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-saffron">Selected product</p>
                <h2 className="mt-1 font-heading text-2xl font-semibold text-primary">{product.name}</h2>
                <p className="text-muted-foreground">{product.label}</p>
              </div>
            </div>

            <div className="border-t border-border pt-5">
              <p className="mb-4 leading-7 text-muted-foreground">{product.description}</p>
              <ul className="space-y-3">
                {product.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex gap-2 text-sm leading-6 text-muted-foreground">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-saffron" aria-hidden="true" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-border pt-5">
              <div className="mb-5 flex items-center justify-between gap-4 rounded-lg bg-surface-sunken px-4 py-3">
                <span className="text-sm font-medium text-muted-foreground">Total amount</span>
                <span className="font-heading text-3xl font-semibold text-primary">₹{product.amountInINR}</span>
              </div>
            </div>

            <Button
              onClick={handlePayment}
              disabled={loading || !razorpayLoaded || isPaymentsDisabled}
              fullWidth
              size="xl"
              loading={loading}
            >
              {isPaymentsDisabled ? (
                'Payments temporarily disabled'
              ) : loading ? (
                'Processing...'
              ) : (
                <>
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                  Pay ₹{product.amountInINR} securely
                </>
              )}
            </Button>

            <p className="text-center text-xs leading-5 text-muted-foreground">
              Secure payment powered by Razorpay. Your payment information is encrypted and secure.
            </p>
          </div>
        </Card>

        <aside className="space-y-4">
          <Card className="bg-[#07131F] p-6 text-[#FFF7E8]">
            <h3 className="font-heading text-xl font-semibold text-[#FFF7E8]">Account</h3>
            <dl className="mt-4 space-y-3 text-sm text-[#B9C2BF]">
              <div>
                <dt className="font-medium text-[#FFF7E8]">Signed in as</dt>
                <dd className="mt-1 break-words">{user?.email || user?.name || 'Authenticated user'}</dd>
              </div>
              <div>
                <dt className="font-medium text-[#FFF7E8]">Fulfillment</dt>
                <dd className="mt-1">Credits are added after payment verification.</dd>
              </div>
            </dl>
          </Card>
          <Card className="bg-surface-sunken p-6">
            <h3 className="font-heading text-xl font-semibold text-primary">Before you pay</h3>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
              <li className="flex gap-2">
                <Check className="mt-1 h-4 w-4 shrink-0 text-saffron" aria-hidden="true" />
                <span>You will complete payment in Razorpay.</span>
              </li>
              <li className="flex gap-2">
                <Check className="mt-1 h-4 w-4 shrink-0 text-saffron" aria-hidden="true" />
                <span>JyotiAI verifies the payment before granting access.</span>
              </li>
              <li className="flex gap-2">
                <Check className="mt-1 h-4 w-4 shrink-0 text-saffron" aria-hidden="true" />
                <span>If verification fails, no access is shown as granted on this page.</span>
              </li>
            </ul>
          </Card>
        </aside>
      </div>
    </DashboardPageShell>
  )
}
