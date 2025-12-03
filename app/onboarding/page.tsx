'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/user-store'
import { CosmicOnboarding } from '@/components/onboarding/CosmicOnboarding'

interface RashiData {
  moon: string
  sun: string
  ascendant: string
  nakshatra: string
}

export default function OnboardingPage() {
  const router = useRouter()
  const { user, updateUser } = useUserStore()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [rashiData, setRashiData] = useState<RashiData | null>(null)
  const [selectedRashi, setSelectedRashi] = useState<'moon' | 'sun' | 'ascendant'>('moon')
  
  const [formData, setFormData] = useState({
    dob: '',
    tob: '',
    pob: '',
    lat: undefined as number | undefined,
    lng: undefined as number | undefined,
  })

  // Step 1: Save birth details with geocoding
  const handleBirthDetailsSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/onboarding/birth-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          dob: formData.dob,
          tob: formData.tob,
          pob: formData.pob,
          lat: formData.lat,
          lng: formData.lng,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save birth details')
      }

      // Update local store
      updateUser({
        dob: formData.dob,
        tob: formData.tob,
        pob: formData.pob,
      })

      // Calculate Rashi and generate full kundali
      await calculateRashi()
      
      // Generate full kundali in background (non-blocking)
      fetch('/api/kundali/generate-full', {
        method: 'POST',
        credentials: 'include',
      }).catch(err => console.error('Kundali generation error:', err))
    } catch (error: any) {
      console.error('Birth details error:', error)
      alert(error.message || 'Failed to save birth details')
    } finally {
      setLoading(false)
    }
  }

  // Calculate Rashi and Nakshatra
  const calculateRashi = async () => {
    try {
      const response = await fetch('/api/onboarding/calculate-rashi', {
        method: 'POST',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to calculate Rashi')
      }

      const data = await response.json()
      setRashiData({
        moon: data.rashi.moon,
        sun: data.rashi.sun,
        ascendant: data.rashi.ascendant,
        nakshatra: data.nakshatra,
      })
      setStep(2) // Move to Rashi confirmation step
    } catch (error) {
      console.error('Rashi calculation error:', error)
      alert('Failed to calculate Rashi. Please try again.')
    }
  }

  // Step 2: Confirm Rashi selection
  const handleRashiConfirm = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/onboarding/confirm-rashi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ rashiPreferred: selectedRashi }),
      })

      if (!response.ok) {
        throw new Error('Failed to confirm Rashi')
      }

      const data = await response.json()
      updateUser({
        rashi: data.rashi,
        rashiPreferred: data.rashiPreferred,
      })

      setStep(3) // Move to numerology step
    } catch (error) {
      console.error('Rashi confirmation error:', error)
      alert('Failed to confirm Rashi. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Complete onboarding
  const handleComplete = async () => {
    setLoading(true)
    try {
      // Mark as onboarded
      const response = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ onboarded: true }),
      })

      if (!response.ok) {
        throw new Error('Failed to complete onboarding')
      }

      updateUser({ onboarded: true })

      // Generate full kundali in background
      fetch('/api/kundali/generate-full', {
        method: 'POST',
        credentials: 'include',
      })
        .then(() => {
          console.log('Kundali generated successfully')
        })
        .catch((err) => {
          console.error('Kundali generation error:', err)
          // Don't block onboarding completion if kundali generation fails
        })

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Onboarding completion error:', error)
      alert('Failed to complete onboarding. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  if (!user) {
    return null
  }

  return (
    <CosmicOnboarding
      step={step}
      formData={formData}
      setFormData={setFormData}
      rashiData={rashiData}
      selectedRashi={selectedRashi}
      setSelectedRashi={setSelectedRashi}
      onBirthDetailsSubmit={handleBirthDetailsSubmit}
      onRashiConfirm={handleRashiConfirm}
      onComplete={handleComplete}
      loading={loading}
    />
  )
}

// Legacy onboarding code below (kept for reference)
function LegacyOnboarding() {
  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-3xl font-display">Welcome to Jyoti.ai</CardTitle>
          <CardDescription>
            Let&apos;s set up your spiritual profile. This will take just a few minutes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <form onSubmit={handleBirthDetailsSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Step 1: Birth Details</h3>
                <p className="text-sm text-muted-foreground">
                  Enter your birth details to calculate your astrological profile.
                </p>
                <div>
                  <label className="mb-2 block text-sm font-medium">Date of Birth</label>
                  <Input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    required
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Time of Birth</label>
                  <Input
                    type="time"
                    value={formData.tob}
                    onChange={(e) => setFormData({ ...formData, tob: e.target.value })}
                    required
                  />
                  <p className="mt-1 text-xs text-muted-foreground">Use 24-hour format (e.g., 14:30)</p>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Place of Birth</label>
                  <Input
                    type="text"
                    placeholder="e.g., Delhi, India"
                    value={formData.pob}
                    onChange={(e) => setFormData({ ...formData, pob: e.target.value })}
                    required
                  />
                  <p className="mt-1 text-xs text-muted-foreground">City and country for accurate calculations</p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Processing...' : 'Calculate Rashi'}
                </Button>
              </div>
            </form>
          )}

          {step === 2 && rashiData && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Step 2: Confirm Your Rashi</h3>
                <p className="text-sm text-muted-foreground">
                  Based on your birth details, we&apos;ve calculated your Rashi. Please select which one you follow.
                </p>
                
                <div className="space-y-3 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Moon Sign (Chandra Rashi)</p>
                      <p className="text-sm text-muted-foreground">Most common in India</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-mystic">{rashiData.moon}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Sun Sign</p>
                      <p className="text-sm text-muted-foreground">Western astrology</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{rashiData.sun}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Ascendant (Lagna)</p>
                      <p className="text-sm text-muted-foreground">Rising sign</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{rashiData.ascendant}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Which Rashi do you prefer?</p>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="rashi"
                        value="moon"
                        checked={selectedRashi === 'moon'}
                        onChange={() => setSelectedRashi('moon')}
                        className="text-mystic"
                      />
                      <span>Moon Sign ({rashiData.moon}) - Recommended</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="rashi"
                        value="sun"
                        checked={selectedRashi === 'sun'}
                        onChange={() => setSelectedRashi('sun')}
                        className="text-mystic"
                      />
                      <span>Sun Sign ({rashiData.sun})</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="rashi"
                        value="ascendant"
                        checked={selectedRashi === 'ascendant'}
                        onChange={() => setSelectedRashi('ascendant')}
                        className="text-mystic"
                      />
                      <span>Ascendant ({rashiData.ascendant})</span>
                    </label>
                  </div>
                </div>

                <div className="rounded-lg bg-muted p-3">
                  <p className="text-sm">
                    <strong>Nakshatra:</strong> {rashiData.nakshatra}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  Previous
                </Button>
                <Button onClick={handleRashiConfirm} disabled={loading}>
                  {loading ? 'Confirming...' : 'Confirm & Continue'}
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Step 3: Numerology</h3>
                <p className="text-muted-foreground">
                  Your numerology profile will be calculated automatically based on your name and
                  birth date. This happens in the background.
                </p>
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm">
                    Numerology calculations are based on your name and birth date. 
                    You can view your numerology profile in the dashboard after completing onboarding.
                  </p>
                </div>
              </div>
              
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setStep(2)}>
                  Previous
                </Button>
                <Button onClick={handleComplete} disabled={loading}>
                  {loading ? 'Completing...' : 'Complete Setup'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


