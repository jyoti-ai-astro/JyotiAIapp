/**
 * Settings Panel Component
 * 
 * Batch 4 - Intelligence Engines
 * 
 * User settings and preferences
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings, Save } from 'lucide-react';

interface SettingsPanelProps {
  initialSettings?: {
    notifications?: boolean;
    emailUpdates?: boolean;
    soundEnabled?: boolean;
  };
  onSave?: (settings: any) => Promise<void>;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  initialSettings,
  onSave,
}) => {
  const [settings, setSettings] = useState({
    notifications: initialSettings?.notifications ?? true,
    emailUpdates: initialSettings?.emailUpdates ?? true,
    soundEnabled: initialSettings?.soundEnabled ?? false,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setSettings({
      notifications: initialSettings?.notifications ?? true,
      emailUpdates: initialSettings?.emailUpdates ?? true,
      soundEnabled: initialSettings?.soundEnabled ?? false,
    });
  }, [initialSettings]);

  const handleSave = async () => {
    try {
      setLoading(true);
      setMessage(null);
      setErrorMessage(null);
      if (onSave) {
        await onSave(settings);
      } else {
        // Default save logic
        const response = await fetch('/api/user/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ settings }),
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to save settings');
        }
      }
      setMessage('Settings saved.');
    } catch (error: any) {
      console.error('Save settings error:', error);
      setErrorMessage(error?.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden border-border bg-card shadow-sm">
      <CardHeader className="border-b border-border bg-surface-raised">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-saffron/25 bg-saffron/10 text-saffron">
            <Settings className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <CardTitle className="font-heading text-2xl text-primary">
              Preferences
            </CardTitle>
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

        <div className="divide-y divide-border rounded-xl border border-border bg-surface-raised">
          <div className="flex min-h-20 items-center justify-between gap-4 p-4">
            <div className="min-w-0">
              <Label htmlFor="notifications" className="font-medium text-primary">
                Push Notifications
              </Label>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Receive notifications on your device.
              </p>
            </div>
            <Switch
              id="notifications"
              checked={settings.notifications}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, notifications: checked })
              }
            />
          </div>

          <div className="flex min-h-20 items-center justify-between gap-4 p-4">
            <div className="min-w-0">
              <Label htmlFor="emailUpdates" className="font-medium text-primary">
                Email Updates
              </Label>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Receive email updates and newsletters.
              </p>
            </div>
            <Switch
              id="emailUpdates"
              checked={settings.emailUpdates}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, emailUpdates: checked })
              }
            />
          </div>

          <div className="flex min-h-20 items-center justify-between gap-4 p-4">
            <div className="min-w-0">
              <Label htmlFor="soundEnabled" className="font-medium text-primary">
                Sound Effects
              </Label>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Enable sound effects and ambient sounds.
              </p>
            </div>
            <Switch
              id="soundEnabled"
              checked={settings.soundEnabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, soundEnabled: checked })
              }
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={loading}
            className="min-h-11 w-full sm:w-auto"
          >
            <Save className="mr-2 h-4 w-4" aria-hidden="true" />
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
};
