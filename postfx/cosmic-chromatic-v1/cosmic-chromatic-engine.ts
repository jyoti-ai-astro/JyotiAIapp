/**
 * Cosmic Chromatic v1 Engine
 * 
 * Phase 3 — Section 3: COSMIC CHROMATIC ENGINE v1
 * Cosmic Chromatic Engine v1 (F3)
 * 
 * Chromatic aberration engine with prism fringe and velocity warp
 */

import * as THREE from 'three';
import { Uniform, Vector2 } from 'three';
import { cosmicChromaticShader } from './cosmic-chromatic-shader';

export interface CosmicChromaticEngineConfig {
  chromaIntensity?: number;
  prismStrength?: number;
  warpStrength?: number;
  isMobile?: boolean;
}

export class CosmicChromaticEngine {
  private config: CosmicChromaticEngineConfig;
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private quad: THREE.Mesh;
  
  // Uniforms
  private uniforms: {
    uTime: Uniform;
    uIntensity: Uniform;
    uBass: Uniform;
    uMid: Uniform;
    uHigh: Uniform;
    uBlessingWaveProgress: Uniform;
    uCameraFOV: Uniform;
    uWarpStrength: Uniform;
    uPrismStrength: Uniform;
    uResolution: Uniform;
    uGlobalMotion: Uniform;
  };

  constructor(config: CosmicChromaticEngineConfig = {}) {
    this.config = {
      chromaIntensity: config.chromaIntensity || 0.02,
      prismStrength: config.prismStrength || 1.0,
      warpStrength: config.warpStrength || 0.1,
      isMobile: config.isMobile || false,
    };

    // Mobile fallback: reduce RGB shift
    if (this.config.isMobile) {
      this.config.chromaIntensity = (this.config.chromaIntensity || 0.02) * 0.5;
    }

    // Create uniforms
    this.uniforms = {
      uTime: new Uniform(0),
      uIntensity: new Uniform(this.config.chromaIntensity),
      uBass: new Uniform(0),
      uMid: new Uniform(0),
      uHigh: new Uniform(0),
      uBlessingWaveProgress: new Uniform(0),
      uCameraFOV: new Uniform(75.0),
      uWarpStrength: new Uniform(this.config.warpStrength),
      uPrismStrength: new Uniform(this.config.prismStrength),
      uResolution: new Uniform(new Vector2(1, 1)),
      uGlobalMotion: new Uniform(new Vector2(0, 0)),
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
    resolution: Vector2,
    globalMotion: Vector2
  ): void {
    this.uniforms.uTime.value = time;
    this.uniforms.uBass.value = bass;
    this.uniforms.uMid.value = mid;
    this.uniforms.uHigh.value = high;
    this.uniforms.uBlessingWaveProgress.value = blessingWaveProgress;
    this.uniforms.uCameraFOV.value = cameraFOV;
    this.uniforms.uResolution.value = resolution;
    this.uniforms.uGlobalMotion.value = globalMotion;
  }

  /**
   * Set chroma intensity
   */
  setChromaIntensity(value: number): void {
    this.uniforms.uIntensity.value = value;
  }

  /**
   * Set prism strength
   */
  setPrismStrength(value: number): void {
    this.uniforms.uPrismStrength.value = value;
  }

  /**
   * Set warp strength
   */
  setWarpStrength(value: number): void {
    this.uniforms.uWarpStrength.value = value;
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    this.quad.geometry.dispose();
  }
}

