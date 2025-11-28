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
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    // Initialize Web Audio API
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
        const gainNode = audioContextRef.current.createGain();
        gainNodeRef.current = gainNode;
        gainNode.connect(audioContextRef.current.destination);
        gainNode.gain.value = isMuted ? 0 : volume;

        // Create low-frequency hum (cosmic drone)
        const oscillator = audioContextRef.current.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.value = 60; // Low frequency hum
        oscillator.connect(gainNode);
        oscillator.start();
        oscillatorRef.current = oscillator;
      } catch (error) {
        console.warn('Web Audio API not supported:', error);
      }
    }

    return () => {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = isMuted ? 0 : volume;
    }
  }, [isMuted, volume]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (!isMuted && gainNodeRef.current) {
      gainNodeRef.current.gain.value = newVolume;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

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

