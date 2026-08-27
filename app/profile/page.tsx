'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, LogOut, Save } from 'lucide-react'
import { useUserStore } from '@/store/user-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LocationAutocomplete } from '@/components/auth/LocationAutocomplete'
import Link from 'next/link'
import DashboardPageShell from '@/src/ui/layout/DashboardPageShell'
import { logoutClientSession } from '@/lib/auth/client-session'

interface ProfileData {
  name: string
  email: string
  photo: string | null
  dob: string | null
  tob: string | null
  pob: string | null
  lat?: number | null
  lng?: number | null
  timezone?: string | null
  rashi: string | null
  rashiPreferred: string | null
  rashiMoon: string | null
  rashiSun: string | null
  ascendant: string | null
  nakshatra: string | null
  onboarded: boolean
  derivedAstrologyStatus?: 'current' | 'stale'
  entitlements?: {
    hasSubscription: boolean
    subscriptionPlan: string | null
    subscriptionExpiry: string | null
    tickets: {
      aiGuruTickets: number
      kundaliTickets: number
      lifetimePredictions: number
    }
  } | null
}

interface ProfileForm {
  name: string
  dob: string
  tob: string
  pob: string
  lat: number | null
  lng: number | null
  timezone: string
}

const DEFAULT_TIMEZONE = 'Asia/Kolkata'

