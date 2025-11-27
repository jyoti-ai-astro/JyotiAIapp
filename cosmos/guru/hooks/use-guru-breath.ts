/**
 * Guru Breath Cycle Hook
 * 
 * Phase 2 — Section 11: PAGE-LEVEL WORLD COMPOSITION ENGINE v1.0
 * Phase 2 — Section 12: PERFORMANCE, FALLBACKS & MOBILE STRATEGY v1.0
 * Guru Avatar Energy System (E15)
 * 
 * Breath cycle: inhale 3.5s, exhale 3.5s
 */

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { easeInOutCubic } from '../../motion/easing';

export interface GuruBreathState {
  breathProgress: number; // 0-1
  breathStrength: number; // 0-1
}

export function useGuruBreath(): GuruBreathState {
  const breathStateRef = useRef<GuruBreathState>({
    breathProgress: 0,
    breathStrength: 0,
  });
  
  const cycleTimeRef = useRef(0);
  const inhaleDuration = 3.5; // seconds
  const exhaleDuration = 3.5; // seconds
  const totalDuration = inhaleDuration + exhaleDuration;

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Cycle time (0 to totalDuration, looping)
    cycleTimeRef.current = time % totalDuration;
    
    // Determine if inhaling or exhaling
    const isInhaling = cycleTimeRef.current < inhaleDuration;
    
    let progress: number;
    if (isInhaling) {
      // Inhale: 0 to 1 over inhaleDuration
      progress = cycleTimeRef.current / inhaleDuration;
    } else {
      // Exhale: 1 to 0 over exhaleDuration
      const exhaleProgress = (cycleTimeRef.current - inhaleDuration) / exhaleDuration;
      progress = 1 - exhaleProgress;
    }
    
    // Apply easing (expansion curve)
    const easedProgress = easeInOutCubic(progress);
    
    // Breath strength (intensity of breath)
    const strength = easedProgress;
    
    breathStateRef.current = {
      breathProgress: easedProgress,
      breathStrength: strength,
    };
  });

  return breathStateRef.current;
}

