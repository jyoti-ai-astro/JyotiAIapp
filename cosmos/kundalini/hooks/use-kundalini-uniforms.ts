/**
 * Kundalini Uniforms Hook
 * 
 * Phase 2 — Section 5: KUNDALINI ENERGY WAVE SYSTEM
 * 
 * Manages time, breath, chakra pulse, and mouse parallax uniforms
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface KundaliniUniforms {
  uTime: { value: number };
  uBreath: { value: number };
  uBass: { value: number };
  uMid: { value: number };
  uHigh: { value: number };
  uScroll: { value: number };
  uMouse: { value: THREE.Vector2 };
  uIntensity: { value: number };
  uChakraPulse: { value: number };
}

export interface UseKundaliniUniformsProps {
  /** Mouse position */
  mouse?: { x: number; y: number };
  
  /** Scroll position (0-1) */
  scroll?: number;
  
  /** Intensity multiplier */
  intensity?: number;
  
  /** Audio reactive values */
  audioReactive?: {
    bass?: number;
    mid?: number;
    high?: number;
  };
}

export function useKundaliniUniforms(
  material: THREE.ShaderMaterial | null,
  props: UseKundaliniUniformsProps
) {
  const breathRef = useRef(0);
  const chakraPulseRef = useRef(0);
  
  useFrame((state) => {
    if (!material || !material.uniforms) return;
    
    const time = state.clock.elapsedTime;
    
    // Time uniform
    material.uniforms.uTime.value = time;
    
    // Breath oscillator (slow, meditative)
    breathRef.current = time * 0.15;  // Very slow breathing
    material.uniforms.uBreath.value = breathRef.current;
    
    // Chakra pulse oscillator (0.5-1.2 Hz)
    const chakraPulseSpeed = 0.8;  // ~0.8 Hz
    chakraPulseRef.current = Math.sin(time * chakraPulseSpeed * 2.0 * Math.PI) * 0.5 + 0.5;
    material.uniforms.uChakraPulse.value = chakraPulseRef.current;
    
    // Mouse parallax mapping
    if (props.mouse) {
      material.uniforms.uMouse.value.set(
        props.mouse.x,
        props.mouse.y
      );
    }
    
    // Scroll mapping
    material.uniforms.uScroll.value = props.scroll || 0;
    
    // Intensity
    material.uniforms.uIntensity.value = props.intensity || 1.0;
    
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

