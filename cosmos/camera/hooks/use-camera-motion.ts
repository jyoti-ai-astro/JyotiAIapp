/**
 * Camera Motion Hook
 * 
 * Phase 2 — Section 10: SCROLL INTERACTION ENGINE v1.0
 * Phase 2 — Section 12: PERFORMANCE, FALLBACKS & MOBILE STRATEGY v1.0
 * Cosmic Camera System (E18)
 * 
 * Syncs with motion orchestrator and computes camera transforms
 */

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { motionOrchestrator, MotionState } from '../../motion/orchestrator';
import { CameraEngine, CameraState, CameraConfig } from '../camera-engine';

export function useCameraMotion(
  cameraEngine: CameraEngine,
  config: CameraConfig
): CameraState {
  const lastTimeRef = useRef(0);
  const cameraStateRef = useRef<CameraState>({
    position: new THREE.Vector3(0, 0, -4),
    rotation: new THREE.Euler(0, 0, 0),
    fov: 50,
    target: new THREE.Vector3(0, 0, 0),
  });

  useFrame((state) => {
    // Calculate delta time
    const currentTime = state.clock.elapsedTime;
    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;
    
    // Clamp delta time to prevent large jumps
    const clampedDelta = Math.min(deltaTime, 0.1);
    
    // Update config from motion state
    const motionState = motionOrchestrator.getMotionState();
    cameraEngine.updateConfig({
      scroll: config.scroll ?? motionState.scrollProgress,
      audioReactive: {
        bass: config.audioReactive?.bass ?? motionState.bassMotion,
        mid: config.audioReactive?.mid ?? motionState.midMotion,
        high: config.audioReactive?.high ?? motionState.highMotion,
      },
      ...config,
    });
    
    // Update camera engine and get state
    const newState = cameraEngine.update(clampedDelta);
    cameraStateRef.current = newState;
  });

  return cameraStateRef.current;
}

