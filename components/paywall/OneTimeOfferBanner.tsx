'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OneTimeOfferBannerProps {
  feature: string
  description?: string
  priceLabel?: string
  ctaLabel?: string
  ctaHref?: string
  className?: string
}

export function OneTimeOfferBanner({
  feature,
  description,
  priceLabel = '₹199',
  ctaLabel,
  ctaHref = '/pay/199',
  className,
}: OneTimeOfferBannerProps) {
  const defaultDescription = description || `Unlock ${feature} instantly without a subscription.`
  const defaultCta = ctaLabel || `Unlock for ${priceLabel}`

  return (
    <div
      className={cn(
        'mt-8 rounded-2xl border border-gold/30 bg-gradient-to-r from-gold/10 via-purple/20 to-cosmic-navy/80 p-4 md:p-6 shadow-lg shadow-black/40 flex flex-col md:flex-row md:items-center md:justify-between gap-4',
        className
      )}
    >
      <div className="flex-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-gold/40 text-xs uppercase tracking-wide text-gold mb-2">
          <Sparkles className="w-3 h-3" />
          <span>One-Time Reading</span>
        </div>
        <h3 className="text-lg md:text-xl font-heading text-gold mb-1">Unlock {feature}</h3>
        <p className="text-sm md:text-base text-white/70">{defaultDescription}</p>
      </div>
      <div className="flex flex-col items-start md:items-end gap-2">
        <div className="text-right">
          <span className="text-2xl font-heading text-gold">{priceLabel}</span>
          <span className="ml-1 text-xs text-white/60">one-time</span>
        </div>
        <Link href={ctaHref}>
          <Button className="bg-gold text-black hover:bg-gold/90 font-semibold">
            {defaultCta}
          </Button>
        </Link>
        <p className="text-[11px] text-white/50">No subscription required. Unlock instantly.</p>
      </div>
    </div>
  )
}

