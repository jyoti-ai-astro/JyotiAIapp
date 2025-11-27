/**
 * Guru Eye Glow Hook
 * 
 * Phase 2 — Section 11: PAGE-LEVEL WORLD COMPOSITION ENGINE v1.0
 * Phase 2 — Section 12: PERFORMANCE, FALLBACKS & MOBILE STRATEGY v1.0
 * Guru Avatar Energy System (E15)
 * 
 * Eye glow: hover → eye-open, idle → soft closed, high-frequency audio → shimmer
 */

import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { smoothValue } from '../../audio/utils/smoothing';

export interface GuruEyeState {
  eyeOpen: number; // 0-1 (0 = closed, 1 = open)
  eyeGlow: number; // 0-1 (glow intensity)
  eyeShimmer: number; // 0-1 (shimmer from high frequencies)
}

export function useGuruEye(
  isHovered: boolean,
  highFrequency: number = 0
): GuruEyeState {
  const eyeStateRef = useRef<GuruEyeState>({
    eyeOpen: 0.3, // Soft closed by default
    eyeGlow: 0.2,
    eyeShimmer: 0,
  });
  
  const targetEyeOpen = useRef(0.3);
  const currentEyeOpen = useRef(0.3);
  const currentEyeGlow = useRef(0.2);
  const currentEyeShimmer = useRef(0);

  // Update target based on hover
  useEffect(() => {
    targetEyeOpen.current = isHovered ? 1.0 : 0.3;
  }, [isHovered]);

  useFrame((state) => {
    const delta = state.clock.getDelta();
    
    // Smooth transition to target eye open (0.5s transition)
    const transitionSpeed = 2.0; // 1 / 0.5s
    currentEyeOpen.current = smoothValue(
      currentEyeOpen.current,
      targetEyeOpen.current,
      transitionSpeed * delta
    );
    
    // Eye glow follows eye open
    currentEyeGlow.current = currentEyeOpen.current * 0.8;
    
    // High-frequency audio → subtle shimmer
    currentEyeShimmer.current = highFrequency * 0.5;
    
    eyeStateRef.current = {
      eyeOpen: currentEyeOpen.current,
      eyeGlow: currentEyeGlow.current,
      eyeShimmer: currentEyeShimmer.current,
    };
  });

  return eyeStateRef.current;
}

