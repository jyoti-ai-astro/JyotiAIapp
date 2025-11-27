/**
 * Dimensional Ripple Uniforms Hook
 * 
 * Phase 2 — Section 43: DIMENSIONAL RIPPLE ENGINE
 * Dimensional Ripple Engine (E47)
 * 
 * Update uniforms
 */

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { DimensionalRippleMotionState } from './use-ripple-motion';

export interface DimensionalRippleUniforms {
  uTime: { value: number };
  uIntensity: { value: number };
  uBreathPhase: { value: number };
  uBreathStrength: { value: number };
  uBass: { value: number };
  uMid: { value: number };
  uHigh: { value: number };
  uScroll: { value: number };
  uBlessingWaveProgress: { value: number };
  uMouse: { value: THREE.Vector2 };
  uParallaxStrength: { value: number };
  uRotationSync: { value: number };
  uCameraFOV: { value: number };
}

export function useDimensionalRippleUniforms(
  material: THREE.ShaderMaterial | null,
  motionState: DimensionalRippleMotionState,
  breathPhase: number,
  breathStrength: number,
  blessingWaveProgress: number,
  mouse: { x: number; y: number },
  intensity: number,
  parallaxStrength: number,
  rotationSync: number,
  cameraFOV: number
): void {
  useFrame((state) => {
    if (!material || !material.uniforms) return;

    // Time
    material.uniforms.uTime.value = motionState.time;

    // Intensity
    material.uniforms.uIntensity.value = intensity;

    // Breath
    material.uniforms.uBreathPhase.value = breathPhase;
    material.uniforms.uBreathStrength.value = breathStrength;

    // Audio reactive
    material.uniforms.uBass.value = motionState.bassMotion;
    material.uniforms.uMid.value = motionState.midMotion;
    material.uniforms.uHigh.value = motionState.highMotion;

    // Scroll
    material.uniforms.uScroll.value = motionState.scrollProgress;

    // Blessing wave
    material.uniforms.uBlessingWaveProgress.value = blessingWaveProgress;

    // Mouse
    material.uniforms.uMouse.value.set(mouse.x, mouse.y);

    // Parallax strength
    material.uniforms.uParallaxStrength.value = parallaxStrength;

    // Rotation sync (from Projection E17)
    material.uniforms.uRotationSync.value = rotationSync;

    // Camera FOV (from CameraController E18)
    material.uniforms.uCameraFOV.value = cameraFOV;
  });
}

