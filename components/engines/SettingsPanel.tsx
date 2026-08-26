/**
 * Settings Panel Component
 *
 * User settings and preferences.
 */

'use client'

import React, { useEffect, useState } from 'react'
import { Bell, Mail, Save, Settings, Volume2 } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface SettingsPanelProps {
  initialSettings?: {
    notifications?: boolean
    emailUpdates?: boolean
    soundEnabled?: boolean
  }
  onSave?: (settings: any) => Promise<void>
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  initialSettings,
  onSave,
}) => {
  const [settings, setSettings] = useState({
    notifications: initialSettings?.notifications ?? true,
    emailUpdates: initialSettings?.emailUpdates ?? true,
    soundEnabled: initialSettings?.soundEnabled ?? false,
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    setSettings({
      notifications: initialSettings?.notifications ?? true,
      emailUpdates: initialSettings?.emailUpdates ?? true,
      soundEnabled: initialSettings?.soundEnabled ?? false,
    })
  }, [initialSettings])

  const handleSave = async () => {
    try {
      setLoading(true)
      setMessage(null)
      setErrorMessage(null)

      if (onSave) {
        await onSave(settings)
      } else {
        const response = await fetch('/api/user/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ settings }),
        })

        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(data.error || 'Failed to save settings')
        }
      }

      setMessage('Settings saved.')
    } catch (error: any) {
      console.error('Save settings error:', error)
      setErrorMessage(error?.message || 'Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  const rows = [
    {
      id: 'notifications',
      label: 'Push Notifications',
      description: 'Receive important JyotiAI updates on your device.',
      icon: Bell,
      checked: settings.notifications,
      onCheckedChange: (checked: boolean) =>
        setSettings((current) => ({ ...current, notifications: checked })),
    },
    {
      id: 'emailUpdates',
      label: 'Email Updates',
      description: 'Receive product updates and relevant JyotiAI communication by email.',
      icon: Mail,
      checked: settings.emailUpdates,
      onCheckedChange: (checked: boolean) =>
        setSettings((current) => ({ ...current, emailUpdates: checked })),
    },
    {
      id: 'soundEnabled',
      label: 'Sound Effects',
      description: 'Enable interface sound effects and supported ambient audio.',
      icon: Volume2,
      checked: settings.soundEnabled,
      onCheckedChange: (checked: boolean) =>
        setSettings((current) => ({ ...current, soundEnabled: checked })),
    },
  ]

  return (
    <Card className="overflow-hidden border-border bg-card shadow-[0_16px_44px_rgba(0,0,0,0.18)]">
      <CardHeader className="border-b border-border bg-surface-raised">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-saffron/25 bg-saffron/10 text-saffron">
            <Settings className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <CardTitle className="font-heading text-2xl text-primary">Preferences</CardTitle>
            <CardDescription className="mt-1">
              Choose how JyotiAI communicates with you and behaves on this device.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-5 md:p-6">
        {(message || errorMessage) && (
          <div
            role={errorMessage ? 'alert' : 'status'}
            className={
              errorMessage
                ? 'rounded-xl border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-primary'
                : 'rounded-xl border border-success/25 bg-success/10 px-4 py-3 text-sm text-primary'
            }
          >
            {errorMessage || message}
          </div>
        )}

        <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface-raised">
          {rows.map(({ id, label, description, icon: Icon, checked, onCheckedChange }) => (
            <div
              key={id}
              className="flex min-h-24 items-center justify-between gap-4 p-4 md:p-5"
            >
              <div className="flex min-w-0 items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-saffron">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <Label htmlFor={id} className="font-medium text-primary">
                    {label}
                  </Label>
                  <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
                    {description}
                  </p>
                </div>
              </div>

              <Switch
                id={id}
                checked={checked}
                onCheckedChange={onCheckedChange}
              />
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-muted-foreground">
            Changes take effect after you save them.
          </p>

          <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto">
            <Save className="h-4 w-4" aria-hidden="true" />
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
