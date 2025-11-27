/**
 * Blessing Uniforms Hook
 * 
 * Phase 2 — Section 13: ACCESSIBILITY & MOTION SAFETY LAYER v1.0
 * Blessing Wave Engine (E16)
 * 
 * Syncs with Motion Orchestrator and manages blessing wave uniforms
 */

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { motionOrchestrator, MotionState } from '../../motion/orchestrator';
import { BlessingWaveTriggerState } from './use-blessing-trigger';

export interface BlessingState {
  // Motion orchestrator data
  scrollProgress: number;
  bassMotion: number;
  midMotion: number;
  highMotion: number;
  
  // Wave trigger state
  waveProgress: number;
  waveActive: boolean;
}

export interface BlessingUniforms {
  uTime: { value: number };
  uWaveProgress: { value: number };
  uScroll: { value: number };
  uBass: { value: number };
  uMid: { value: number };
  uHigh: { value: number };
  uMouse: { value: THREE.Vector2 };
  uIntensity: { value: number };
  uParallaxStrength: { value: number };
}

export function useBlessingUniforms(
  material: THREE.ShaderMaterial | null,
  triggerState: BlessingWaveTriggerState,
  mouse: { x: number; y: number },
  scroll: number,
  intensity: number,
  parallaxStrength: number
): BlessingState {
  useFrame((state) => {
    if (!material || !material.uniforms) return;
    
    // Get motion state from orchestrator
    const motionState = motionOrchestrator.getMotionState();
    
    // Time
    material.uniforms.uTime.value = state.clock.elapsedTime;
    
    // Wave progress
    material.uniforms.uWaveProgress.value = triggerState.waveProgress;
    
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
    scrollProgress: motionState.scrollProgress,
    bassMotion: motionState.bassMotion,
    midMotion: motionState.midMotion,
    highMotion: motionState.highMotion,
    waveProgress: triggerState.waveProgress,
    waveActive: triggerState.waveActive,
  };
}

