/**
 * Cosmic GrainOverlay v1 Engine
 * 
 * Phase 3 — Section 9: COSMIC GRAINOVERLAY ENGINE v1
 * Cosmic GrainOverlay Engine v1 (F9)
 * 
 * Ultra-fine film grain + cosmic dust overlay engine
 */

import * as THREE from 'three';
import { Uniform, Vector2 } from 'three';
import { cosmicGrainOverlayShader } from './cosmic-grainoverlay-shader';

export interface CosmicGrainOverlayEngineConfig {
  overlayIntensity?: number;
  dustDensity?: number;
  shimmerStrength?: number;
  isMobile?: boolean;
}

export class CosmicGrainOverlayEngine {
  private config: CosmicGrainOverlayEngineConfig;
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private quad: THREE.Mesh;
  
  // Uniforms
  private uniforms: {
    uTime: Uniform;
    uIntensity: Uniform;
    uOverlayIntensity: Uniform;
    uDustDensity: Uniform;
    uShimmerStrength: Uniform;
    uBass: Uniform;
    uMid: Uniform;
    uHigh: Uniform;
    uBlessingWaveProgress: Uniform;
    uCameraFOV: Uniform;
    uResolution: Uniform;
    uDisableChroma: Uniform;
    uDustCount: Uniform;
  };

  constructor(config: CosmicGrainOverlayEngineConfig = {}) {
    this.config = {
      overlayIntensity: config.overlayIntensity || 0.08,
      dustDensity: config.dustDensity || 0.5,
      shimmerStrength: config.shimmerStrength || 0.1,
      isMobile: config.isMobile || false,
    };

    // Mobile fallback: disable chroma noise, reduce dust count by 50%
    const dustCount = this.config.isMobile 
      ? (this.config.dustDensity || 0.5) * 0.5 * 50.0 
      : (this.config.dustDensity || 0.5) * 50.0;
    const disableChroma = this.config.isMobile ? 1.0 : 0.0;

    // Create uniforms
    this.uniforms = {
      uTime: new Uniform(0),
      uIntensity: new Uniform(1.0),
      uOverlayIntensity: new Uniform(this.config.overlayIntensity),
      uDustDensity: new Uniform(this.config.dustDensity),
      uShimmerStrength: new Uniform(this.config.shimmerStrength),
      uBass: new Uniform(0),
      uMid: new Uniform(0),
      uHigh: new Uniform(0),
      uBlessingWaveProgress: new Uniform(0),
      uCameraFOV: new Uniform(75.0),
      uResolution: new Uniform(new Vector2(1, 1)),
      uDisableChroma: new Uniform(disableChroma),
      uDustCount: new Uniform(dustCount),
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
   * Set overlay intensity
   */
  setOverlayIntensity(value: number): void {
    this.uniforms.uOverlayIntensity.value = value;
  }

  /**
   * Set dust density
   */
  setDustDensity(value: number): void {
    this.uniforms.uDustDensity.value = value;
  }

  /**
   * Set shimmer strength
   */
  setShimmerStrength(value: number): void {
    this.uniforms.uShimmerStrength.value = value;
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    this.quad.geometry.dispose();
  }
}

