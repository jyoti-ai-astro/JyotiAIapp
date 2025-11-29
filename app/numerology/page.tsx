'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/user-store'
import { CosmicNumerology } from '@/components/numerology/CosmicNumerology'
import { OneTimeOfferBanner } from '@/components/paywall/OneTimeOfferBanner'
import { checkFeatureAccess } from '@/lib/access/checkFeatureAccess'
import { decrementTicket } from '@/lib/access/ticket-access'
import type { AstroContext } from '@/lib/engines/astro-types'
import type { NumerologyProfile } from '@/lib/engines/numerology/calculator'

export default function NumerologyPage() {
  const router = useRouter()
  const { user } = useUserStore()
  const [loading, setLoading] = useState(false)
  const [calculating, setCalculating] = useState(false)
  const [profile, setProfile] = useState<NumerologyProfile | null>(null)
  
  const [formData, setFormData] = useState({
    fullName: '',
    birthDate: '',
    mobileNumber: '',
    vehicleNumber: '',
    houseNumber: '',
  })
  const [astro, setAstro] = useState<AstroContext | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    // Pre-fill with user data
    if (user.name) {
      setFormData((prev) => ({ ...prev, fullName: user.name }))
    }
    if (user.dob) {
      setFormData((prev) => ({ ...prev, birthDate: user.dob || '' }))
    }

    // Load existing numerology
    loadNumerology()
    fetchAstroContext()
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

  const loadNumerology = async () => {
    try {
      const response = await fetch('/api/numerology/user', {
        credentials: 'include',
      })

      if (response.ok) {
        const result = await response.json()
        if (result.numerology) {
          setProfile(result.numerology)
        }
      }
    } catch (error) {
      console.error('Load numerology error:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCalculating(true)

    // Check access before calculating
    const access = await checkFeatureAccess(user, 'numerology')
    if (!access.allowed) {
      if (access.redirect || access.redirectTo) {
        router.push(access.redirect || access.redirectTo || '/pay/199')
      }
      setCalculating(false)
      return
    }

    if (access.decrementTicket) {
      await decrementTicket('kundali_basic')
    }

    try {
      const response = await fetch('/api/numerology/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          fullName: formData.fullName,
          birthDate: formData.birthDate,
          mobileNumber: formData.mobileNumber || undefined,
          vehicleNumber: formData.vehicleNumber || undefined,
          houseNumber: formData.houseNumber || undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to calculate numerology')
      }

      const result = await response.json()
      setProfile(result.profile)
    } catch (error: any) {
      console.error('Numerology calculation error:', error)
      alert(error.message || 'Failed to calculate numerology')
    } finally {
      setCalculating(false)
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
      <CosmicNumerology
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        calculating={calculating}
        profile={profile}
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

