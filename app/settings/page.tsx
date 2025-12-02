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
import { motion } from 'framer-motion';
import DashboardPageShell from '@/src/ui/layout/DashboardPageShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Save } from 'lucide-react';
import { SettingsPanel } from '@/components/engines/SettingsPanel';
import Link from 'next/link';

export default function SettingsPage() {
  const router = useRouter();
  const { user, updateUser } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: true,
    soundEnabled: true,
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleSave = async () => {
    try {
      setLoading(true);
      // Save settings to API
      await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ settings }),
      });
      alert('Settings saved successfully');
    } catch (error) {
      console.error('Save settings error:', error);
      alert('Failed to save settings');
    } finally {
      setLoading(false);
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
              setLoading(true);
              await handleSave();
              setSettings(newSettings);
            }}
          />

          <div className="text-center">
            <Link href="/dashboard">
              <Button variant="outline" className="border-cosmic-purple/50 text-white/80 hover:bg-cosmic-purple/20">
                Back to Dashboard
              </Button>
            </Link>
          </div>
    </DashboardPageShell>
  );
}

