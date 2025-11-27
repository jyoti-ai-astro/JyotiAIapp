/**
 * Celestial Horizon v2 Motion Hook
 * 
 * Phase 2 — Section 52: CELESTIAL HORIZON ENGINE v2
 * Celestial Horizon Engine v2 (E56)
 * 
 * Get orchestrator state
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { motionOrchestrator, MotionState } from '../../motion/orchestrator';

export interface CelestialHorizonMotionState {
  time: number;
  scrollProgress: number;
  bassMotion: number;
  midMotion: number;
  highMotion: number;
  globalMotion: number;
}

export function useCelestialHorizonMotion(): CelestialHorizonMotionState {
  const stateRef = useRef<CelestialHorizonMotionState>({
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

