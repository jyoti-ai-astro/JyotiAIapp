'use client'

/**
 * System Settings Panel Page
 * Milestone 10 - Step 12
 */

'use client';
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Settings {
  aiProvider: string
  embeddingProvider: string
  betaMode: boolean
  guruUsageLimit: number
  dailyHoroscopeTime: string
  maintenanceMode: boolean
}

interface Staff {
  uid: string
  email: string
  name: string
  role: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(false)
  const [newStaff, setNewStaff] = useState({
    email: '',
    name: '',
    role: '',
  })

  useEffect(() => {
    fetchSettings()
    fetchStaff()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/settings')
      const data = await response.json()

      if (data.success) {
        setSettings(data.settings)
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStaff = async () => {
    try {
      const response = await fetch('/api/admin/settings/staff')
      const data = await response.json()

      if (data.success) {
        setStaff(data.staff)
      }
    } catch (error) {
      console.error('Failed to fetch staff:', error)
    }
  }

  const handleSaveSettings = async () => {
    if (!settings) return

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      const data = await response.json()
      if (data.success) {
        alert('Settings saved successfully')
      }
    } catch (error) {
      console.error('Save failed:', error)
    }
  }

  const handleCreateStaff = async () => {
    if (!newStaff.email || !newStaff.name || !newStaff.role) {
      alert('Please fill all fields')
      return
    }

    try {
      const response = await fetch('/api/admin/settings/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStaff),
      })

      const data = await response.json()
      if (data.success) {
        alert('Staff account created successfully')
        setNewStaff({ email: '', name: '', role: '' })
        fetchStaff()
      }
    } catch (error) {
      console.error('Create staff failed:', error)
    }
  }

  if (loading || !settings) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Settings</h1>
        <p className="text-muted-foreground">Configure system-wide settings</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="ai">AI Providers</TabsTrigger>
          <TabsTrigger value="limits">Usage Limits</TabsTrigger>
          <TabsTrigger value="staff">Staff Accounts</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.betaMode}
                  onChange={(e) => setSettings({ ...settings, betaMode: e.target.checked })}
                />
                <label>Beta Mode</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                />
                <label>Maintenance Mode</label>
              </div>
              <div>
                <label className="text-sm font-medium">Daily Horoscope Time</label>
                <Input
                  type="time"
                  value={settings.dailyHoroscopeTime}
                  onChange={(e) => setSettings({ ...settings, dailyHoroscopeTime: e.target.value })}
                />
              </div>
              <Button onClick={handleSaveSettings}>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle>AI Provider Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">AI Provider</label>
                <Select
                  value={settings.aiProvider}
                  onValueChange={(value) => setSettings({ ...settings, aiProvider: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="gemini">Gemini</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Embedding Provider</label>
                <Select
                  value={settings.embeddingProvider}
                  onValueChange={(value) => setSettings({ ...settings, embeddingProvider: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="gemini">Gemini</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSaveSettings}>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="limits">
          <Card>
            <CardHeader>
              <CardTitle>Usage Limits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Guru Usage Limit (per 15 min)</label>
                <Input
                  type="number"
                  value={settings.guruUsageLimit}
                  onChange={(e) => setSettings({ ...settings, guruUsageLimit: parseInt(e.target.value) })}
                />
              </div>
              <Button onClick={handleSaveSettings}>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff">
          <Card>
            <CardHeader>
              <CardTitle>Staff Accounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Email"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                />
                <Input
                  placeholder="Name"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                />
                <Select value={newStaff.role} onValueChange={(value) => setNewStaff({ ...newStaff, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SuperAdmin">SuperAdmin</SelectItem>
                    <SelectItem value="Astrologer">Astrologer</SelectItem>
                    <SelectItem value="Support">Support</SelectItem>
                    <SelectItem value="ContentManager">ContentManager</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleCreateStaff}>Create Staff Account</Button>
              </div>

              <div className="mt-6 space-y-2">
                {staff.map((s) => (
                  <div key={s.uid} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-sm text-muted-foreground">{s.email} | {s.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

