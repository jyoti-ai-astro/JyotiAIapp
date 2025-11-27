/**
 * Celestial Sanctum v3 Motion Hook
 * 
 * Phase 2 — Section 64: CELESTIAL SANCTUM ENGINE v3
 * Celestial Sanctum Engine v3 (E68)
 * 
 * Get orchestrator state
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { motionOrchestrator, MotionState } from '../../motion/orchestrator';

export interface CelestialSanctumMotionState {
  time: number;
  scrollProgress: number;
  bassMotion: number;
  midMotion: number;
  highMotion: number;
  globalMotion: number;
}

export function useCelestialSanctumMotion(): CelestialSanctumMotionState {
  const stateRef = useRef<CelestialSanctumMotionState>({
    time: 0,
    scrollProgress: 0,
    bassMotion: 0,
    midMotion: 0,
    highMotion: 0,
    globalMotion: 0,
  });

  useFrame(() => {
    // Get motion state from orchestrator
    const motionState = motionOrchestrator.getMotionState();
    
    stateRef.current = {
      time: motionState.time,
      scrollProgress: motionState.scrollProgress,
      bassMotion: motionState.bassMotion,
      midMotion: motionState.midMotion,
      highMotion: motionState.highMotion,
      globalMotion: motionState.globalMotion,
    };
  });

  return stateRef.current;
}

