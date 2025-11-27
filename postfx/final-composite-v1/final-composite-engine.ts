/**
 * Final Composite v1 Engine
 * 
 * Phase 3 — Section 15: FINAL COMPOSITE ENGINE v1
 * Final Composite Engine v1 (F15)
 * 
 * Master compositor & final output stabilizer engine
 */

import * as THREE from 'three';
const { Uniform, Vector2 } = THREE;



import { finalCompositeShader } from './final-composite-shader';

export interface FinalCompositeEngineConfig {
  exposure?: number;
  fade?: number;
  vibrance?: number;
  highlightRepair?: number;
  ditherStrength?: number;
  lift?: number;
  gamma?: number;
  gain?: number;
  mobileFallback?: boolean;
}

export class FinalCompositeEngine {
  private config: FinalCompositeEngineConfig;
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
    uExposure: Uniform;
    uFade: Uniform;
    uResolution: Uniform;
    uVibrance: Uniform;
    uHighlightRepair: Uniform;
    uDitherStrength: Uniform;
    uLift: Uniform;
    uGamma: Uniform;
    uGain: Uniform;
  };

  constructor(config: FinalCompositeEngineConfig = {}) {
    this.config = {
      exposure: config.exposure || 1.0,
      fade: config.fade || 1.0,
      vibrance: config.vibrance || 1.0,
      highlightRepair: config.highlightRepair || 0.5,
      ditherStrength: config.ditherStrength || 0.5,
      lift: config.lift || 0.0,
      gamma: config.gamma || 1.0,
      gain: config.gain || 1.0,
      mobileFallback: config.mobileFallback || false,
    };

    // Mobile fallback: reduce vibrance + reduce highlight repair strength
    const vibrance = this.config.mobileFallback 
      ? (this.config.vibrance || 1.0) * 0.8 
      : (this.config.vibrance || 1.0);
    const highlightRepair = this.config.mobileFallback 
      ? (this.config.highlightRepair || 0.5) * 0.7 
      : (this.config.highlightRepair || 0.5);

    // Create uniforms
    this.uniforms = {
      uTime: new Uniform(0),
      uIntensity: new Uniform(1.0),
      uBass: new Uniform(0),
      uMid: new Uniform(0),
      uHigh: new Uniform(0),
      uBlessingWaveProgress: new Uniform(0),
      uCameraFOV: new Uniform(75.0),
      uExposure: new Uniform(this.config.exposure),
      uFade: new Uniform(this.config.fade),
      uResolution: new Uniform(new Vector2(1, 1)),
      uVibrance: new Uniform(vibrance),
      uHighlightRepair: new Uniform(highlightRepair),
      uDitherStrength: new Uniform(this.config.ditherStrength),
      uLift: new Uniform(this.config.lift),
      uGamma: new Uniform(this.config.gamma),
      uGain: new Uniform(this.config.gain),
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
    exposure: number,
    fade: number
  ): void {
    this.uniforms.uTime.value = time;
    this.uniforms.uBass.value = bass;
    this.uniforms.uMid.value = mid;
    this.uniforms.uHigh.value = high;
    this.uniforms.uBlessingWaveProgress.value = blessingWaveProgress;
    this.uniforms.uCameraFOV.value = cameraFOV;
    this.uniforms.uResolution.value = resolution;
    this.uniforms.uExposure.value = exposure;
    this.uniforms.uFade.value = fade;
  }

  /**
   * Set exposure
   */
  setExposure(value: number): void {
    this.uniforms.uExposure.value = value;
  }

  /**
   * Set fade
   */
  setFade(value: number): void {
    this.uniforms.uFade.value = value;
  }

  /**
   * Set vibrance
   */
  setVibrance(value: number): void {
    this.uniforms.uVibrance.value = value;
  }

  /**
   * Set highlight repair
   */
  setHighlightRepair(value: number): void {
    this.uniforms.uHighlightRepair.value = value;
  }

  /**
   * Set dither strength
   */
  setDitherStrength(value: number): void {
    this.uniforms.uDitherStrength.value = value;
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    this.quad.geometry.dispose();
  }
}

