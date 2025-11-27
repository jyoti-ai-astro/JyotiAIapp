/**
 * Cosmic GodRays v1 Pass
 * 
 * Phase 3 — Section 14: COSMIC GODRAYS ENGINE v1
 * Cosmic GodRays Engine v1 (F14)
 * 
 * Reusable post-processing pass for @react-three/postprocessing
 */

import { Effect, BlendFunction } from 'postprocessing';

import * as THREE from 'three';
const { Uniform, Vector2, Vector3 } = THREE;


import { cosmicGodRaysShader } from './cosmic-godrays-shader';

export interface CosmicGodRaysPassConfig {
  sunPos?: Vector2;
  lightDir?: Vector3;
  intensity?: number;
  scatteringStrength?: number;
  stepCount?: number;
  parallaxStrength?: number;
  bass?: number;
  mid?: number;
  high?: number;
  blessingWaveProgress?: number;
  cameraFOV?: number;
  depthTexture?: THREE.Texture | null;
  time?: number;
  mouse?: Vector2;
}

export class CosmicGodRaysPass extends Effect {
  private timeUniform: Uniform;
  private sunPosUniform: Uniform;
  private lightDirUniform: Uniform;
  private intensityUniform: Uniform;
  private bassUniform: Uniform;
  private midUniform: Uniform;
  private highUniform: Uniform;
  private blessingWaveUniform: Uniform;
  private cameraFOVUniform: Uniform;
  private depthTextureUniform: Uniform;
  private resolutionUniform: Uniform;
  private parallaxStrengthUniform: Uniform;
  private scatteringStrengthUniform: Uniform;
  private stepCountUniform: Uniform;
  private mouseUniform: Uniform;

  constructor(config: CosmicGodRaysPassConfig = {}) {
    const sunPos = config.sunPos ?? new Vector2(0.5, 0.5);
    const lightDir = config.lightDir ?? new Vector3(0.0, -1.0, 0.0);
    const intensity = config.intensity ?? 0.5;
    const scatteringStrength = config.scatteringStrength ?? 0.3;
    const stepCount = config.stepCount ?? 24.0;
    const parallaxStrength = config.parallaxStrength ?? 0.1;
    const bass = config.bass ?? 0;
    const mid = config.mid ?? 0;
    const high = config.high ?? 0;
    const blessingWaveProgress = config.blessingWaveProgress ?? 0;
    const cameraFOV = config.cameraFOV ?? 75.0;
    const depthTexture = config.depthTexture ?? null;
    const time = config.time ?? 0;
    const mouse = config.mouse ?? new Vector2(0.5, 0.5);

    // Create uniforms
    const timeUniform = new Uniform(time);
    const sunPosUniform = new Uniform(sunPos);
    const lightDirUniform = new Uniform(lightDir);
    const intensityUniform = new Uniform(intensity);
    const bassUniform = new Uniform(bass);
    const midUniform = new Uniform(mid);
    const highUniform = new Uniform(high);
    const blessingWaveUniform = new Uniform(blessingWaveProgress);
    const cameraFOVUniform = new Uniform(cameraFOV);
    const depthTextureUniform = new Uniform(depthTexture);
    const resolutionUniform = new Uniform(new Vector2(1, 1));
    const parallaxStrengthUniform = new Uniform(parallaxStrength);
    const scatteringStrengthUniform = new Uniform(scatteringStrength);
    const stepCountUniform = new Uniform(stepCount);
    const mouseUniform = new Uniform(mouse);

    super('CosmicGodRaysPass', cosmicGodRaysShader.fragmentShader, {
      blendFunction: BlendFunction.ADD, // Additive blending for god rays
      uniforms: new Map([
        ['uTime', timeUniform],
        ['uSunPos', sunPosUniform],
        ['uLightDir', lightDirUniform],
        ['uIntensity', intensityUniform],
        ['uBass', bassUniform],
        ['uMid', midUniform],
        ['uHigh', highUniform],
        ['uBlessingWaveProgress', blessingWaveUniform],
        ['uCameraFOV', cameraFOVUniform],
        ['uDepthTexture', depthTextureUniform],
        ['uResolution', resolutionUniform],
        ['uParallaxStrength', parallaxStrengthUniform],
        ['uScatteringStrength', scatteringStrengthUniform],
        ['uStepCount', stepCountUniform],
        ['uMouse', mouseUniform],
      ]),
    });

    // Store references for updates
    this.timeUniform = timeUniform;
    this.sunPosUniform = sunPosUniform;
    this.lightDirUniform = lightDirUniform;
    this.intensityUniform = intensityUniform;
    this.bassUniform = bassUniform;
    this.midUniform = midUniform;
    this.highUniform = highUniform;
    this.blessingWaveUniform = blessingWaveUniform;
    this.cameraFOVUniform = cameraFOVUniform;
    this.depthTextureUniform = depthTextureUniform;
    this.resolutionUniform = resolutionUniform;
    this.parallaxStrengthUniform = parallaxStrengthUniform;
    this.scatteringStrengthUniform = scatteringStrengthUniform;
    this.stepCountUniform = stepCountUniform;
    this.mouseUniform = mouseUniform;
  }

  /**
   * Update time
   */
  setTime(value: number): void {
    this.timeUniform.value = value;
  }

  /**
   * Update audio reactive values
   */
  setAudioReactive(bass: number, mid: number, high: number): void {
    this.bassUniform.value = bass;
    this.midUniform.value = mid;
    this.highUniform.value = high;
  }

  /**
   * Update blessing wave progress
   */
  setBlessingWaveProgress(value: number): void {
    this.blessingWaveUniform.value = value;
  }

  /**
   * Update camera FOV
   */
  setCameraFOV(value: number): void {
    this.cameraFOVUniform.value = value;
  }

  /**
   * Update depth texture
   */
  setDepthTexture(texture: THREE.Texture | null): void {
    this.depthTextureUniform.value = texture;
  }

  /**
   * Update sun position
   */
  setSunPos(x: number, y: number): void {
    this.sunPosUniform.value.set(x, y);
  }

  /**
   * Update light direction
   */
  setLightDir(x: number, y: number, z: number): void {
    this.lightDirUniform.value.set(x, y, z);
  }

  /**
   * Update intensity
   */
  setIntensity(value: number): void {
    this.intensityUniform.value = value;
  }

  /**
   * Update scattering strength
   */
  setScatteringStrength(value: number): void {
    this.scatteringStrengthUniform.value = value;
  }

  /**
   * Update step count
   */
  setStepCount(value: number): void {
    this.stepCountUniform.value = value;
  }

  /**
   * Update parallax strength
   */
  setParallaxStrength(value: number): void {
    this.parallaxStrengthUniform.value = value;
  }

  /**
   * Update mouse position
   */
  setMouse(x: number, y: number): void {
    this.mouseUniform.value.set(x, y);
  }

  /**
   * Update resolution
   */
  setResolution(width: number, height: number): void {
    this.resolutionUniform.value.set(width, height);
  }

  /**
   * Update method called each frame
   */
  update(renderer: any, inputBuffer: any, deltaTime: number): void {
    // Update time
    this.timeUniform.value += deltaTime;
    
    // Update resolution from input buffer
    if (inputBuffer) {
      const width = inputBuffer.width || 1;
      const height = inputBuffer.height || 1;
      this.resolutionUniform.value.set(width, height);
    }
  }
}

