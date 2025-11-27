/**
 * Cosmic ColorGrade v1 Engine
 * 
 * Phase 3 — Section 13: COSMIC COLORGRADE ENGINE v1
 * Cosmic ColorGrade Engine v1 (F13)
 * 
 * Cosmic ACES + LUT-based color grading engine
 */

import * as THREE from 'three';
const { Uniform, Vector2 } = THREE;



import { cosmicColorGradeShader } from './cosmic-colorgrade-shader';

export interface CosmicColorGradeEngineConfig {
  lutStrength?: number;
  temperature?: number;
  tint?: number;
  contrast?: number;
  gamma?: number;
  saturation?: number;
  vibrance?: number;
  fade?: number;
  rolloff?: number;
  isMobile?: boolean;
}

export class CosmicColorGradeEngine {
  private config: CosmicColorGradeEngineConfig;
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private quad: THREE.Mesh;
  
  // Uniforms
  private uniforms: {
    uTime: Uniform;
    uLutStrength: Uniform;
    uTemperature: Uniform;
    uTint: Uniform;
    uContrast: Uniform;
    uGamma: Uniform;
    uSaturation: Uniform;
    uVibrance: Uniform;
    uFade: Uniform;
    uRolloff: Uniform;
    uBass: Uniform;
    uMid: Uniform;
    uHigh: Uniform;
    uBlessingWaveProgress: Uniform;
    uCameraFOV: Uniform;
    uResolution: Uniform;
  };

  constructor(config: CosmicColorGradeEngineConfig = {}) {
    this.config = {
      lutStrength: config.lutStrength || 0.3,
      temperature: config.temperature || 0.0,
      tint: config.tint || 0.0,
      contrast: config.contrast || 1.0,
      gamma: config.gamma || 1.0,
      saturation: config.saturation || 1.0,
      vibrance: config.vibrance || 1.0,
      fade: config.fade || 0.0,
      rolloff: config.rolloff || 0.5,
      isMobile: config.isMobile || false,
    };

    // Mobile fallback: vibrance *= 0.5, lutStrength *= 0.7
    const vibrance = this.config.isMobile 
      ? (this.config.vibrance || 1.0) * 0.5 
      : (this.config.vibrance || 1.0);
    const lutStrength = this.config.isMobile 
      ? (this.config.lutStrength || 0.3) * 0.7 
      : (this.config.lutStrength || 0.3);

    // Create uniforms
    this.uniforms = {
      uTime: new Uniform(0),
      uLutStrength: new Uniform(lutStrength),
      uTemperature: new Uniform(this.config.temperature),
      uTint: new Uniform(this.config.tint),
      uContrast: new Uniform(this.config.contrast),
      uGamma: new Uniform(this.config.gamma),
      uSaturation: new Uniform(this.config.saturation),
      uVibrance: new Uniform(vibrance),
      uFade: new Uniform(this.config.fade),
      uRolloff: new Uniform(this.config.rolloff),
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
   * Set LUT strength
   */
  setLutStrength(value: number): void {
    this.uniforms.uLutStrength.value = value;
  }

  /**
   * Set temperature
   */
  setTemperature(value: number): void {
    this.uniforms.uTemperature.value = value;
  }

  /**
   * Set tint
   */
  setTint(value: number): void {
    this.uniforms.uTint.value = value;
  }

  /**
   * Set contrast
   */
  setContrast(value: number): void {
    this.uniforms.uContrast.value = value;
  }

  /**
   * Set gamma
   */
  setGamma(value: number): void {
    this.uniforms.uGamma.value = value;
  }

  /**
   * Set saturation
   */
  setSaturation(value: number): void {
    this.uniforms.uSaturation.value = value;
  }

  /**
   * Set vibrance
   */
  setVibrance(value: number): void {
    this.uniforms.uVibrance.value = value;
  }

  /**
   * Set fade
   */
  setFade(value: number): void {
    this.uniforms.uFade.value = value;
  }

  /**
   * Set rolloff
   */
  setRolloff(value: number): void {
    this.uniforms.uRolloff.value = value;
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    this.quad.geometry.dispose();
  }
}

