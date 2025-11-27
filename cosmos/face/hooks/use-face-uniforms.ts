/**
 * Face Uniforms Hook
 * 
 * Phase 2 — Section 17: DYNAMIC AVATAR FACE ENGINE
 * Dynamic Avatar Face Engine (E21)
 * 
 * Supplies uniforms to face shader
 */

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FaceSyncState } from './use-face-sync';

export interface FaceUniforms {
  uTime: { value: number };
  uIntensity: { value: number };
  uBreathPhase: { value: number };
  uBlinkPhase: { value: number };
  uBrow: { value: number };
  uEye: { value: number };
  uCheek: { value: number };
  uMouthCurve: { value: number };
  uGlow: { value: number };
  uBass: { value: number };
  uMid: { value: number };
  uHigh: { value: number };
  uScroll: { value: number };
  uScrollVelocity: { value: number };
  uScrollDirection: { value: number };
  uBlessingWaveProgress: { value: number };
  uMouse: { value: THREE.Vector2 };
  uParallaxStrength: { value: number };
}

export function useFaceUniforms(
  material: THREE.ShaderMaterial | null,
  faceState: FaceSyncState,
  mouse: { x: number; y: number },
  intensity: number,
  parallaxStrength: number
): void {
  useFrame((state) => {
    if (!material || !material.uniforms) return;

    // Time
    material.uniforms.uTime.value = state.clock.elapsedTime;

    // Intensity
    material.uniforms.uIntensity.value = intensity;

    // Base Neutral Layer
    material.uniforms.uBreathPhase.value = faceState.breathPhase;
    material.uniforms.uBlinkPhase.value = faceState.blinkPhase;

    // Emotional Expression Layer
    material.uniforms.uBrow.value = faceState.expression.brow;
    material.uniforms.uEye.value = faceState.expression.eye;
    material.uniforms.uCheek.value = faceState.expression.cheek;
    material.uniforms.uMouthCurve.value = faceState.expression.mouthCurve;
    material.uniforms.uGlow.value = faceState.expression.glow;

    // Audio-Reactive
    material.uniforms.uBass.value = faceState.audioBass;
    material.uniforms.uMid.value = faceState.audioMid;
    material.uniforms.uHigh.value = faceState.audioHigh;

    // Scroll-Reactive
    material.uniforms.uScroll.value = faceState.scrollProgress;
    material.uniforms.uScrollVelocity.value = faceState.scrollVelocity;
    material.uniforms.uScrollDirection.value = faceState.scrollDirection;

    // Blessing wave
    material.uniforms.uBlessingWaveProgress.value = faceState.blessingWaveProgress;

    // Mouse
    material.uniforms.uMouse.value.set(mouse.x, mouse.y);

    // Parallax strength
    material.uniforms.uParallaxStrength.value = parallaxStrength;
  });
}

