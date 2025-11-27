'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/user-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-display font-bold">Numerology</h1>
        <Link href="/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle>Calculate Your Numerology</CardTitle>
          <CardDescription>
            Enter your details to discover your numerology profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Full Name</label>
              <Input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Date of Birth</label>
              <Input
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Mobile Number (Optional)</label>
              <Input
                type="text"
                value={formData.mobileNumber}
                onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                placeholder="e.g., +91 9876543210"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Vehicle Number (Optional)</label>
              <Input
                type="text"
                value={formData.vehicleNumber}
                onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                placeholder="e.g., DL 01 AB 1234"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">House Number (Optional)</label>
              <Input
                type="text"
                value={formData.houseNumber}
                onChange={(e) => setFormData({ ...formData, houseNumber: e.target.value })}
                placeholder="e.g., 123 or A-45"
              />
            </div>
            <Button type="submit" disabled={calculating} className="w-full">
              {calculating ? 'Calculating...' : 'Calculate Numerology'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {profile && (
        <div className="space-y-4">
          {/* Core Numbers */}
          <Card>
            <CardHeader>
              <CardTitle>Your Core Numbers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg border p-4">
                  <p className="text-sm font-medium text-muted-foreground">Life Path Number</p>
                  <p className="text-3xl font-bold text-mystic">{profile.lifePathNumber}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm font-medium text-muted-foreground">Destiny Number</p>
                  <p className="text-3xl font-bold text-mystic">{profile.destinyNumber}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm font-medium text-muted-foreground">Expression Number</p>
                  <p className="text-3xl font-bold text-mystic">{profile.expressionNumber}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm font-medium text-muted-foreground">Soul Urge Number</p>
                  <p className="text-3xl font-bold text-mystic">{profile.soulUrgeNumber}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm font-medium text-muted-foreground">Personality Number</p>
                  <p className="text-3xl font-bold text-mystic">{profile.personalityNumber}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm font-medium text-muted-foreground">Birthday Number</p>
                  <p className="text-3xl font-bold text-mystic">{profile.birthdayNumber}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mobile Number Analysis */}
          {profile.mobileNumber && (
            <Card>
              <CardHeader>
                <CardTitle>Mobile Number Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Number</p>
                  <p className="text-sm">{profile.mobileNumber.number}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Single Digit</p>
                  <p className="text-lg font-semibold text-mystic">
                    {profile.mobileNumber.singleDigit}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Lucky</p>
                  <p className="text-sm">
                    {profile.mobileNumber.isLucky ? (
                      <span className="text-green-600">Yes</span>
                    ) : (
                      <span className="text-muted-foreground">No</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Compatibility</p>
                  <p className="text-sm text-muted-foreground">
                    {profile.mobileNumber.compatibility}
                  </p>
                </div>
                {profile.mobileNumber.recommendations.length > 0 && (
                  <div>
                    <p className="text-sm font-medium">Recommendations</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {profile.mobileNumber.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Vehicle Number Analysis */}
          {profile.vehicleNumber && (
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Number Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Number</p>
                  <p className="text-sm">{profile.vehicleNumber.number}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Single Digit</p>
                  <p className="text-lg font-semibold text-mystic">
                    {profile.vehicleNumber.singleDigit}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Compatibility</p>
                  <p className="text-sm text-muted-foreground">
                    {profile.vehicleNumber.compatibility}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Safety</p>
                  <p className="text-sm text-muted-foreground">{profile.vehicleNumber.safety}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* House Number Analysis */}
          {profile.houseNumber && (
            <Card>
              <CardHeader>
                <CardTitle>House Number Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Number</p>
                  <p className="text-sm">{profile.houseNumber.number}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Single Digit</p>
                  <p className="text-lg font-semibold text-mystic">
                    {profile.houseNumber.singleDigit}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Vastu Compatibility</p>
                  <p className="text-sm text-muted-foreground">
                    {profile.houseNumber.vastuCompatibility}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Energy</p>
                  <p className="text-sm text-muted-foreground">{profile.houseNumber.energy}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Compatibility */}
          {profile.compatibility && (
            <Card>
              <CardHeader>
                <CardTitle>Compatibility Numbers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium mb-2">Best Numbers</p>
                    <div className="flex gap-2">
                      {profile.compatibility.bestNumbers.map((num) => (
                        <span
                          key={num}
                          className="rounded-full bg-mystic/10 px-3 py-1 text-sm font-semibold text-mystic"
                        >
                          {num}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Challenging Numbers</p>
                    <div className="flex gap-2">
                      {profile.compatibility.challengingNumbers.map((num) => (
                        <span
                          key={num}
                          className="rounded-full bg-destructive/10 px-3 py-1 text-sm font-semibold text-destructive"
                        >
                          {num}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

