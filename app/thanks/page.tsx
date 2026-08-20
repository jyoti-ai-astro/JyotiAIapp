'use client'

import React, { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import MarketingPageShell from '@/src/ui/layout/MarketingPageShell'

export default function ThanksPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const paymentSuccess = searchParams.get('payment') === 'success'
  const product = searchParams.get('product')

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/dashboard')
    }, 7000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <MarketingPageShell
      eyebrow={paymentSuccess ? 'Payment received' : 'Payment status'}
      title={paymentSuccess ? 'Your purchase is being applied' : 'Review your payment status'}
      description={
        paymentSuccess
          ? 'JyotiAI has received your payment result. Your account access is updated after server verification.'
          : 'If your payment completed but access is not visible yet, check Payments or contact support with your Razorpay receipt.'
      }
    >
      <div className="flex min-h-[56vh] items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl space-y-6 text-center"
        >
          <Card className="bg-card p-6 md:p-8">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-saffron/35 bg-saffron/12">
              {paymentSuccess ? (
                <CheckCircle2 className="h-10 w-10 text-saffron" aria-hidden="true" />
              ) : (
                <AlertCircle className="h-10 w-10 text-saffron" aria-hidden="true" />
              )}
            </div>

            <div className="mt-6 space-y-3">
              <h2 className="font-heading text-2xl font-semibold text-primary md:text-3xl">
                {paymentSuccess ? 'Thank you for your purchase' : 'Payment could not be confirmed here'}
              </h2>
              <p className="mx-auto max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
                {paymentSuccess
                  ? 'Your purchased access is available once verification finishes. Open your dashboard or the relevant JyotiAI feature to continue.'
                  : 'No access is shown as granted unless server verification succeeds.'}
              </p>
              {product && (
                <p className="text-sm text-muted-foreground">
                  Product selected: <span className="font-medium text-primary">₹{product} one-time reading</span>
                </p>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid gap-3 pt-6 sm:grid-cols-2 lg:grid-cols-4"
            >
              <Link
                href="/dashboard"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-transparent bg-primary px-5 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Dashboard
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/guru"
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-border bg-surface-raised px-5 text-base font-medium text-primary transition-colors hover:border-saffron hover:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Guru
              </Link>
              <Link
                href="/kundali"
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-border bg-surface-raised px-5 text-base font-medium text-primary transition-colors hover:border-saffron hover:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Kundali
              </Link>
              <Link
                href="/reports"
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-border bg-surface-raised px-5 text-base font-medium text-primary transition-colors hover:border-saffron hover:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Reports
              </Link>
            </motion.div>

            <p className="pt-5 text-sm text-muted-foreground" role="status">
              Redirecting to dashboard shortly.
            </p>
          </Card>
        </motion.div>
      </div>
    </MarketingPageShell>
  )
}
