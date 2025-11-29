'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/user-store'
import { usePalmistry } from '@/lib/hooks/usePalmistry'
import { CosmicPalmistry } from '@/components/palmistry/CosmicPalmistry'
import { OneTimeOfferBanner } from '@/components/paywall/OneTimeOfferBanner'
import { checkFeatureAccess } from '@/lib/access/checkFeatureAccess'
import { decrementTicket } from '@/lib/access/ticket-access'
import type { AstroContext } from '@/lib/engines/astro-types'

export default function PalmistryPage() {
  const router = useRouter()
  const { user } = useUserStore()
  const { analysis, loading: analyzing, error, analyze } = usePalmistry()
  const [leftPalmFile, setLeftPalmFile] = useState<File | null>(null)
  const [rightPalmFile, setRightPalmFile] = useState<File | null>(null)
  const [leftPalmPreview, setLeftPalmPreview] = useState<string | null>(null)
  const [rightPalmPreview, setRightPalmPreview] = useState<string | null>(null)
  const [astro, setAstro] = useState<AstroContext | null>(null)

  const handleFileSelect = (file: File | null, side: 'left' | 'right') => {
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      return
    }

    if (side === 'left') {
      setLeftPalmFile(file)
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setLeftPalmPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setRightPalmFile(file)
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setRightPalmPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = async () => {
    if (!leftPalmFile || !rightPalmFile || !leftPalmPreview || !rightPalmPreview) {
      alert('Please select both left and right palm images')
      return
    }

    // Check access before analyzing
    const access = await checkFeatureAccess(user, 'palmistry')
    if (!access.allowed) {
      if (access.redirect || access.redirectTo) {
        router.push(access.redirect || access.redirectTo || '/pay/199')
      }
      return
    }

    if (access.decrementTicket) {
      await decrementTicket('kundali_basic')
    }

    await analyze(leftPalmPreview, rightPalmPreview)
  }

  useEffect(() => {
    if (!user) {
      router.push('/login')
    } else {
      fetchAstroContext()
    }
  }, [user, router])

  const fetchAstroContext = async () => {
    if (!user?.uid) return
    try {
      const response = await fetch('/api/astro/context', {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setAstro(data.astro)
      }
    } catch (err) {
      console.error('Error fetching astro context:', err)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Context Panel */}
      <div className="mb-8">
        <OneTimeOfferBanner
          title="Unlock Full Insights"
          description="This module uses your birth chart & predictions powered by Guru Brain."
          priceLabel="₹199"
          ctaLabel="Unlock Now"
          ctaHref="/pay/199"
        />
      </div>

      {/* Astro Summary Block */}
      {astro && (
        <div className="glass-card p-6 mb-10 rounded-2xl border border-gold/20">
          <h3 className="text-gold font-heading text-xl mb-2">Astro Summary</h3>
          <p className="text-white/80 text-sm">Sun Sign: {astro.coreChart?.sunSign || 'N/A'}</p>
          <p className="text-white/80 text-sm">Moon Sign: {astro.coreChart?.moonSign || 'N/A'}</p>
          <p className="text-white/80 text-sm">Ascendant: {astro.coreChart?.ascendantSign || 'N/A'}</p>
          <p className="text-white/80 text-sm mt-4">Next Major Dasha: {astro.dasha?.currentMahadasha?.planet || 'N/A'}</p>
        </div>
      )}
      <CosmicPalmistry
        leftPalmFile={leftPalmFile}
        rightPalmFile={rightPalmFile}
        leftPalmPreview={leftPalmPreview}
        rightPalmPreview={rightPalmPreview}
        onFileSelect={handleFileSelect}
        onUpload={handleUpload}
        uploading={false}
        analyzing={analyzing}
        analysis={analysis}
      />

      {/* Ask Guru With Context Button */}
      {astro && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => router.push(`/guru?context=${encodeURIComponent(JSON.stringify(astro))}`)}
            className="gold-btn"
          >
            Ask Guru With My Birth Context
          </button>
        </div>
      )}
    </div>
  )
}

