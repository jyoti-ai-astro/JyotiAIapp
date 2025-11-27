/**
 * Guru Aura Glow Hook
 * 
 * Phase 2 — Section 11: PAGE-LEVEL WORLD COMPOSITION ENGINE v1.0
 * Phase 2 — Section 12: PERFORMANCE, FALLBACKS & MOBILE STRATEGY v1.0
 * Guru Avatar Energy System (E15)
 * 
 * Aura glow: radiant halo pulses, bass → glow intensity, mid → turbulence, high → shimmer
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { smoothValue } from '../../audio/utils/smoothing';

export interface GuruGlowState {
  haloPulse: number; // 0-1 (radiant halo pulses)
  glowIntensity: number; // 0-1 (bass-driven)
  turbulence: number; // 0-1 (mid-driven)
  shimmer: number; // 0-1 (high-driven)
  sparkles: number; // 0-1 (high-driven sparkles)
}

export function useGuruGlow(
  bass: number = 0,
  mid: number = 0,
  high: number = 0
): GuruGlowState {
  const glowStateRef = useRef<GuruGlowState>({
    haloPulse: 0,
    glowIntensity: 0,
    turbulence: 0,
    shimmer: 0,
    sparkles: 0,
  });
  
  const currentGlowIntensity = useRef(0);
  const currentTurbulence = useRef(0);
  const currentShimmer = useRef(0);
  const currentSparkles = useRef(0);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const delta = state.clock.getDelta();
    
    // Radiant halo pulses (slow pulse)
    const haloPulse = (Math.sin(time * 0.5) * 0.5 + 0.5);
    
    // Bass → glow intensity (smooth transition)
    currentGlowIntensity.current = smoothValue(
      currentGlowIntensity.current,
      bass,
      3.0 * delta
    );
    
    // Mid → soft turbulence
    currentTurbulence.current = smoothValue(
      currentTurbulence.current,
      mid * 0.6,
      2.5 * delta
    );
    
    // High → shimmer + sparkles
    currentShimmer.current = smoothValue(
      currentShimmer.current,
      high * 0.7,
      4.0 * delta
    );
    
    // Sparkles (high-frequency flicker)
    const sparkleFlicker = Math.sin(time * 15.0) * 0.5 + 0.5;
    currentSparkles.current = high * sparkleFlicker * 0.5;
    
    glowStateRef.current = {
      haloPulse,
      glowIntensity: currentGlowIntensity.current,
      turbulence: currentTurbulence.current,
      shimmer: currentShimmer.current,
      sparkles: currentSparkles.current,
    };
  });

  return glowStateRef.current;
}

