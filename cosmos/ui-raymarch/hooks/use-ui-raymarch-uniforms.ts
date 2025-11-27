/**
 * UI Raymarch Uniforms Hook
 * 
 * Phase 2 — Section 15: QUALITY ASSURANCE + BROWSER COMPATIBILITY + STRESS TESTING
 * Cosmic UI Raymarch Overlay Engine (E19)
 * 
 * Supplies uniforms to shader
 */

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { UIRaymarchMotionState } from './use-ui-raymarch-motion';

export interface UIRaymarchUniforms {
  uTime: { value: number };
  uIntensity: { value: number };
  uScroll: { value: number };
  uBass: { value: number };
  uMid: { value: number };
  uHigh: { value: number };
  uBlessingWaveProgress: { value: number };
  uGuruHover: { value: number };
  uMouse: { value: THREE.Vector2 };
  uCameraFOV: { value: number };
}

export function useUIRaymarchUniforms(
  material: THREE.ShaderMaterial | null,
  motionState: UIRaymarchMotionState,
  mouse: { x: number; y: number },
  blessingWaveProgress: number,
  isGuruHovered: boolean,
  intensity: number
): void {
  useFrame((state) => {
    if (!material || !material.uniforms) return;
    
    // Time
    material.uniforms.uTime.value = motionState.time;
    
    // Intensity
    material.uniforms.uIntensity.value = intensity;
    
    // Scroll
    material.uniforms.uScroll.value = motionState.scrollProgress;
    
    // Audio reactive
    material.uniforms.uBass.value = motionState.bassMotion;
    material.uniforms.uMid.value = motionState.midMotion;
    material.uniforms.uHigh.value = motionState.highMotion;
    
    // Blessing wave progress
    material.uniforms.uBlessingWaveProgress.value = blessingWaveProgress;
    
    // Guru hover
    material.uniforms.uGuruHover.value = isGuruHovered ? 1.0 : 0.0;
    
    // Mouse
    material.uniforms.uMouse.value.set(mouse.x, mouse.y);
    
    // Camera FOV
    material.uniforms.uCameraFOV.value = motionState.cameraState?.fov || 50.0;
  });
}

