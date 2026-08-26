/**
 * Audio Provider
 * 
 * Phase 2 — Section 8: AUDIO ATMOSPHERE ENGINE v1.0
 * Spatial Audio Engine (E13)
 * 
 * React context provider for spatial audio engine
 */

'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
// AudioEngine is dynamically imported to avoid SSR issues
type AudioEngine = any;
type FFTData = { bass: number; mid: number; high: number };
type AudioEventType = string;

interface AudioContextValue {
  // FFT data
  fftData: FFTData;
  
  // Audio engine methods
  loadSound: (layer: 'ambient' | 'guru' | 'event', url: string) => Promise<void>;
  playLayer: (layer: 'ambient' | 'guru' | 'event', loop?: boolean) => void;
  stopLayer: (layer: 'ambient' | 'guru' | 'event') => void;
  setPosition: (layer: 'ambient' | 'guru' | 'event', x: number, y: number, z: number) => void;
  setMouse: (x: number, y: number) => void;
  setScroll: (scroll: number) => void;
  triggerEvent: (type: AudioEventType) => void;
  setMasterVolume: (volume: number) => void;
  
  // State
  isReady: boolean;
  resume: () => Promise<void>;
}

const AudioContext = createContext<AudioContextValue | null>(null);

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within AudioProvider');
  }
  return context;
}

interface AudioProviderProps {
  children: React.ReactNode;
}

export function AudioProvider({ children }: AudioProviderProps) {
  const engineRef = useRef<AudioEngine | null>(null);
  const enginePromiseRef = useRef<Promise<AudioEngine | null> | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [fftData, setFFTData] = useState<FFTData>({ bass: 0, mid: 0, high: 0 });
  const [isReady, setIsReady] = useState(false);

  const startFFTUpdates = useCallback((engine: AudioEngine) => {
    if (intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      try {
        setFFTData(engine.getFFTData());
      } catch {
        // Audio is optional; retain the last known zeroed values on failure.
      }
    }, 250);
  }, []);

  const ensureEngine = useCallback(async () => {
    if (typeof window === 'undefined') return null;
    if (engineRef.current) return engineRef.current;
    if (enginePromiseRef.current) return enginePromiseRef.current;

    enginePromiseRef.current = import('@/cosmos/audio')
      .then(async (module) => {
        const { AudioEngine } = module;
        if (!AudioEngine) return null;

        const engine = new AudioEngine();
        engineRef.current = engine;
        await engine.resume();
        startFFTUpdates(engine);
        setIsReady(true);
        return engine;
      })
      .catch(() => {
        enginePromiseRef.current = null;
        return null;
      });

    return enginePromiseRef.current;
  }, [startFFTUpdates]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    };
  }, []);

  const loadSound = useCallback(async (layer: 'ambient' | 'guru' | 'event', url: string) => {
    if (engineRef.current) {
      await engineRef.current.loadSound(layer, url);
    }
  }, []);

  const playLayer = useCallback((layer: 'ambient' | 'guru' | 'event', loop: boolean = false) => {
    if (engineRef.current) {
      engineRef.current.playLayer(layer, loop);
    }
  }, []);

  const stopLayer = useCallback((layer: 'ambient' | 'guru' | 'event') => {
    if (engineRef.current) {
      engineRef.current.stopLayer(layer);
    }
  }, []);

  const setPosition = useCallback((layer: 'ambient' | 'guru' | 'event', x: number, y: number, z: number) => {
    if (engineRef.current) {
      engineRef.current.setPosition(layer, x, y, z);
    }
  }, []);

  const setMouse = useCallback((x: number, y: number) => {
    if (engineRef.current) {
      engineRef.current.setMouse(x, y);
    }
  }, []);

  const setScroll = useCallback((scroll: number) => {
    if (engineRef.current) {
      engineRef.current.setScroll(scroll);
    }
  }, []);

  const triggerEvent = useCallback((type: AudioEventType) => {
    if (engineRef.current) {
      engineRef.current.triggerEvent(type);
    }
  }, []);

  const setMasterVolume = useCallback((volume: number) => {
    if (engineRef.current) {
      engineRef.current.setMasterVolume(volume);
    }
  }, []);

  const resume = useCallback(async () => {
    await ensureEngine();
  }, [ensureEngine]);

  const value: AudioContextValue = {
    fftData,
    loadSound,
    playLayer,
    stopLayer,
    setPosition,
    setMouse,
    setScroll,
    triggerEvent,
    setMasterVolume,
    isReady,
    resume,
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
}
