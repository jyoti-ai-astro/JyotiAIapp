'use client'

import React, { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle2, Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import MarketingPageShell from '@/src/ui/layout/MarketingPageShell'

export default function ThanksPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const paymentSuccess = searchParams.get('payment') === 'success'

  useEffect(() => {
    // Auto-redirect to dashboard after 5 seconds
    const timer = setTimeout(() => {
      router.push('/dashboard')
    }, 5000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <MarketingPageShell
      eyebrow="Payment Complete"
      title={
        <>
          Payment{' '}
          <span className="bg-gradient-to-r from-[#FFD57A] to-[#FFB347] bg-clip-text text-transparent">
            Successful!
          </span>
        </>
      }
      description="Your access has been activated. You can now use your purchased features."
    >
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center space-y-8"
        >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-gold/20 to-gold/10 border-4 border-gold/50 mb-4"
            >
              <CheckCircle2 className="w-12 h-12 text-gold" />
            </motion.div>


            {paymentSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/30 text-gold text-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>Tickets have been added to your account</span>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
            >
              <Link href="/dashboard">
                <Button className="bg-gold text-cosmic-navy hover:bg-gold/90 px-8 py-6 text-lg font-heading">
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/guru">
                <Button
                  variant="outline"
                  className="border-gold/30 text-gold hover:bg-gold/10 px-8 py-6 text-lg font-heading"
                >
                  Try AI Guru
                </Button>
              </Link>
            </motion.div>

            <p className="text-sm text-white/40 pt-4">
              Redirecting to dashboard in a few seconds...
            </p>
          </motion.div>
        </div>
    </MarketingPageShell>
  )
}

