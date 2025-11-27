/**
 * Shafts Uniforms Hook
 * 
 * Phase 2 — Section 5: KUNDALINI ENERGY WAVE SYSTEM
 * Celestial Light Shafts Engine (E11)
 * 
 * Manages time, scroll, audio, and mouse uniforms for light shafts shader
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface ShaftsUniforms {
  uTime: { value: number };
  uBass: { value: number };
  uMid: { value: number };
  uHigh: { value: number };
  uScroll: { value: number };
  uMouse: { value: THREE.Vector2 };
  uIntensity: { value: number };
  uParallaxStrength: { value: number };
  uShaftType: { value: number };
}

export interface UseShaftsUniformsProps {
  /** Mouse position */
  mouse?: { x: number; y: number };
  
  /** Scroll position (0-1) */
  scroll?: number;
  
  /** Intensity multiplier */
  intensity?: number;
  
  /** Parallax strength */
  parallaxStrength?: number;
  
  /** Shaft type (0: Solar God-Rays, 1: Divine Beams, 2: Cross-Directional) */
  shaftType?: number;
  
  /** Audio reactive values */
  audioReactive?: {
    bass?: number;
    mid?: number;
    high?: number;
  };
}

export function useShaftsUniforms(
  material: THREE.ShaderMaterial | null,
  props: UseShaftsUniformsProps
) {
  useFrame((state) => {
    if (!material || !material.uniforms) return;
    
    const time = state.clock.elapsedTime;
    
    // Time uniform
    material.uniforms.uTime.value = time;
    
    // Scroll mapping
    material.uniforms.uScroll.value = props.scroll || 0;
    
    // Intensity
    material.uniforms.uIntensity.value = props.intensity || 1.0;
    
    // Parallax strength
    material.uniforms.uParallaxStrength.value = props.parallaxStrength || 1.0;
    
    // Shaft type
    material.uniforms.uShaftType.value = props.shaftType || 0;
    
    // Mouse parallax mapping
    if (props.mouse) {
      material.uniforms.uMouse.value.set(
        props.mouse.x,
        props.mouse.y
      );
    }
    
    // Audio reactive uniforms
    if (props.audioReactive) {
      material.uniforms.uBass.value = props.audioReactive.bass || 0;
      material.uniforms.uMid.value = props.audioReactive.mid || 0;
      material.uniforms.uHigh.value = props.audioReactive.high || 0;
    } else {
      material.uniforms.uBass.value = 0;
      material.uniforms.uMid.value = 0;
      material.uniforms.uHigh.value = 0;
    }
  });
}

