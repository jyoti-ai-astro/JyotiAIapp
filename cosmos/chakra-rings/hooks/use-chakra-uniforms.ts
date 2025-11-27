/**
 * Chakra Uniforms Hook
 * 
 * Phase 2 — Section 5: KUNDALINI ENERGY WAVE SYSTEM
 * Chakra Glow Rings Engine (E6)
 * 
 * Manages time, scroll, audio, chakra pulse, and mouse uniforms
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface ChakraUniforms {
  uTime: { value: number };
  uBass: { value: number };
  uMid: { value: number };
  uHigh: { value: number };
  uScroll: { value: number };
  uMouse: { value: THREE.Vector2 };
  uIntensity: { value: number };
  uChakraPulse: { value: number };
  uParallaxStrength: { value: number };
}

export interface UseChakraUniformsProps {
  /** Mouse position */
  mouse?: { x: number; y: number };
  
  /** Scroll position (0-1) */
  scroll?: number;
  
  /** Intensity multiplier */
  intensity?: number;
  
  /** Parallax strength */
  parallaxStrength?: number;
  
  /** Audio reactive values */
  audioReactive?: {
    bass?: number;
    mid?: number;
    high?: number;
  };
}

export function useChakraUniforms(
  material: THREE.ShaderMaterial | null,
  props: UseChakraUniformsProps
) {
  const chakraPulseRef = useRef(0);
  
  useFrame((state) => {
    if (!material || !material.uniforms) return;
    
    const time = state.clock.elapsedTime;
    
    // Time uniform
    material.uniforms.uTime.value = time;
    
    // Chakra pulse oscillator (0.5-1.2 Hz)
    const chakraPulseSpeed = 0.8;  // ~0.8 Hz
    chakraPulseRef.current = Math.sin(time * chakraPulseSpeed * 2.0 * Math.PI) * 0.5 + 0.5;
    material.uniforms.uChakraPulse.value = chakraPulseRef.current;
    
    // Scroll mapping
    material.uniforms.uScroll.value = props.scroll || 0;
    
    // Intensity
    material.uniforms.uIntensity.value = props.intensity || 1.0;
    
    // Parallax strength
    material.uniforms.uParallaxStrength.value = props.parallaxStrength || 1.0;
    
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

