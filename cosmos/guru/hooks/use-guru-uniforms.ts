/**
 * Guru Uniforms Hook
 * 
 * Phase 2 — Section 11: PAGE-LEVEL WORLD COMPOSITION ENGINE v1.0
 * Phase 2 — Section 12: PERFORMANCE, FALLBACKS & MOBILE STRATEGY v1.0
 * Guru Avatar Energy System (E15)
 * 
 * Manages shader uniforms for guru avatar
 */

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GuruState } from './use-guru-sync';

export interface GuruUniforms {
  uTime: { value: number };
  uBreathProgress: { value: number };
  uBreathStrength: { value: number };
  uEyeOpen: { value: number };
  uEyeGlow: { value: number };
  uEyeShimmer: { value: number };
  uHaloPulse: { value: number };
  uGlowIntensity: { value: number };
  uTurbulence: { value: number };
  uShimmer: { value: number };
  uSparkles: { value: number };
  uScroll: { value: number };
  uMouse: { value: THREE.Vector2 };
  uIntensity: { value: number };
  uParallaxStrength: { value: number };
}

export function useGuruUniforms(
  material: THREE.ShaderMaterial | null,
  guruState: GuruState,
  mouse: { x: number; y: number },
  scroll: number,
  intensity: number,
  parallaxStrength: number
) {
  useFrame(() => {
    if (!material || !material.uniforms) return;
    
    // Time
    material.uniforms.uTime.value = guruState.time;
    
    // Breath
    material.uniforms.uBreathProgress.value = guruState.breathProgress;
    material.uniforms.uBreathStrength.value = guruState.breathStrength;
    
    // Eye
    material.uniforms.uEyeOpen.value = guruState.eyeOpen;
    material.uniforms.uEyeGlow.value = guruState.eyeGlow;
    material.uniforms.uEyeShimmer.value = guruState.eyeShimmer;
    
    // Aura glow
    material.uniforms.uHaloPulse.value = guruState.haloPulse;
    material.uniforms.uGlowIntensity.value = guruState.glowIntensity;
    material.uniforms.uTurbulence.value = guruState.turbulence;
    material.uniforms.uShimmer.value = guruState.shimmer;
    material.uniforms.uSparkles.value = guruState.sparkles;
    
    // Scroll
    material.uniforms.uScroll.value = scroll;
    
    // Mouse
    material.uniforms.uMouse.value.set(mouse.x, mouse.y);
    
    // Intensity
    material.uniforms.uIntensity.value = intensity;
    
    // Parallax strength
    material.uniforms.uParallaxStrength.value = parallaxStrength;
  });
}

