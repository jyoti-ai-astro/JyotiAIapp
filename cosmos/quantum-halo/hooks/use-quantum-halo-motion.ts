/**
 * Quantum Halo Motion Hook
 * 
 * Phase 2 — Section 48: QUANTUM HALO ENGINE
 * Quantum Halo Engine (E52)
 * 
 * Get orchestrator state
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { motionOrchestrator, MotionState } from '../../motion/orchestrator';

export interface QuantumHaloMotionState {
  time: number;
  scrollProgress: number;
  bassMotion: number;
  midMotion: number;
  highMotion: number;
  globalMotion: number;
}

export function useQuantumHaloMotion(): QuantumHaloMotionState {
  const stateRef = useRef<QuantumHaloMotionState>({
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

