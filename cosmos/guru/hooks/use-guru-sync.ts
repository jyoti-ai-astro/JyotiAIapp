/**
 * Guru Uniform Sync Hook
 * 
 * Phase 2 — Section 11: PAGE-LEVEL WORLD COMPOSITION ENGINE v1.0
 * Phase 2 — Section 12: PERFORMANCE, FALLBACKS & MOBILE STRATEGY v1.0
 * Guru Avatar Energy System (E15)
 * 
 * Syncs with Motion Orchestrator and combines all guru states
 */

import { useRef } from 'react';
import { motionOrchestrator, MotionState } from '../../motion/orchestrator';
import { GuruBreathState } from './use-guru-breath';
import { GuruEyeState } from './use-guru-eye';
import { GuruGlowState } from './use-guru-glow';

export interface GuruState {
  // Motion orchestrator data
  time: number;
  scrollProgress: number;
  bassMotion: number;
  midMotion: number;
  highMotion: number;
  globalMotion: number;
  
  // Breath cycle
  breathProgress: number;
  breathStrength: number;
  
  // Eye state
  eyeOpen: number;
  eyeGlow: number;
  eyeShimmer: number;
  
  // Aura glow
  haloPulse: number;
  glowIntensity: number;
  turbulence: number;
  shimmer: number;
  sparkles: number;
}

export function useGuruSync(
  breathState: GuruBreathState,
  eyeState: GuruEyeState,
  glowState: GuruGlowState
): GuruState {
  const guruStateRef = useRef<GuruState>({
    time: 0,
    scrollProgress: 0,
    bassMotion: 0,
    midMotion: 0,
    highMotion: 0,
    globalMotion: 0,
    breathProgress: 0,
    breathStrength: 0,
    eyeOpen: 0.3,
    eyeGlow: 0.2,
    eyeShimmer: 0,
    haloPulse: 0,
    glowIntensity: 0,
    turbulence: 0,
    shimmer: 0,
    sparkles: 0,
  });

  // Get motion state from orchestrator
  const motionState = motionOrchestrator.getMotionState();

  // Combine all states
  guruStateRef.current = {
    // Motion orchestrator data
    time: motionState.time,
    scrollProgress: motionState.scrollProgress,
    bassMotion: motionState.bassMotion,
    midMotion: motionState.midMotion,
    highMotion: motionState.highMotion,
    globalMotion: motionState.globalMotion,
    
    // Breath cycle
    breathProgress: breathState.breathProgress,
    breathStrength: breathState.breathStrength,
    
    // Eye state
    eyeOpen: eyeState.eyeOpen,
    eyeGlow: eyeState.eyeGlow,
    eyeShimmer: eyeState.eyeShimmer,
    
    // Aura glow
    haloPulse: glowState.haloPulse,
    glowIntensity: glowState.glowIntensity,
    turbulence: glowState.turbulence,
    shimmer: glowState.shimmer,
    sparkles: glowState.sparkles,
  };

  return guruStateRef.current;
}

