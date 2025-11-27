/**
 * Pulse Audio Hook
 * 
 * Phase 2 — Section 5: KUNDALINI ENERGY WAVE SYSTEM
 * Cosmic Pulse Field Engine (E8)
 * 
 * Maps bass/mid/high frequencies to pulse field shader uniforms
 */

import { useMemo } from 'react';

export interface UsePulseAudioProps {
  /** Audio reactive values */
  audioReactive?: {
    bass?: number;
    mid?: number;
    high?: number;
  };
}

export interface PulseAudioValues {
  bass: number;
  mid: number;
  high: number;
}

export function usePulseAudio(
  props: UsePulseAudioProps
): PulseAudioValues {
  return useMemo(() => {
    if (!props.audioReactive) {
      return { bass: 0, mid: 0, high: 0 };
    }
    
    // Map audio frequencies to shader uniforms
    // Normalize to 0-1 range
    const bass = Math.max(0, Math.min(1, props.audioReactive.bass || 0));
    const mid = Math.max(0, Math.min(1, props.audioReactive.mid || 0));
    const high = Math.max(0, Math.min(1, props.audioReactive.high || 0));
    
    return { bass, mid, high };
  }, [
    props.audioReactive?.bass,
    props.audioReactive?.mid,
    props.audioReactive?.high,
  ]);
}

