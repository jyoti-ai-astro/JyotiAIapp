/**
 * Settings Page
 * 
 * Batch 4 - App Internal Screens Part 2
 * 
 * User settings and preferences
 */

'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user-store';
import DashboardPageShell from '@/src/ui/layout/DashboardPageShell';
import { Button } from '@/components/ui/button';
import { SettingsPanel } from '@/components/engines/SettingsPanel';
import Link from 'next/link';

export default function SettingsPage() {
  const router = useRouter();
  const { user, updateUser } = useUserStore();
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: true,
    soundEnabled: false,
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    async function loadSettings() {
      try {
        const response = await fetch('/api/user/get', { credentials: 'include' });
        if (!response.ok) return;
        const data = await response.json();
        if (data.user?.settings) {
          setSettings(data.user.settings);
        }
      } catch (error) {
        console.error('Load settings error:', error);
      }
    }

    loadSettings();
  }, [user, router]);

  const handleSave = async (newSettings = settings) => {
    try {
      const response = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ settings: newSettings }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to save settings');
      }
      setSettings(newSettings);
      updateUser({ settings: newSettings } as any);
    } catch (error) {
      console.error('Save settings error:', error);
      throw error;
    }
  };

  if (!user) {
    return null;
  }

  return (
    <DashboardPageShell
      title="Settings"
      subtitle="Manage your preferences and account settings"
    >

          <SettingsPanel
            initialSettings={settings}
            onSave={async (newSettings) => {
              await handleSave(newSettings);
            }}
          />

          <div className="text-center">
            <Link href="/dashboard">
              <Button variant="outline" className="min-h-11">
                Back to Dashboard
              </Button>
            </Link>
          </div>
    </DashboardPageShell>
  );
}
