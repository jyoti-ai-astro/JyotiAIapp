/**
 * Cosmic GodRays v1 Engine
 * 
 * Phase 3 — Section 14: COSMIC GODRAYS ENGINE v1
 * Cosmic GodRays Engine v1 (F14)
 * 
 * Volumetric divine light shafts with ray-marching engine
 */

import * as THREE from 'three';
import { Uniform, Vector2, Vector3 } from 'three';
import { cosmicGodRaysShader } from './cosmic-godrays-shader';

export interface CosmicGodRaysEngineConfig {
  beamIntensity?: number;
  scatteringStrength?: number;
  stepCount?: number;
  parallaxStrength?: number;
  lightDir?: Vector3;
  sunPos?: Vector2;
  isMobile?: boolean;
}

export class CosmicGodRaysEngine {
  private config: CosmicGodRaysEngineConfig;
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private quad: THREE.Mesh;
  
  // Uniforms
  private uniforms: {
    uTime: Uniform;
    uSunPos: Uniform;
    uLightDir: Uniform;
    uIntensity: Uniform;
    uBass: Uniform;
    uMid: Uniform;
    uHigh: Uniform;
    uBlessingWaveProgress: Uniform;
    uCameraFOV: Uniform;
    uDepthTexture: Uniform;
    uResolution: Uniform;
    uParallaxStrength: Uniform;
    uScatteringStrength: Uniform;
    uStepCount: Uniform;
    uMouse: Uniform;
  };

  constructor(config: CosmicGodRaysEngineConfig = {}) {
    this.config = {
      beamIntensity: config.beamIntensity || 0.5,
      scatteringStrength: config.scatteringStrength || 0.3,
      stepCount: config.stepCount || 24.0,
      parallaxStrength: config.parallaxStrength || 0.1,
      lightDir: config.lightDir || new Vector3(0.0, -1.0, 0.0),
      sunPos: config.sunPos || new Vector2(0.5, 0.5),
      isMobile: config.isMobile || false,
    };

    // Mobile fallback: reduce steps to 12, reduce scattering strength
    const stepCount = this.config.isMobile ? 12.0 : (this.config.stepCount || 24.0);
    const scatteringStrength = this.config.isMobile 
      ? (this.config.scatteringStrength || 0.3) * 0.7 
      : (this.config.scatteringStrength || 0.3);

    // Create uniforms
    this.uniforms = {
      uTime: new Uniform(0),
      uSunPos: new Uniform(this.config.sunPos),
      uLightDir: new Uniform(this.config.lightDir),
      uIntensity: new Uniform(this.config.beamIntensity),
      uBass: new Uniform(0),
      uMid: new Uniform(0),
      uHigh: new Uniform(0),
      uBlessingWaveProgress: new Uniform(0),
      uCameraFOV: new Uniform(75.0),
      uDepthTexture: new Uniform(null),
      uResolution: new Uniform(new Vector2(1, 1)),
      uParallaxStrength: new Uniform(this.config.parallaxStrength),
      uScatteringStrength: new Uniform(scatteringStrength),
      uStepCount: new Uniform(stepCount),
      uMouse: new Uniform(new Vector2(0.5, 0.5)),
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
    depthTexture: THREE.Texture | null,
    mouse: Vector2
  ): void {
    this.uniforms.uTime.value = time;
    this.uniforms.uBass.value = bass;
    this.uniforms.uMid.value = mid;
    this.uniforms.uHigh.value = high;
    this.uniforms.uBlessingWaveProgress.value = blessingWaveProgress;
    this.uniforms.uCameraFOV.value = cameraFOV;
    this.uniforms.uResolution.value = resolution;
    this.uniforms.uDepthTexture.value = depthTexture;
    this.uniforms.uMouse.value = mouse;
  }

  /**
   * Set beam intensity
   */
  setBeamIntensity(value: number): void {
    this.uniforms.uIntensity.value = value;
  }

  /**
   * Set scattering strength
   */
  setScatteringStrength(value: number): void {
    this.uniforms.uScatteringStrength.value = value;
  }

  /**
   * Set step count
   */
  setStepCount(value: number): void {
    this.uniforms.uStepCount.value = value;
  }

  /**
   * Set sun position
   */
  setSunPos(x: number, y: number): void {
    this.uniforms.uSunPos.value.set(x, y);
  }

  /**
   * Set light direction
   */
  setLightDir(x: number, y: number, z: number): void {
    this.uniforms.uLightDir.value.set(x, y, z);
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    this.quad.geometry.dispose();
  }
}

