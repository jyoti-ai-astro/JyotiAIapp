/**
 * Cosmic Starlight v1 Engine
 * 
 * Phase 3 — Section 10: COSMIC STARLIGHT ENGINE v1
 * Cosmic Starlight Engine v1 (F10)
 * 
 * Shimmering star-field overlay + micro-twinkle shimmer engine
 */

import * as THREE from 'three';
const { Uniform, Vector2 } = THREE;



import { cosmicStarlightShader } from './cosmic-starlight-shader';

export interface CosmicStarlightEngineConfig {
  starIntensity?: number;
  twinkleStrength?: number;
  layerDensity?: number;
  isMobile?: boolean;
}

export class CosmicStarlightEngine {
  private config: CosmicStarlightEngineConfig;
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private quad: THREE.Mesh;
  
  // Uniforms
  private uniforms: {
    uTime: Uniform;
    uStarIntensity: Uniform;
    uTwinkleStrength: Uniform;
    uLayerDensity: Uniform;
    uBass: Uniform;
    uMid: Uniform;
    uHigh: Uniform;
    uBlessingWaveProgress: Uniform;
    uMouse: Uniform;
    uCameraFOV: Uniform;
    uResolution: Uniform;
    uDisableParallax: Uniform;
    uStarCount: Uniform;
  };

  constructor(config: CosmicStarlightEngineConfig = {}) {
    this.config = {
      starIntensity: config.starIntensity || 0.3,
      twinkleStrength: config.twinkleStrength || 0.5,
      layerDensity: config.layerDensity || 1.0,
      isMobile: config.isMobile || false,
    };

    // Mobile fallback: reduce star count by 50%, disable parallax
    const starCount = this.config.isMobile 
      ? 200.0 * 0.5 
      : 200.0;
    const layerDensity = this.config.isMobile 
      ? (this.config.layerDensity || 1.0) * 0.5 
      : (this.config.layerDensity || 1.0);
    const disableParallax = this.config.isMobile ? 1.0 : 0.0;

    // Create uniforms
    this.uniforms = {
      uTime: new Uniform(0),
      uStarIntensity: new Uniform(this.config.starIntensity),
      uTwinkleStrength: new Uniform(this.config.twinkleStrength),
      uLayerDensity: new Uniform(layerDensity),
      uBass: new Uniform(0),
      uMid: new Uniform(0),
      uHigh: new Uniform(0),
      uBlessingWaveProgress: new Uniform(0),
      uMouse: new Uniform(new Vector2(0.5, 0.5)),
      uCameraFOV: new Uniform(75.0),
      uResolution: new Uniform(new Vector2(1, 1)),
      uDisableParallax: new Uniform(disableParallax),
      uStarCount: new Uniform(starCount),
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
    mouse: Vector2,
    cameraFOV: number,
    resolution: Vector2
  ): void {
    this.uniforms.uTime.value = time;
    this.uniforms.uBass.value = bass;
    this.uniforms.uMid.value = mid;
    this.uniforms.uHigh.value = high;
    this.uniforms.uBlessingWaveProgress.value = blessingWaveProgress;
    this.uniforms.uMouse.value = mouse;
    this.uniforms.uCameraFOV.value = cameraFOV;
    this.uniforms.uResolution.value = resolution;
  }

  /**
   * Set star intensity
   */
  setStarIntensity(value: number): void {
    this.uniforms.uStarIntensity.value = value;
  }

  /**
   * Set twinkle strength
   */
  setTwinkleStrength(value: number): void {
    this.uniforms.uTwinkleStrength.value = value;
  }

  /**
   * Set layer density
   */
  setLayerDensity(value: number): void {
    this.uniforms.uLayerDensity.value = value;
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    this.quad.geometry.dispose();
  }
}

