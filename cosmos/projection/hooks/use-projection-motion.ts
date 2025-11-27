/**
 * Projection Motion Hook
 * 
 * Phase 2 — Section 14: QUALITY ASSURANCE + BROWSER COMPATIBILITY + STRESS TESTING
 * Sacred Geometry Projection Engine (E17)
 * 
 * Integrates with Motion Orchestrator and provides real-time motionState
 */

import { useEffect } from 'react';
import { motionOrchestrator, MotionState } from '../../motion/orchestrator';
import { ProjectionState } from './use-projection-uniforms';

export function useProjectionMotion(
  onMotionUpdate?: (motionState: MotionState) => void
): ProjectionState {
  useEffect(() => {
    // Register with motion orchestrator
    motionOrchestrator.registerEngine('projection-engine', (motionState: MotionState) => {
      if (onMotionUpdate) {
        onMotionUpdate(motionState);
      }
    });
    
    return () => {
      motionOrchestrator.unregisterEngine('projection-engine');
    };
  }, [onMotionUpdate]);

  // Get current motion state
  const motionState = motionOrchestrator.getMotionState();

  return {
    time: motionState.time,
    scrollProgress: motionState.scrollProgress,
    bassMotion: motionState.bassMotion,
    midMotion: motionState.midMotion,
    highMotion: motionState.highMotion,
    globalMotion: motionState.globalMotion,
  };
}

