/**
 * Grid Uniforms Hook
 * 
 * Phase 2 — Section 5: KUNDALINI ENERGY WAVE SYSTEM
 * Divine Alignment Grid Engine (E9)
 * 
 * Manages time, scroll, audio, and mouse uniforms for grid shader
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface GridUniforms {
  uTime: { value: number };
  uBass: { value: number };
  uMid: { value: number };
  uHigh: { value: number };
  uScroll: { value: number };
  uMouse: { value: THREE.Vector2 };
  uIntensity: { value: number };
  uParallaxStrength: { value: number };
  uLayerType: { value: number };
}

export interface UseGridUniformsProps {
  /** Mouse position */
  mouse?: { x: number; y: number };
  
  /** Scroll position (0-1) */
  scroll?: number;
  
  /** Intensity multiplier */
  intensity?: number;
  
  /** Parallax strength */
  parallaxStrength?: number;
  
  /** Layer type (0: Sacred Geometry, 1: Mandala, 2: Radiant) */
  layerType?: number;
  
  /** Audio reactive values */
  audioReactive?: {
    bass?: number;
    mid?: number;
    high?: number;
  };
}

export function useGridUniforms(
  material: THREE.ShaderMaterial | null,
  props: UseGridUniformsProps
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
    
    // Layer type
    material.uniforms.uLayerType.value = props.layerType || 0;
    
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

