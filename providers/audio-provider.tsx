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
import { AudioEngine, FFTData, AudioEventType } from '@/cosmos/audio';

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
  const [fftData, setFFTData] = useState<FFTData>({ bass: 0, mid: 0, high: 0 });
  const [isReady, setIsReady] = useState(false);

  // Initialize audio engine
  useEffect(() => {
    // Only initialize on client side
    if (typeof window === 'undefined') return;
    
    let interval: NodeJS.Timeout | null = null;
    let engineInstance: AudioEngine | null = null;
    
    // Dynamic import to ensure client-side only and avoid SSR issues
    import('@/cosmos/audio').then((module) => {
      const { AudioEngine } = module;
      
      if (!AudioEngine) {
        console.error('AudioEngine is undefined');
        return;
      }
      
      try {
        const engine = new AudioEngine();
        engineInstance = engine;
        engineRef.current = engine;
    
        // Resume audio context (required after user interaction)
        engine.resume().then(() => {
          setIsReady(true);
        });
        
        // Update FFT data periodically
        interval = setInterval(() => {
          if (engine) {
            const data = engine.getFFTData();
            setFFTData(data);
          }
        }, 16); // ~60fps
      } catch (error) {
        console.error('Failed to initialize AudioEngine:', error);
      }
    }).catch((error) => {
      console.error('Failed to import AudioEngine:', error);
    });
    
    // Cleanup function
    return () => {
      if (interval) {
        clearInterval(interval);
      }
      if (engineInstance) {
        engineInstance.destroy();
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
    if (engineRef.current) {
      await engineRef.current.resume();
    }
  }, []);

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