function normalizeProfileForm(profile: ProfileData): ProfileForm {
  return {
    name: profile.name || '',
    dob: profile.dob || '',
    tob: profile.tob || '',
    pob: profile.pob || '',
    lat: profile.lat ?? null,
    lng: profile.lng ?? null,
    timezone: profile.timezone || DEFAULT_TIMEZONE,
  }
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, updateUser } = useUserStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [form, setForm] = useState<ProfileForm | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    fetchProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, router])

  const birthDataChanged = useMemo(() => {
    if (!profile || !form) return false
    return (
      form.dob !== (profile.dob || '') ||
      form.tob !== (profile.tob || '') ||
      form.pob !== (profile.pob || '') ||
      form.lat !== (profile.lat ?? null) ||
      form.lng !== (profile.lng ?? null) ||
      form.timezone !== (profile.timezone || DEFAULT_TIMEZONE)
    )
  }, [form, profile])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/user/get', {
        credentials: 'include',
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to load profile')
      }

      const result = await response.json()
      setProfile(result.user)
      setForm(normalizeProfileForm(result.user))
    } catch (err: any) {
      console.error('Profile fetch error:', err)
      setError(err.message || 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const validate = () => {
    if (!form) return 'Profile is still loading'
    if (!form.name.trim()) return 'Name is required'
    if (form.dob && Number.isNaN(new Date(form.dob).getTime())) return 'Enter a valid birth date'
    if (form.tob && !/^\d{2}:\d{2}$/.test(form.tob)) return 'Enter birth time in HH:MM format'
    if ((form.dob || form.tob || form.pob) && (!form.dob || !form.tob || !form.pob)) {
      return 'Birth date, time, and place are required together'
    }
    return null
  }

  const handleSave = async () => {
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      setMessage(null)
      return
    }

    if (!form) return

    try {
      setSaving(true)
      setError(null)
      setMessage(null)

      const payload: Record<string, any> = {
        name: form.name.trim(),
        dob: form.dob || null,
        tob: form.tob || null,
        pob: form.pob.trim() || null,
        timezone: form.timezone || DEFAULT_TIMEZONE,
      }

      if (form.lat !== null && form.lng !== null) {
        payload.lat = form.lat
        payload.lng = form.lng
      }

      const response = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save profile')
      }

      updateUser({
        name: payload.name,
        dob: payload.dob,
        tob: payload.tob,
        pob: payload.pob,
        lat: form.lat ?? undefined,
        lng: form.lng ?? undefined,
        timezone: payload.timezone,
        derivedAstrologyStatus: data.derivedAstrologyStatus,
      } as any)

      await fetchProfile()
      setMessage(
        data.birthDataChanged
          ? 'Profile saved. Your astrology data is marked stale; regenerate Kundali before using personalized guidance.'
          : 'Profile saved.'
      )
    } catch (err: any) {
      console.error('Profile save error:', err)
      setError(err.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      setLoggingOut(true)
      await logoutClientSession()
      router.replace('/login')
      router.refresh()
    } catch (err: any) {
      console.error('Logout error:', err)
      setError(err.message || 'Failed to log out')
      setLoggingOut(false)
    }
  }

  if (loading) {
    return (
      <DashboardPageShell
        title="Account"
        subtitle="Profile, birth details, plan, and credits"
      >
        <Card>
          <CardContent className="flex min-h-48 items-center justify-center p-6">
            <div className="space-y-4 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-saffron/25 border-t-saffron" />
              <p className="text-sm text-muted-foreground">Loading profile...</p>
            </div>
          </CardContent>
        </Card>
      </DashboardPageShell>
    )
  }

  if (!profile || !form) {
    return (
      <DashboardPageShell
        title="Account"
        subtitle="Profile, birth details, plan, and credits"
      >
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-danger">{error || 'Failed to load profile'}</p>
            <Button onClick={fetchProfile} className="mt-4 min-h-11">
              Retry
            </Button>
          </CardContent>
        </Card>
      </DashboardPageShell>
    )
  }

  const entitlements = profile.entitlements
  const tickets = entitlements?.tickets

  return (
    <DashboardPageShell
      title="Account"
      subtitle="Profile, birth details, plan, and credits"
      rightActions={
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard">
            <Button variant="outline" className="min-h-11">
              Back to Dashboard
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={handleLogout}
            disabled={loggingOut}
            className="min-h-11"
          >
            <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
            {loggingOut ? 'Logging out...' : 'Logout'}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">

      {(error || message) && (
        <Card className={error ? 'border-danger/30 bg-danger/5' : 'border-success/30 bg-success/5'}>
          <CardContent className="flex items-start gap-3 pt-6">
            <AlertCircle className="mt-0.5 h-4 w-4" />
            <p className="text-sm">{error || message}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Email is managed by Firebase Auth and cannot be edited here.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={profile.email || ''} disabled />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Birth Details</CardTitle>
          <CardDescription>
            Changing birth details requires your Kundali and personalized astrology to be refreshed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dob">Birth Date</Label>
              <Input
                id="dob"
                type="date"
                value={form.dob}
                onChange={(event) => setForm({ ...form, dob: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tob">Birth Time</Label>
              <Input
                id="tob"
                type="time"
                value={form.tob}
                onChange={(event) => setForm({ ...form, tob: event.target.value })}
              />
            </div>
          </div>

          <LocationAutocomplete
            value={form.pob}
            label="Birth Location"
            onChange={(value, coordinates) =>
              setForm({
                ...form,
                pob: value,
                lat: coordinates?.lat ?? (value === profile.pob ? profile.lat ?? null : null),
                lng: coordinates?.lng ?? (value === profile.pob ? profile.lng ?? null : null),
              })
            }
          />

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input
                id="timezone"
                value={form.timezone}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label>Latitude</Label>
              <Input value={form.lat ?? ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>Longitude</Label>
              <Input value={form.lng ?? ''} disabled />
            </div>
          </div>

          {birthDataChanged && (
            <p className="rounded-xl border border-warning/25 bg-warning/10 px-4 py-3 text-sm leading-6 text-primary">
              Changing birth details requires your Kundali and personalized astrology to be refreshed before Guru, Timeline, Predictions, and Reports are current again.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Astrology State</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          <div>
            <p className="text-sm font-medium">Onboarded</p>
            <p className="text-sm">{profile.onboarded ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Derived Astrology</p>
            <p className="text-sm capitalize">{profile.derivedAstrologyStatus || 'current'}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Current Rashi</p>
            <p className="text-sm">{profile.rashi || 'Not calculated'}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Plan and Entitlements</CardTitle>
          <CardDescription>Read from the canonical server-side entitlement service.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div>
            <p className="text-sm font-medium">Plan</p>
            <p className="text-sm capitalize">
              {entitlements?.hasSubscription ? entitlements.subscriptionPlan || 'Active' : 'Free'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Guru Credits</p>
            <p className="text-sm">{entitlements?.hasSubscription ? 'Subscription access' : tickets?.aiGuruTickets ?? 0}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Kundali Credits</p>
            <p className="text-sm">{entitlements?.hasSubscription ? 'Subscription access' : tickets?.kundaliTickets ?? 0}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Predictions</p>
            <p className="text-sm">{entitlements?.hasSubscription ? 'Subscription access' : tickets?.lifetimePredictions ?? 0}</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 md:flex-row">
        <Button onClick={handleSave} disabled={saving} className="min-h-11 md:w-auto">
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Saving...' : 'Save Profile'}
        </Button>
        <Link href="/kundali">
          <Button variant="outline" className="min-h-11 w-full md:w-auto">
            Regenerate Kundali
          </Button>
        </Link>
      </div>
      </div>
    </DashboardPageShell>
  )
}
