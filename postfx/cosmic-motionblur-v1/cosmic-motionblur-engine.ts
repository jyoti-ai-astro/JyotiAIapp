/**
 * Cosmic MotionBlur v1 Engine
 * 
 * Phase 3 — Section 12: COSMIC MOTIONBLUR ENGINE v1
 * Cosmic MotionBlur Engine v1 (F12)
 * 
 * Screen-space velocity blur + radial acceleration blur engine
 */

import * as THREE from 'three';
import { Uniform, Vector2 } from 'three';
import { cosmicMotionBlurShader } from './cosmic-motionblur-shader';

export interface CosmicMotionBlurEngineConfig {
  blurStrength?: number;
  radialStrength?: number;
  velocityFactor?: number;
  sampleCount?: number;
  isMobile?: boolean;
}

export class CosmicMotionBlurEngine {
  private config: CosmicMotionBlurEngineConfig;
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private quad: THREE.Mesh;
  
  // Uniforms
  private uniforms: {
    uTime: Uniform;
    uBlurStrength: Uniform;
    uRadialStrength: Uniform;
    uVelocityFactor: Uniform;
    uSampleCount: Uniform;
    uBass: Uniform;
    uMid: Uniform;
    uHigh: Uniform;
    uScrollVelocity: Uniform;
    uMouseVelocity: Uniform;
    uBlessingWaveProgress: Uniform;
    uCameraFOV: Uniform;
    uResolution: Uniform;
    uDisableDepthAware: Uniform;
  };

  constructor(config: CosmicMotionBlurEngineConfig = {}) {
    this.config = {
      blurStrength: config.blurStrength || 0.5,
      radialStrength: config.radialStrength || 0.3,
      velocityFactor: config.velocityFactor || 1.0,
      sampleCount: config.sampleCount || 16.0,
      isMobile: config.isMobile || false,
    };

    // Mobile fallback: reduce kernel samples by 50%, disable depth-aware blur
    const sampleCount = this.config.isMobile 
      ? (this.config.sampleCount || 16.0) / 2.0 
      : (this.config.sampleCount || 16.0);
    const disableDepthAware = this.config.isMobile ? 1.0 : 0.0;

    // Create uniforms
    this.uniforms = {
      uTime: new Uniform(0),
      uBlurStrength: new Uniform(this.config.blurStrength),
      uRadialStrength: new Uniform(this.config.radialStrength),
      uVelocityFactor: new Uniform(this.config.velocityFactor),
      uSampleCount: new Uniform(sampleCount),
      uBass: new Uniform(0),
      uMid: new Uniform(0),
      uHigh: new Uniform(0),
      uScrollVelocity: new Uniform(new Vector2(0, 0)),
      uMouseVelocity: new Uniform(new Vector2(0, 0)),
      uBlessingWaveProgress: new Uniform(0),
      uCameraFOV: new Uniform(75.0),
      uResolution: new Uniform(new Vector2(1, 1)),
      uDisableDepthAware: new Uniform(disableDepthAware),
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
    scrollVelocity: Vector2,
    mouseVelocity: Vector2,
    blessingWaveProgress: number,
    cameraFOV: number,
    resolution: Vector2
  ): void {
    this.uniforms.uTime.value = time;
    this.uniforms.uBass.value = bass;
    this.uniforms.uMid.value = mid;
    this.uniforms.uHigh.value = high;
    this.uniforms.uScrollVelocity.value = scrollVelocity;
    this.uniforms.uMouseVelocity.value = mouseVelocity;
    this.uniforms.uBlessingWaveProgress.value = blessingWaveProgress;
    this.uniforms.uCameraFOV.value = cameraFOV;
    this.uniforms.uResolution.value = resolution;
  }

  /**
   * Set blur strength
   */
  setBlurStrength(value: number): void {
    this.uniforms.uBlurStrength.value = value;
  }

  /**
   * Set radial strength
   */
  setRadialStrength(value: number): void {
    this.uniforms.uRadialStrength.value = value;
  }

  /**
   * Set velocity factor
   */
  setVelocityFactor(value: number): void {
    this.uniforms.uVelocityFactor.value = value;
  }

  /**
   * Set sample count
   */
  setSampleCount(value: number): void {
    this.uniforms.uSampleCount.value = value;
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    this.quad.geometry.dispose();
  }
}

