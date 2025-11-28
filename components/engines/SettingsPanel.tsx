/**
 * Settings Panel Component
 * 
 * Batch 4 - Intelligence Engines
 * 
 * User settings and preferences
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
    soundEnabled: initialSettings?.soundEnabled ?? true,
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      if (onSave) {
        await onSave(settings);
      } else {
        // Default save logic
        await fetch('/api/user/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ settings }),
        });
      }
      alert('Settings saved successfully');
    } catch (error) {
      console.error('Save settings error:', error);
      alert('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const createRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.className = 'absolute rounded-full bg-gold/30 animate-ping pointer-events-none';
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  };

  return (
    <Card className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30 text-white shadow-cosmic-glow">
      <CardHeader>
        <CardTitle className="text-2xl font-display text-aura-cyan flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Preferences
        </CardTitle>
        <CardDescription className="text-white/70">Customize your experience</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-white/80">Push Notifications</Label>
            <p className="text-sm text-white/60">Receive notifications on your device</p>
          </div>
          <Switch
            checked={settings.notifications}
            onCheckedChange={(checked) => setSettings({ ...settings, notifications: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-white/80">Email Updates</Label>
            <p className="text-sm text-white/60">Receive email updates and newsletters</p>
          </div>
          <Switch
            checked={settings.emailUpdates}
            onCheckedChange={(checked) => setSettings({ ...settings, emailUpdates: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-white/80">Sound Effects</Label>
            <p className="text-sm text-white/60">Enable sound effects and ambient sounds</p>
          </div>
          <Switch
            checked={settings.soundEnabled}
            onCheckedChange={(checked) => setSettings({ ...settings, soundEnabled: checked })}
          />
        </div>

        <Button
          onClick={(e) => {
            createRipple(e);
            handleSave();
          }}
          disabled={loading}
          className="w-full spiritual-gradient relative overflow-hidden"
        >
          <Save className="inline-block mr-2 h-4 w-4" />
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </CardContent>
    </Card>
  );
};

