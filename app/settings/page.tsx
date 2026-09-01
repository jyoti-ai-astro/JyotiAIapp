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
import { LoadingState } from '@/components/ui/feedback-state'
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Bell,
  CreditCard,
  HelpCircle,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { SettingsPanel } from '@/components/engines/SettingsPanel';
import Link from 'next/link';
import {
  authenticatedJsonRead,
  invalidateAuthenticatedRead,
} from '@/lib/client/authenticated-read';

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
        const data = await authenticatedJsonRead<any>('/api/user/get');
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
      invalidateAuthenticatedRead('/api/user/get');
      setSettings(newSettings);
      updateUser({ settings: newSettings } as any);
    } catch (error) {
      console.error('Save settings error:', error);
      throw error;
    }
  };

  if (!user) {
    return (
      <DashboardPageShell
        title="Settings"
        subtitle="Restoring your JyotiAI session."
      >
        <div className="rounded-xl border border-border bg-card p-6">
          <LoadingState
            title="Opening Settings"
            description="Restoring your account preferences."
          />
        </div>
      </DashboardPageShell>
    );
  }

  return (
    <DashboardPageShell
      title="Settings"
      subtitle="Manage your preferences and account settings"
    >

      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[
            {
              href: '/profile',
              title: 'Profile & birth details',
              description: 'Identity, verified birth data, location and astrology profile.',
              icon: UserRound,
            },
            {
              href: '/notifications',
              title: 'Notifications',
              description: 'Review JyotiAI alerts, updates and notification history.',
              icon: Bell,
            },
            {
              href: '/payments',
              title: 'Plan & payments',
              description: 'Subscription, reading access and payment status.',
              icon: CreditCard,
            },
            {
              href: '/legal/privacy',
              title: 'Privacy & data',
              description: 'Review how JyotiAI handles account and personal data.',
              icon: ShieldCheck,
            },
            {
              href: '/legal/security',
              title: 'Security',
              description: 'Review account security and safe account practices.',
              icon: LockKeyhole,
            },
            {
              href: '/support',
              title: 'Help & support',
              description: 'Get help with your account, reports, access or experience.',
              icon: HelpCircle,
            },
          ].map(({ href, title, description, icon: Icon }) => (
            <Link key={href} href={href} className="group block">
              <Card className="h-full transition hover:border-saffron/35">
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full border border-saffron/20 bg-saffron/10 text-saffron">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-lg">{title}</CardTitle>
                  <CardDescription className="leading-6">
                    {description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>

        <SettingsPanel
          initialSettings={settings}
          onSave={async (newSettings) => {
            await handleSave(newSettings);
          }}
        />
      </div>
    </DashboardPageShell>
  );
}
