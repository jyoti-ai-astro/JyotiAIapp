/**
 * Prana Engine
 * 
 * Phase 2 — Section 18: PRANA FIELD ENGINE
 * Prana Field Engine (E22)
 * 
 * Creates 3-layer combined mesh and manages uniforms
 */

import * as THREE from 'three';
import { pranaVertexShader } from './shaders/prana-vertex';
import { pranaFragmentShader } from './shaders/prana-fragment';

export interface PranaEngineConfig {
  intensity?: number;
  mouse?: { x: number; y: number };
  parallaxStrength?: number;
}

export class PranaEngine {
  private geometry: THREE.PlaneGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private config: PranaEngineConfig;
  
  private breathPhase: number = 0;
  private breathStrength: number = 0;
  private expansionSurge: number = 0;
  private expansionSurgeDamping: number = 0.9;

  constructor(config: PranaEngineConfig = {}) {
    this.config = {
      intensity: config.intensity || 1.0,
      mouse: config.mouse || { x: 0, y: 0 },
      parallaxStrength: config.parallaxStrength || 1.0,
    };
    
    // Create plane geometry for prana field
    this.geometry = new THREE.PlaneGeometry(4.0, 4.0, 64, 64);
    
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
      vertexShader: pranaVertexShader,
      fragmentShader: pranaFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    
    // Create mesh
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.rotation.x = -Math.PI / 2; // Face upward
  }

  /**
   * Set breath phase
   */
  setBreathPhase(phase: number): void {
    this.breathPhase = phase;
    if (this.material.uniforms) {
      this.material.uniforms.uBreathPhase.value = phase;
    }
  }

  /**
   * Set breath strength
   */
  setBreathStrength(strength: number): void {
    this.breathStrength = strength;
    if (this.material.uniforms) {
      this.material.uniforms.uBreathStrength.value = strength;
    }
  }

  /**
   * Trigger expansion surge
   */
  triggerExpansionSurge(): void {
    this.expansionSurge = 1.0;
  }

  /**
   * Update with prana state
   */
  update(
    time: number,
    scrollProgress: number,
    bass: number,
    mid: number,
    high: number,
    blessingWaveProgress: number,
    deltaTime: number
  ): void {
    if (!this.material.uniforms) return;
    
    // Update time
    this.material.uniforms.uTime.value = time;
    
    // Update breath (smooth 0.3s transitions)
    const breathTransitionSpeed = 3.0; // 1 / 0.3s
    this.material.uniforms.uBreathPhase.value = this.breathPhase;
    this.material.uniforms.uBreathStrength.value = this.breathStrength;
    
    // Update audio reactive
    this.material.uniforms.uBass.value = bass;
    this.material.uniforms.uMid.value = mid;
    this.material.uniforms.uHigh.value = high;
    
    // Update scroll
    this.material.uniforms.uScroll.value = scrollProgress;
    
    // Update blessing wave
    this.material.uniforms.uBlessingWaveProgress.value = blessingWaveProgress;
    
    // Update expansion surge (decay)
    this.expansionSurge *= this.expansionSurgeDamping;
    
    // Update intensity
    this.material.uniforms.uIntensity.value = this.config.intensity || 1.0;
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

