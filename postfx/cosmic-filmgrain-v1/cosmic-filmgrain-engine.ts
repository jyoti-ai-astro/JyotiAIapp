/**
 * Cosmic FilmGrain v1 Engine
 * 
 * Phase 3 — Section 6: COSMIC FILMGRAIN ENGINE v1
 * Cosmic FilmGrain Engine v1 (F6)
 * 
 * Analog film grain + dithering + chroma noise + cosmic flicker engine
 */

import * as THREE from 'three';
const { Uniform, Vector2 } = THREE;



import { cosmicFilmGrainShader } from './cosmic-filmgrain-shader';

export interface CosmicFilmGrainEngineConfig {
  grainIntensity?: number;
  chromaIntensity?: number;
  flickerStrength?: number;
  isMobile?: boolean;
}

export class CosmicFilmGrainEngine {
  private config: CosmicFilmGrainEngineConfig;
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private quad: THREE.Mesh;
  
  // Uniforms
  private uniforms: {
    uTime: Uniform;
    uIntensity: Uniform;
    uGrainIntensity: Uniform;
    uChromaIntensity: Uniform;
    uFlickerStrength: Uniform;
    uBass: Uniform;
    uMid: Uniform;
    uHigh: Uniform;
    uBlessingWaveProgress: Uniform;
    uCameraFOV: Uniform;
    uResolution: Uniform;
    uGrainSize: Uniform;
    uDisableChroma: Uniform;
  };

  constructor(config: CosmicFilmGrainEngineConfig = {}) {
    this.config = {
      grainIntensity: config.grainIntensity || 0.15,
      chromaIntensity: config.chromaIntensity || 0.1,
      flickerStrength: config.flickerStrength || 0.05,
      isMobile: config.isMobile || false,
    };

    // Mobile fallback: reduce grain size & disable chroma-noise
    const grainSize = this.config.isMobile ? 2.0 : 1.0;
    const chromaIntensity = this.config.isMobile 
      ? (this.config.chromaIntensity || 0.1) * 0.5 
      : (this.config.chromaIntensity || 0.1);

    // Create uniforms
    this.uniforms = {
      uTime: new Uniform(0),
      uIntensity: new Uniform(1.0),
      uGrainIntensity: new Uniform(this.config.grainIntensity),
      uChromaIntensity: new Uniform(chromaIntensity),
      uFlickerStrength: new Uniform(this.config.flickerStrength),
      uBass: new Uniform(0),
      uMid: new Uniform(0),
      uHigh: new Uniform(0),
      uBlessingWaveProgress: new Uniform(0),
      uCameraFOV: new Uniform(75.0),
      uResolution: new Uniform(new Vector2(1, 1)),
      uGrainSize: new Uniform(grainSize),
      uDisableChroma: new Uniform(this.config.isMobile ? 1.0 : 0.0),
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
   * Set grain intensity
   */
  setGrainIntensity(value: number): void {
    this.uniforms.uGrainIntensity.value = value;
  }

  /**
   * Set chroma intensity
   */
  setChromaIntensity(value: number): void {
    this.uniforms.uChromaIntensity.value = value;
  }

  /**
   * Set flicker strength
   */
  setFlickerStrength(value: number): void {
    this.uniforms.uFlickerStrength.value = value;
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    this.quad.geometry.dispose();
  }
}

