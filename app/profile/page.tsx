'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/user-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

interface ProfileData {
  name: string
  email: string
  photo: string | null
  dob: string | null
  tob: string | null
  pob: string | null
  rashi: string | null
  rashiPreferred: string | null
  rashiMoon: string | null
  rashiSun: string | null
  ascendant: string | null
  nakshatra: string | null
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, updateUser } = useUserStore()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [regenerating, setRegenerating] = useState(false)
  const [selectedRashi, setSelectedRashi] = useState<string>('')

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    fetchProfile()
  }, [user, router])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/get', {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to load profile')
      }

      const result = await response.json()
      setProfile(result.user)
      setSelectedRashi(result.user.rashiPreferred || 'moon')
    } catch (err: any) {
      console.error('Profile fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRegenerateKundali = async () => {
    try {
      setRegenerating(true)
      const response = await fetch('/api/kundali/refresh', {
        method: 'POST',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to regenerate kundali')
      }

      alert('Kundali regenerated successfully!')
      router.push('/kundali')
    } catch (err: any) {
      console.error('Regenerate error:', err)
      alert(err.message || 'Failed to regenerate kundali')
    } finally {
      setRegenerating(false)
    }
  }

  const handleRashiChange = async (rashiPreferred: string) => {
    try {
      setSelectedRashi(rashiPreferred)
      const response = await fetch('/api/onboarding/confirm-rashi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ rashiPreferred }),
      })

      if (!response.ok) {
        throw new Error('Failed to update Rashi')
      }

      await fetchProfile()
    } catch (err: any) {
      console.error('Rashi update error:', err)
      alert(err.message || 'Failed to update Rashi')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-mystic border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-destructive">Failed to load profile</p>
            <Button onClick={fetchProfile} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-display font-bold">Your Profile</h1>
        <Link href="/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            {profile.photo && (
              <img src={profile.photo} alt={profile.name} className="h-20 w-20 rounded-full" />
            )}
            <div>
              <p className="text-xl font-semibold">{profile.name}</p>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Birth Details */}
      <Card>
        <CardHeader>
          <CardTitle>Birth Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium">Date of Birth</p>
              <p className="text-sm">
                {profile.dob ? new Date(profile.dob).toLocaleDateString() : 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Time of Birth</p>
              <p className="text-sm">{profile.tob || 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Place of Birth</p>
              <p className="text-sm">{profile.pob || 'Not set'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Astrological Details */}
      <Card>
        <CardHeader>
          <CardTitle>Astrological Details</CardTitle>
          <CardDescription>Your calculated Rashi and Nakshatra</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium mb-2">Preferred Rashi</p>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="rashi"
                    value="moon"
                    checked={selectedRashi === 'moon'}
                    onChange={() => handleRashiChange('moon')}
                    className="text-mystic"
                  />
                  <span>Moon Sign ({profile.rashiMoon || 'N/A'})</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="rashi"
                    value="sun"
                    checked={selectedRashi === 'sun'}
                    onChange={() => handleRashiChange('sun')}
                    className="text-mystic"
                  />
                  <span>Sun Sign ({profile.rashiSun || 'N/A'})</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="rashi"
                    value="ascendant"
                    checked={selectedRashi === 'ascendant'}
                    onChange={() => handleRashiChange('ascendant')}
                    className="text-mystic"
                  />
                  <span>Ascendant ({profile.ascendant || 'N/A'})</span>
                </label>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">Current Rashi</p>
              <p className="text-lg font-semibold text-mystic">{profile.rashi || 'Not calculated'}</p>
              <p className="text-sm font-medium mt-4">Nakshatra</p>
              <p className="text-lg font-semibold">{profile.nakshatra || 'Not calculated'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleRegenerateKundali}
            disabled={regenerating}
            className="w-full"
          >
            {regenerating ? 'Regenerating...' : 'Regenerate Kundali'}
          </Button>
          <p className="text-xs text-muted-foreground">
            Regenerate your kundali if you've updated your birth details.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

