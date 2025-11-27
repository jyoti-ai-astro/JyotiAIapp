/**
 * Guru Engine
 * 
 * Phase 2 — Section 11: PAGE-LEVEL WORLD COMPOSITION ENGINE v1.0
 * Phase 2 — Section 12: PERFORMANCE, FALLBACKS & MOBILE STRATEGY v1.0
 * Guru Avatar Energy System (E15)
 * 
 * Creates mesh/material and applies guruState uniforms
 */

import * as THREE from 'three';
import { guruVertexShader } from './shaders/guru-vertex';
import { guruFragmentShader } from './shaders/guru-fragment';
import { GuruState } from './hooks/use-guru-sync';

export interface GuruEngineConfig {
  intensity?: number;
  mouse?: { x: number; y: number };
  scroll?: number;
  parallaxStrength?: number;
}

export class GuruEngine {
  private geometry: THREE.SphereGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private config: GuruEngineConfig;
  
  private blessingWaveCallback?: () => void;

  constructor(config: GuruEngineConfig = {}) {
    this.config = {
      intensity: config.intensity || 1.0,
      mouse: config.mouse || { x: 0, y: 0 },
      scroll: config.scroll || 0,
      parallaxStrength: config.parallaxStrength || 1.0,
    };
    
    // Create geometry (sphere for guru avatar)
    this.geometry = new THREE.SphereGeometry(1.0, 32, 32);
    
    // Create shader material
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uBreathProgress: { value: 0 },
        uBreathStrength: { value: 0 },
        uEyeOpen: { value: 0.3 },
        uEyeGlow: { value: 0.2 },
        uEyeShimmer: { value: 0 },
        uHaloPulse: { value: 0 },
        uGlowIntensity: { value: 0 },
        uTurbulence: { value: 0 },
        uShimmer: { value: 0 },
        uSparkles: { value: 0 },
        uScroll: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uIntensity: { value: this.config.intensity },
        uParallaxStrength: { value: this.config.parallaxStrength },
      },
      vertexShader: guruVertexShader,
      fragmentShader: guruFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    
    // Create mesh
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  /**
   * Update with guru state
   */
  update(guruState: GuruState): void {
    if (!this.material.uniforms) return;
    
    // Update uniforms
    this.material.uniforms.uTime.value = guruState.time;
    this.material.uniforms.uBreathProgress.value = guruState.breathProgress;
    this.material.uniforms.uBreathStrength.value = guruState.breathStrength;
    this.material.uniforms.uEyeOpen.value = guruState.eyeOpen;
    this.material.uniforms.uEyeGlow.value = guruState.eyeGlow;
    this.material.uniforms.uEyeShimmer.value = guruState.eyeShimmer;
    this.material.uniforms.uHaloPulse.value = guruState.haloPulse;
    this.material.uniforms.uGlowIntensity.value = guruState.glowIntensity;
    this.material.uniforms.uTurbulence.value = guruState.turbulence;
    this.material.uniforms.uShimmer.value = guruState.shimmer;
    this.material.uniforms.uSparkles.value = guruState.sparkles;
    this.material.uniforms.uScroll.value = guruState.scrollProgress;
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
   * Handle hover event
   */
  onHover(isHovered: boolean): void {
    // Hover state is handled by useGuruEye hook
  }

  /**
   * Handle click event (emits blessing wave)
   */
  onClick(): void {
    // Trigger blessing wave event
    if (this.blessingWaveCallback) {
      this.blessingWaveCallback();
    }
  }

  /**
   * Set blessing wave callback
   */
  setBlessingWaveCallback(callback: () => void): void {
    this.blessingWaveCallback = callback;
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

