/**
 * Path Uniforms Hook
 * 
 * Phase 2 — Section 20: DIVINE PATH INDICATOR ENGINE
 * Path Indicator Engine (E24)
 * 
 * Populate shader uniforms each frame using useFrame
 */

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PathMotionState } from './use-path-motion';

export interface PathUniforms {
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
  uPathRotation: { value: number };
}

export function usePathUniforms(
  material: THREE.ShaderMaterial | null,
  motionState: PathMotionState,
  breathPhase: number,
  breathStrength: number,
  blessingWaveProgress: number,
  mouse: { x: number; y: number },
  intensity: number,
  parallaxStrength: number,
  pathRotation: number
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

    // Path rotation (mandala-alignment from Projection E17)
    material.uniforms.uPathRotation.value = pathRotation;
  });
}

