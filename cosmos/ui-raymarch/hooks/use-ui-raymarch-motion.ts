/**
 * UI Raymarch Motion Hook
 * 
 * Phase 2 — Section 15: QUALITY ASSURANCE + BROWSER COMPATIBILITY + STRESS TESTING
 * Cosmic UI Raymarch Overlay Engine (E19)
 * 
 * Computes combined motion state from orchestrator and camera
 */

import { useEffect } from 'react';
import { motionOrchestrator, MotionState } from '../../motion/orchestrator';
import { CameraState } from '../../camera/camera-engine';

export interface UIRaymarchMotionState {
  time: number;
  scrollProgress: number;
  bassMotion: number;
  midMotion: number;
  highMotion: number;
  globalMotion: number;
  cameraState?: CameraState;
}

export function useUIRaymarchMotion(
  cameraState?: CameraState,
  onMotionUpdate?: (motionState: UIRaymarchMotionState) => void
): UIRaymarchMotionState {
  useEffect(() => {
    // Register with motion orchestrator
    motionOrchestrator.registerEngine('ui-raymarch', (motionState: MotionState) => {
      if (onMotionUpdate) {
        onMotionUpdate({
          time: motionState.time,
          scrollProgress: motionState.scrollProgress,
          bassMotion: motionState.bassMotion,
          midMotion: motionState.midMotion,
          highMotion: motionState.highMotion,
          globalMotion: motionState.globalMotion,
          cameraState,
        });
      }
    });
    
    return () => {
      motionOrchestrator.unregisterEngine('ui-raymarch');
    };
  }, [cameraState, onMotionUpdate]);

  // Get current motion state
  const motionState = motionOrchestrator.getMotionState();

  return {
    time: motionState.time,
    scrollProgress: motionState.scrollProgress,
    bassMotion: motionState.bassMotion,
    midMotion: motionState.midMotion,
    highMotion: motionState.highMotion,
    globalMotion: motionState.globalMotion,
    cameraState,
  };
}

