'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getOneTimeProduct } from '@/lib/pricing/plans'

interface OneTimeOfferBannerProps {
  feature: string
  productId?: string
  className?: string
}

export function OneTimeOfferBanner({ feature, productId = '199', className = '' }: OneTimeOfferBannerProps) {
  const product = getOneTimeProduct(productId)

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
                Unlock {feature} instantly
              </h3>
              <p className="text-sm text-white/70">
                No subscription needed • {product.bullets[0]}
              </p>
            </div>
          </div>
          <Link href={`/pay/${product.productId}`}>
            <Button className="gold-btn whitespace-nowrap">
              <Zap className="w-4 h-4 mr-2" />
              Get {product.name} – ₹{product.amountInINR}
            </Button>
          </Link>
        </div>
      </Card>
    </motion.div>
  )
}
