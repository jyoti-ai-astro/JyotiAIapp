/**
 * Cosmic Vignette v1 Engine
 * 
 * Phase 3 — Section 5: COSMIC VIGNETTE ENGINE v1
 * Cosmic Vignette Engine v1 (F5)
 * 
 * Cinematic vignette + mood shading engine
 */

import * as THREE from 'three';
import { Uniform, Vector2 } from 'three';
import { cosmicVignetteShader } from './cosmic-vignette-shader';

export interface CosmicVignetteEngineConfig {
  vignetteStrength?: number;
  vignetteRadius?: number;
  colorTintStrength?: number;
  isMobile?: boolean;
}

export class CosmicVignetteEngine {
  private config: CosmicVignetteEngineConfig;
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private quad: THREE.Mesh;
  
  // Uniforms
  private uniforms: {
    uTime: Uniform;
    uIntensity: Uniform;
    uVignetteStrength: Uniform;
    uVignetteRadius: Uniform;
    uTintStrength: Uniform;
    uBass: Uniform;
    uMid: Uniform;
    uHigh: Uniform;
    uBlessingWaveProgress: Uniform;
    uCameraFOV: Uniform;
    uResolution: Uniform;
    uIsCircular: Uniform;
  };

  constructor(config: CosmicVignetteEngineConfig = {}) {
    this.config = {
      vignetteStrength: config.vignetteStrength || 0.5,
      vignetteRadius: config.vignetteRadius || 0.75,
      colorTintStrength: config.colorTintStrength || 0.1,
      isMobile: config.isMobile || false,
    };

    // Mobile fallback: reduce tintStrength and enforce circular vignette
    if (this.config.isMobile) {
      this.config.colorTintStrength = (this.config.colorTintStrength || 0.1) * 0.5;
    }

    // Create uniforms
    this.uniforms = {
      uTime: new Uniform(0),
      uIntensity: new Uniform(1.0),
      uVignetteStrength: new Uniform(this.config.vignetteStrength),
      uVignetteRadius: new Uniform(this.config.vignetteRadius),
      uTintStrength: new Uniform(this.config.colorTintStrength),
      uBass: new Uniform(0),
      uMid: new Uniform(0),
      uHigh: new Uniform(0),
      uBlessingWaveProgress: new Uniform(0),
      uCameraFOV: new Uniform(75.0),
      uResolution: new Uniform(new Vector2(1, 1)),
      uIsCircular: new Uniform(this.config.isMobile ? 1.0 : 0.0), // Circular on mobile
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
   * Set vignette strength
   */
  setVignetteStrength(value: number): void {
    this.uniforms.uVignetteStrength.value = value;
  }

  /**
   * Set vignette radius
   */
  setVignetteRadius(value: number): void {
    this.uniforms.uVignetteRadius.value = value;
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

