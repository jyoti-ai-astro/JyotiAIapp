/**
 * Projection Uniforms Hook
 * 
 * Phase 2 — Section 14: QUALITY ASSURANCE + BROWSER COMPATIBILITY + STRESS TESTING
 * Sacred Geometry Projection Engine (E17)
 * 
 * Collects time, scrollProgress, bassMotion, midMotion, highMotion
 */

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { motionOrchestrator, MotionState } from '../../motion/orchestrator';

export interface ProjectionState {
  time: number;
  scrollProgress: number;
  bassMotion: number;
  midMotion: number;
  highMotion: number;
  globalMotion: number;
}

export interface ProjectionUniforms {
  uTime: { value: number };
  uScroll: { value: number };
  uBass: { value: number };
  uMid: { value: number };
  uHigh: { value: number };
  uMouse: { value: THREE.Vector2 };
  uIntensity: { value: number };
  uParallaxStrength: { value: number };
}

export function useProjectionUniforms(
  material: THREE.ShaderMaterial | null,
  mouse: { x: number; y: number },
  scroll: number,
  intensity: number,
  parallaxStrength: number
): ProjectionState {
  useFrame((state) => {
    if (!material || !material.uniforms) return;
    
    // Get motion state from orchestrator
    const motionState = motionOrchestrator.getMotionState();
    
    // Time
    material.uniforms.uTime.value = state.clock.elapsedTime;
    
    // Scroll
    material.uniforms.uScroll.value = scroll;
    
    // Audio reactive
    material.uniforms.uBass.value = motionState.bassMotion;
    material.uniforms.uMid.value = motionState.midMotion;
    material.uniforms.uHigh.value = motionState.highMotion;
    
    // Mouse
    material.uniforms.uMouse.value.set(mouse.x, mouse.y);
    
    // Intensity
    material.uniforms.uIntensity.value = intensity;
    
    // Parallax strength
    material.uniforms.uParallaxStrength.value = parallaxStrength;
  });

  // Get motion state for return
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

