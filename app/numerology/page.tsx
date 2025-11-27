'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/user-store'
import { CosmicNumerology } from '@/components/numerology/CosmicNumerology'
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
  }, [user, router])

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
    <CosmicNumerology
      formData={formData}
      setFormData={setFormData}
      onSubmit={handleSubmit}
      calculating={calculating}
      profile={profile}
    />
  )
}

