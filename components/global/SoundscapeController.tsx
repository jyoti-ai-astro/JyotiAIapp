/**
 * Soundscape Controller Component
 * 
 * Batch 1 - Core Landing & Marketing
 * 
 * Ambient cosmic hum with volume slider and mute toggle
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SoundscapeController() {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [audioStarted, setAudioStarted] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const settingsRef = useRef({
    notifications: true,
    emailUpdates: true,
    soundEnabled: false,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadSoundPreference() {
      try {
        const response = await fetch('/api/user/get', { credentials: 'include' });
        if (!response.ok) return;
        const data = await response.json();
        if (!cancelled) {
          const settings = {
            notifications: data.user?.settings?.notifications ?? true,
            emailUpdates: data.user?.settings?.emailUpdates ?? true,
            soundEnabled: Boolean(data.user?.settings?.soundEnabled),
          };
          settingsRef.current = settings;
          setSoundEnabled(settings.soundEnabled);
        }
      } catch {
        // Anonymous and offline sessions keep launch audio off by default.
      }
    }

    loadSoundPreference();

    return () => {
      cancelled = true;
      stopAudio(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = soundEnabled ? volume : 0;
    }
  }, [soundEnabled, volume]);

  const persistSoundPreference = async (enabled: boolean) => {
    settingsRef.current = {
      ...settingsRef.current,
      soundEnabled: enabled,
    };

    try {
      await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          settings: settingsRef.current,
        }),
      });
    } catch {
      // Preference persistence is best-effort for unauthenticated pages.
    }
  };

  const stopAudio = (updateState = true) => {
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
      } catch {
        // Already stopped.
      }
      oscillatorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    gainNodeRef.current = null;
    if (updateState) {
      setAudioStarted(false);
    }
  };

  const startAudio = async () => {
    if (typeof window === 'undefined') return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;

      const gainNode = ctx.createGain();
      gainNodeRef.current = gainNode;
      gainNode.connect(ctx.destination);
      gainNode.gain.value = volume;

      const oscillator = ctx.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.value = 60;
      oscillator.connect(gainNode);
      oscillator.start();
      oscillatorRef.current = oscillator;

      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      setAudioStarted(true);
      setSoundEnabled(true);
      await persistSoundPreference(true);
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
      stopAudio();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (soundEnabled && gainNodeRef.current) {
      gainNodeRef.current.gain.value = newVolume;
    }
  };

  const toggleMute = () => {
    if (audioStarted && soundEnabled) {
      stopAudio();
      setSoundEnabled(false);
      void persistSoundPreference(false);
      return;
    }

    void startAudio();
  };

  const isMuted = !audioStarted || !soundEnabled;

  return (
    <div className="fixed bottom-4 left-4 z-[9998] flex items-center gap-2">
      {/* Volume Slider */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
        className="flex items-center gap-2 bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30 rounded-lg px-3 py-2"
      >
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="w-24 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-gold"
        />
        <span className="text-white/70 text-xs w-8">{Math.round(volume * 100)}%</span>
      </motion.div>

      {/* Mute Toggle */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2 }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMute}
          className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30 text-gold hover:bg-cosmic-purple/20"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
      </motion.div>
    </div>
  );
}
