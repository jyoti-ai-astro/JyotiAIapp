/**
 * Grid Uniforms Hook
 * 
 * Phase 2 — Section 22: COSMIC ALIGNMENT GRID ENGINE
 * Alignment Grid Engine (E26)
 * 
 * Apply uniforms via useFrame
 */

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GridMotionState } from './use-grid-motion';

export interface GridUniforms {
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
  uGridRotation: { value: number };
  uCameraFOV: { value: number };
}

export function useGridUniforms(
  material: THREE.ShaderMaterial | null,
  motionState: GridMotionState,
  breathPhase: number,
  breathStrength: number,
  blessingWaveProgress: number,
  mouse: { x: number; y: number },
  intensity: number,
  parallaxStrength: number,
  gridRotation: number,
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

    // Grid rotation (from Projection E17)
    material.uniforms.uGridRotation.value = gridRotation;

    // Camera FOV (from CameraController E18)
    material.uniforms.uCameraFOV.value = cameraFOV;
  });
}

