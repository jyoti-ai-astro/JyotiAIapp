'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getOneTimeProduct } from '@/lib/pricing/plans'

interface OneTimeOfferBannerProps {
  feature?: string
  productId?: string
  className?: string

  title?: string
  description?: string
  priceLabel?: string
  ctaLabel?: string
  ctaHref?: string
}

export function OneTimeOfferBanner({
  feature,
  productId = '199',
  className = '',
  title,
  description,
  priceLabel,
  ctaLabel,
  ctaHref,
}: OneTimeOfferBannerProps) {
  const resolvedProductId =
    ctaHref?.match(/\/pay\/([^/?#]+)/)?.[1] || productId

  const product = getOneTimeProduct(resolvedProductId)

  if (!product) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <div className="relative overflow-hidden rounded-2xl border border-[#dfa84d]/22 bg-[#0b1519] p-5 md:p-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full border border-[#dfa84d]/10"
        />

        <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center">
          <div className="flex flex-1 items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#dfa84d]/25 bg-[#dfa84d]/10">
              <Sparkles className="h-5 w-5 text-[#dfa84d]" />
            </div>

            <div>
              <h3 className="text-base font-semibold text-[#f5eee2] md:text-lg">
                {title || `Unlock ${feature || product.name} instantly`}
              </h3>

              <p className="mt-1 text-sm leading-6 text-[#9f9b94]">
                {description ||
                  `No subscription needed • ${product.bullets[0]}`}
              </p>
            </div>
          </div>

          <Link
            href={ctaHref || `/pay/${product.productId}`}
            className="shrink-0"
          >
            <Button className="min-h-11 border-[#e8aa4f] bg-[#e99a34] px-5 font-semibold text-[#160d04] hover:bg-[#f1aa4d]">
              <Zap className="mr-2 h-4 w-4" />
              {ctaLabel ||
                `Get ${product.name} – ${
                  priceLabel || `₹${product.amountInINR}`
                }`}
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
