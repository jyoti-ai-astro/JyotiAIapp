/**
 * Cosmic BloomBoost v1 Engine
 * 
 * Phase 3 — Section 11: COSMIC BLOOMBOOST ENGINE v1
 * Cosmic BloomBoost Engine v1 (F11)
 * 
 * Secondary additive bloom enhancer for ultra-bright highlights engine
 */

import * as THREE from 'three';
const { Uniform, Vector2 } = THREE;



import { cosmicBloomBoostShader } from './cosmic-bloomboost-shader';

export interface CosmicBloomBoostEngineConfig {
  boostIntensity?: number;
  boostRadius?: number;
  threshold?: number;
  isMobile?: boolean;
}

export class CosmicBloomBoostEngine {
  private config: CosmicBloomBoostEngineConfig;
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private quad: THREE.Mesh;
  
  // Uniforms
  private uniforms: {
    uTime: Uniform;
    uBoostIntensity: Uniform;
    uBoostRadius: Uniform;
    uThreshold: Uniform;
    uBass: Uniform;
    uMid: Uniform;
    uHigh: Uniform;
    uBlessingWaveProgress: Uniform;
    uCameraFOV: Uniform;
    uResolution: Uniform;
  };

  constructor(config: CosmicBloomBoostEngineConfig = {}) {
    this.config = {
      boostIntensity: config.boostIntensity || 0.4,
      boostRadius: config.boostRadius || 0.2,
      threshold: config.threshold || 0.95,
      isMobile: config.isMobile || false,
    };

    // Mobile fallback: reduce glow radius by 50%, lower threshold
    const boostRadius = this.config.isMobile 
      ? (this.config.boostRadius || 0.2) * 0.5 
      : (this.config.boostRadius || 0.2);
    const threshold = this.config.isMobile 
      ? (this.config.threshold || 0.95) * 0.9 // Lower threshold on mobile
      : (this.config.threshold || 0.95);

    // Create uniforms
    this.uniforms = {
      uTime: new Uniform(0),
      uBoostIntensity: new Uniform(this.config.boostIntensity),
      uBoostRadius: new Uniform(boostRadius),
      uThreshold: new Uniform(threshold),
      uBass: new Uniform(0),
      uMid: new Uniform(0),
      uHigh: new Uniform(0),
      uBlessingWaveProgress: new Uniform(0),
      uCameraFOV: new Uniform(75.0),
      uResolution: new Uniform(new Vector2(1, 1)),
    };

    // Create scene and camera for fullscreen quad
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    
    // Create fullscreen quad
    const geometry = new THREE.PlaneGeometry(2, 2);
    this.quad = new THREE.Mesh(geometry);
    this.scene.add(this.quad);
  }

  /**
   * Update uniforms
   */
  updateUniforms(
    time: number,
    bass: number,
    mid: number,
    high: number,
    blessingWaveProgress: number,
    cameraFOV: number,
    resolution: Vector2
  ): void {
    this.uniforms.uTime.value = time;
    this.uniforms.uBass.value = bass;
    this.uniforms.uMid.value = mid;
    this.uniforms.uHigh.value = high;
    this.uniforms.uBlessingWaveProgress.value = blessingWaveProgress;
    this.uniforms.uCameraFOV.value = cameraFOV;
    this.uniforms.uResolution.value = resolution;
  }

  /**
   * Set boost intensity
   */
  setBoostIntensity(value: number): void {
    this.uniforms.uBoostIntensity.value = value;
  }

  /**
   * Set boost radius
   */
  setBoostRadius(value: number): void {
    this.uniforms.uBoostRadius.value = value;
  }

  /**
   * Set threshold
   */
  setThreshold(value: number): void {
    this.uniforms.uThreshold.value = value;
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    this.quad.geometry.dispose();
  }
}

