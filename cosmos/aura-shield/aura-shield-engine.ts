/**
 * Aura Shield Engine
 * 
 * Phase 2 — Section 19: AURA SHIELD ENGINE
 * Aura Shield Engine (E23)
 * 
 * Uses SphereGeometry and handles uniform updates
 */

import * as THREE from 'three';
import { auraShieldVertexShader } from './shaders/aura-shield-vertex';
import { auraShieldFragmentShader } from './shaders/aura-shield-fragment';

export interface AuraShieldEngineConfig {
  intensity?: number;
  mouse?: { x: number; y: number };
  parallaxStrength?: number;
}

export class AuraShieldEngine {
  private geometry: THREE.SphereGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private config: AuraShieldEngineConfig;
  
  private breathPhase: number = 0;
  private breathStrength: number = 0;
  private blessingWaveProgress: number = 0;
  private pulseIntensity: number = 0;
  private pulseDamping: number = 0.9;

  constructor(config: AuraShieldEngineConfig = {}) {
    this.config = {
      intensity: config.intensity || 1.0,
      mouse: config.mouse || { x: 0, y: 0 },
      parallaxStrength: config.parallaxStrength || 1.0,
    };
    
    // Create sphere geometry (128x128 segments, mobile fallback 64)
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 800;
    const segments = isMobile ? 64 : 128;
    this.geometry = new THREE.SphereGeometry(1.2, segments, segments);
    
    // Create shader material
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uIntensity: { value: this.config.intensity },
        uBreathPhase: { value: 0 },
        uBreathStrength: { value: 0 },
        uBass: { value: 0 },
        uMid: { value: 0 },
        uHigh: { value: 0 },
        uScroll: { value: 0 },
        uBlessingWaveProgress: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uParallaxStrength: { value: this.config.parallaxStrength },
      },
      vertexShader: auraShieldVertexShader,
      fragmentShader: auraShieldFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    
    // Create mesh
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  /**
   * Set breath data
   */
  setBreath(phase: number, strength: number): void {
    this.breathPhase = phase;
    this.breathStrength = strength;
    if (this.material.uniforms) {
      this.material.uniforms.uBreathPhase.value = phase;
      this.material.uniforms.uBreathStrength.value = strength;
    }
  }

  /**
   * Set blessing wave progress
   */
  setBlessingWave(progress: number): void {
    this.blessingWaveProgress = progress;
    if (this.material.uniforms) {
      this.material.uniforms.uBlessingWaveProgress.value = progress;
    }
  }

  /**
   * Pulse shield
   */
  pulseShield(intensity: number = 1.0): void {
    this.pulseIntensity = intensity;
  }

  /**
   * Update with aura shield state
   */
  update(
    time: number,
    scrollProgress: number,
    bass: number,
    mid: number,
    high: number,
    deltaTime: number
  ): void {
    if (!this.material.uniforms) return;
    
    // Update time
    this.material.uniforms.uTime.value = time;
    
    // Update audio reactive
    this.material.uniforms.uBass.value = bass;
    this.material.uniforms.uMid.value = mid;
    this.material.uniforms.uHigh.value = high;
    
    // Update scroll
    this.material.uniforms.uScroll.value = scrollProgress;
    
    // Update pulse (decay)
    this.pulseIntensity *= this.pulseDamping;
    
    // Update intensity (with pulse)
    const finalIntensity = (this.config.intensity || 1.0) * (1.0 + this.pulseIntensity * 0.2);
    this.material.uniforms.uIntensity.value = finalIntensity;
    this.material.uniforms.uParallaxStrength.value = this.config.parallaxStrength || 1.0;
    
    // Update mouse
    if (this.config.mouse) {
      this.material.uniforms.uMouse.value.set(
        this.config.mouse.x,
        this.config.mouse.y
      );
    }
  }

  /**
   * Get mesh (for R3F)
   */
  getMesh(): THREE.Mesh {
    return this.mesh;
  }

  /**
   * Get material
   */
  getMaterial(): THREE.ShaderMaterial {
    return this.material;
  }

  /**
   * Set position
   */
  setPosition(x: number, y: number, z: number): void {
    this.mesh.position.set(x, y, z);
  }

  /**
   * Set scale
   */
  setScale(scale: number): void {
    this.mesh.scale.setScalar(scale);
  }

  /**
   * Dispose
   */
  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}

