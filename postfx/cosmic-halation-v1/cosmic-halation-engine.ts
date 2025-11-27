/**
 * Cosmic Halation v1 Engine
 * 
 * Phase 3 — Section 8: COSMIC HALATION ENGINE v1
 * Cosmic Halation Engine v1 (F8)
 * 
 * Cinematic halation glow + red-channel bloom + film halo diffusion engine
 */

import * as THREE from 'three';
import { Uniform, Vector2 } from 'three';
import { cosmicHalationShader } from './cosmic-halation-shader';

export interface CosmicHalationEngineConfig {
  halationIntensity?: number;
  diffusionRadius?: number;
  tintStrength?: number;
  isMobile?: boolean;
}

export class CosmicHalationEngine {
  private config: CosmicHalationEngineConfig;
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private quad: THREE.Mesh;
  
  // Uniforms
  private uniforms: {
    uTime: Uniform;
    uIntensity: Uniform;
    uHalationIntensity: Uniform;
    uRadius: Uniform;
    uTintStrength: Uniform;
    uBass: Uniform;
    uMid: Uniform;
    uHigh: Uniform;
    uBlessingWaveProgress: Uniform;
    uCameraFOV: Uniform;
    uResolution: Uniform;
  };

  constructor(config: CosmicHalationEngineConfig = {}) {
    this.config = {
      halationIntensity: config.halationIntensity || 0.2,
      diffusionRadius: config.diffusionRadius || 0.3,
      tintStrength: config.tintStrength || 0.15,
      isMobile: config.isMobile || false,
    };

    // Mobile fallback: reduce diffusion radius
    const radius = this.config.isMobile 
      ? (this.config.diffusionRadius || 0.3) * 0.5 
      : (this.config.diffusionRadius || 0.3);

    // Create uniforms
    this.uniforms = {
      uTime: new Uniform(0),
      uIntensity: new Uniform(1.0),
      uHalationIntensity: new Uniform(this.config.halationIntensity),
      uRadius: new Uniform(radius),
      uTintStrength: new Uniform(this.config.tintStrength),
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
   * Set halation intensity
   */
  setHalationIntensity(value: number): void {
    this.uniforms.uHalationIntensity.value = value;
  }

  /**
   * Set diffusion radius
   */
  setDiffusionRadius(value: number): void {
    this.uniforms.uRadius.value = value;
  }

  /**
   * Set tint strength
   */
  setTintStrength(value: number): void {
    this.uniforms.uTintStrength.value = value;
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    this.quad.geometry.dispose();
  }
}

