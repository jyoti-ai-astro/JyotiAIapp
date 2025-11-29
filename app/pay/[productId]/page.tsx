'use client'

import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useUserStore } from '@/store/user-store'
import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Sparkles, Lock, CheckCircle2 } from 'lucide-react'
import { CosmicBackground } from '@/components/dashboard/CosmicBackground'
import { PageTransitionWrapper } from '@/components/global/PageTransitionWrapper'
import Script from 'next/script'

declare global {
  interface Window {
    Razorpay: any
  }
}

const PRODUCT_INFO: Record<string, { name: string; description: string; features: string[] }> = {
  '99': {
    name: 'Quick Readings',
    description: 'Perfect for quick answers and first-time users',
    features: [
      'Daily Horoscope (7 days)',
      'Name Correction / Name Numerology',
      'One AI Guru Question',
      'Lucky Number & Color',
    ],
  },
  '199': {
    name: 'Deep Insights',
    description: 'Deeper insights without a monthly plan',
    features: [
      'Kundali Report (Basic)',
      'Relationship Compatibility (Lite)',
      'Career Reading (Lite)',
      '3 AI Guru Questions',
    ],
  },
}

export default function OneTimePaymentPage() {
  const { productId } = useParams()
  const router = useRouter()
  const { user } = useUserStore()
  const [loading, setLoading] = useState(false)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)

  const productInfo = PRODUCT_INFO[productId as string]
  const price = productId === '99' ? 99 : productId === '199' ? 199 : 0

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/pay/' + productId)
    }
  }, [user, router, productId])

  const handlePayment = async () => {
    if (!user || !razorpayLoaded) {
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/pay/create-one-time-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ productId: Number(productId) }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create order')
      }

      const data = await res.json()

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        amount: data.amount,
        currency: 'INR',
        name: 'JyotiAI',
        description: data.product.description,
        order_id: data.id,
        method: {
          upi: true, // Enable UPI for Indian users
        },
        handler: async function (response: any) {
          try {
            const successRes = await fetch('/api/pay/success-one-time', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({
                order_id: data.id,
                payment_id: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                productId: String(productId),
              }),
            })

            if (!successRes.ok) {
              throw new Error('Payment verification failed')
            }

            // Redirect to thank you page
            router.push('/thanks?payment=success')
          } catch (error) {
            console.error('Payment success error:', error)
            alert('Payment successful but verification failed. Please contact support.')
          }
        },
        prefill: {
          email: user.email || '',
          name: user.name || '',
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
    } catch (error: any) {
      console.error('Payment error:', error)
      alert(error.message || 'Failed to initiate payment')
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-cosmic-navy text-white flex items-center justify-center">
        <p>Please login first.</p>
      </div>
    )
  }

  if (!productInfo) {
    return (
      <div className="min-h-screen bg-cosmic-navy text-white flex items-center justify-center">
        <p>Invalid product.</p>
      </div>
    )
  }

  return (
    <PageTransitionWrapper>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
        strategy="lazyOnload"
      />
      <div className="min-h-screen bg-cosmic-navy text-white relative overflow-hidden">
        <CosmicBackground />

        <div className="relative z-10 container mx-auto px-4 py-20 lg:py-24">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-cosmic-indigo/40 backdrop-blur-xl border-white/10 p-8 md:p-12">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/10 border border-gold/30 mb-4">
                  <Sparkles className="w-8 h-8 text-gold" />
                </div>
                <h1 className="text-3xl md:text-4xl font-display font-bold text-gold mb-2">
                  {productInfo.name}
                </h1>
                <p className="text-xl text-white/70 mb-6">{productInfo.description}</p>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-display font-bold text-white">₹{price}</span>
                  <span className="text-white/60">/one-time</span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <h3 className="text-lg font-semibold text-gold mb-4">What's Included:</h3>
                {productInfo.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-aura-green flex-shrink-0 mt-0.5" />
                    <span className="text-white/80">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <Button
                  onClick={handlePayment}
                  disabled={loading || !razorpayLoaded}
                  className="w-full bg-gradient-to-r from-gold/80 to-gold text-cosmic-navy font-semibold hover:brightness-110 text-lg py-6 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : `Pay ₹${price} Now`}
                </Button>
                <p className="text-center text-sm text-white/50">
                  Secure payment powered by Razorpay. No subscription required.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageTransitionWrapper>
  )
}

