/**
 * Blessing Wave Trigger Hook
 * 
 * Phase 2 — Section 13: ACCESSIBILITY & MOTION SAFETY LAYER v1.0
 * Blessing Wave Engine (E16)
 * 
 * Trigger system for blessing wave activation
 */

import { useRef, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';

export interface BlessingWaveTriggerState {
  waveStartTime: number;
  waveActive: boolean;
  waveProgress: number; // 0-1
}

export function useBlessingWaveTrigger() {
  const [waveActive, setWaveActive] = useState(false);
  const waveStartTimeRef = useRef(0);
  const waveProgressRef = useRef(0);
  const waveDuration = 2.5; // seconds

  /**
   * Trigger blessing wave
   */
  const triggerWave = useCallback(() => {
    setWaveActive(true);
    waveStartTimeRef.current = performance.now() / 1000; // Convert to seconds
    waveProgressRef.current = 0;
  }, []);

  /**
   * Update wave progress
   */
  useFrame((state) => {
    if (!waveActive) {
      waveProgressRef.current = 0;
      return;
    }

    const currentTime = state.clock.elapsedTime;
    const elapsed = currentTime - waveStartTimeRef.current;
    
    if (elapsed >= waveDuration) {
      // Auto-fade out after 2.5s
      setWaveActive(false);
      waveProgressRef.current = 0;
    } else {
      // Calculate progress (0-1)
      waveProgressRef.current = elapsed / waveDuration;
    }
  });

  const triggerState: BlessingWaveTriggerState = {
    waveStartTime: waveStartTimeRef.current,
    waveActive,
    waveProgress: waveProgressRef.current,
  };

  return {
    triggerWave,
    triggerState,
  };
}

