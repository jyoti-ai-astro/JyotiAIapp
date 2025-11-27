/**
 * Blessing Engine
 * 
 * Phase 2 — Section 13: ACCESSIBILITY & MOTION SAFETY LAYER v1.0
 * Blessing Wave Engine (E16)
 * 
 * Creates mesh/material for blessing wave ring
 */

import * as THREE from 'three';
import { blessingVertexShader } from './shaders/blessing-vertex';
import { blessingFragmentShader } from './shaders/blessing-fragment';
import { BlessingState } from './hooks/use-blessing-uniforms';

export interface BlessingEngineConfig {
  intensity?: number;
  mouse?: { x: number; y: number };
  scroll?: number;
  parallaxStrength?: number;
}

export class BlessingEngine {
  private geometry: THREE.RingGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private config: BlessingEngineConfig;
  private isActive: boolean = false;

  constructor(config: BlessingEngineConfig = {}) {
    this.config = {
      intensity: config.intensity || 1.0,
      mouse: config.mouse || { x: 0, y: 0 },
      scroll: config.scroll || 0,
      parallaxStrength: config.parallaxStrength || 1.0,
    };
    
    // Create ring geometry (expanding ring)
    this.geometry = new THREE.RingGeometry(0.1, 1.0, 64, 1);
    
    // Create shader material
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uWaveProgress: { value: 0 },
        uScroll: { value: 0 },
        uBass: { value: 0 },
        uMid: { value: 0 },
        uHigh: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uIntensity: { value: this.config.intensity },
        uParallaxStrength: { value: this.config.parallaxStrength },
      },
      vertexShader: blessingVertexShader,
      fragmentShader: blessingFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    
    // Create mesh
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.visible = false; // Hidden until wave is triggered
  }

  /**
   * Start blessing wave
   */
  waveStart(): void {
    this.isActive = true;
    this.mesh.visible = true;
    this.material.uniforms.uWaveProgress.value = 0;
  }

  /**
   * Update with blessing state
   */
  update(blessingState: BlessingState): void {
    if (!this.material.uniforms) return;
    
    // Update wave progress
    this.material.uniforms.uWaveProgress.value = blessingState.waveProgress;
    
    // Auto-deactivate when wave completes
    if (blessingState.waveProgress >= 1.0) {
      this.isActive = false;
      this.mesh.visible = false;
    } else if (blessingState.waveActive) {
      this.isActive = true;
      this.mesh.visible = true;
    }
    
    // Update scroll
    this.material.uniforms.uScroll.value = blessingState.scrollProgress;
    
    // Update audio reactive
    this.material.uniforms.uBass.value = blessingState.bassMotion;
    this.material.uniforms.uMid.value = blessingState.midMotion;
    this.material.uniforms.uHigh.value = blessingState.highMotion;
    
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
   * Get wave active state
   */
  getIsActive(): boolean {
    return this.isActive;
  }

  /**
   * Get wave progress (for bloom intensity)
   */
  getWaveProgress(): number {
    return this.material.uniforms.uWaveProgress.value;
  }

  /**
   * Set position
   */
  setPosition(x: number, y: number, z: number): void {
    this.mesh.position.set(x, y, z);
  }

  /**
   * Dispose
   */
  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}

