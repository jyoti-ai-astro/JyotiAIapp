'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getOneTimeProduct } from '@/lib/pricing/plans'

interface OneTimeOfferBannerProps {
  // Current API
  feature?: string
  productId?: string
  className?: string

  // Legacy API kept temporarily while older feature pages migrate.
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
      <Card className="bg-gradient-to-r from-gold/10 via-gold/5 to-gold/10 border-gold/30 backdrop-blur-xl p-6">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold to-gold/60 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-black" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {title || `Unlock ${feature || product.name} instantly`}
              </h3>
              <p className="text-sm text-white/70">
                {description || `No subscription needed • ${product.bullets[0]}`}
              </p>
            </div>
          </div>
          <Link href={ctaHref || `/pay/${product.productId}`}>
            <Button className="gold-btn whitespace-nowrap">
              <Zap className="w-4 h-4 mr-2" />
              {ctaLabel || `Get ${product.name} – ${priceLabel || `₹${product.amountInINR}`}`}
            </Button>
          </Link>
        </div>
      </Card>
    </motion.div>
  )
}
