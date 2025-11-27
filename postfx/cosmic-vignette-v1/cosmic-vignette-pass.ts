/**
 * Cosmic Vignette v1 Pass
 * 
 * Phase 3 — Section 5: COSMIC VIGNETTE ENGINE v1
 * Cosmic Vignette Engine v1 (F5)
 * 
 * Reusable post-processing pass for @react-three/postprocessing
 */

import { Effect, BlendFunction } from 'postprocessing';
import { Uniform, Vector2 } from 'three';
import { cosmicVignetteShader } from './cosmic-vignette-shader';

export interface CosmicVignettePassConfig {
  intensity?: number;
  vignetteStrength?: number;
  vignetteRadius?: number;
  tintStrength?: number;
  bass?: number;
  mid?: number;
  high?: number;
  blessingWaveProgress?: number;
  cameraFOV?: number;
  time?: number;
  isCircular?: boolean;
}

export class CosmicVignettePass extends Effect {
  private timeUniform: Uniform;
  private intensityUniform: Uniform;
  private vignetteStrengthUniform: Uniform;
  private vignetteRadiusUniform: Uniform;
  private tintStrengthUniform: Uniform;
  private bassUniform: Uniform;
  private midUniform: Uniform;
  private highUniform: Uniform;
  private blessingWaveUniform: Uniform;
  private cameraFOVUniform: Uniform;
  private resolutionUniform: Uniform;
  private isCircularUniform: Uniform;

  constructor(config: CosmicVignettePassConfig = {}) {
    const intensity = config.intensity ?? 1.0;
    const vignetteStrength = config.vignetteStrength ?? 0.5;
    const vignetteRadius = config.vignetteRadius ?? 0.75;
    const tintStrength = config.tintStrength ?? 0.1;
    const bass = config.bass ?? 0;
    const mid = config.mid ?? 0;
    const high = config.high ?? 0;
    const blessingWaveProgress = config.blessingWaveProgress ?? 0;
    const cameraFOV = config.cameraFOV ?? 75.0;
    const time = config.time ?? 0;
    const isCircular = config.isCircular ?? false;

    // Create uniforms
    const timeUniform = new Uniform(time);
    const intensityUniform = new Uniform(intensity);
    const vignetteStrengthUniform = new Uniform(vignetteStrength);
    const vignetteRadiusUniform = new Uniform(vignetteRadius);
    const tintStrengthUniform = new Uniform(tintStrength);
    const bassUniform = new Uniform(bass);
    const midUniform = new Uniform(mid);
    const highUniform = new Uniform(high);
    const blessingWaveUniform = new Uniform(blessingWaveProgress);
    const cameraFOVUniform = new Uniform(cameraFOV);
    const resolutionUniform = new Uniform(new Vector2(1, 1));
    const isCircularUniform = new Uniform(isCircular ? 1.0 : 0.0);

    super('CosmicVignettePass', cosmicVignetteShader.fragmentShader, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map([
        ['uTime', timeUniform],
        ['uIntensity', intensityUniform],
        ['uVignetteStrength', vignetteStrengthUniform],
        ['uVignetteRadius', vignetteRadiusUniform],
        ['uTintStrength', tintStrengthUniform],
        ['uBass', bassUniform],
        ['uMid', midUniform],
        ['uHigh', highUniform],
        ['uBlessingWaveProgress', blessingWaveUniform],
        ['uCameraFOV', cameraFOVUniform],
        ['uResolution', resolutionUniform],
        ['uIsCircular', isCircularUniform],
      ]),
    });

    // Store references for updates
    this.timeUniform = timeUniform;
    this.intensityUniform = intensityUniform;
    this.vignetteStrengthUniform = vignetteStrengthUniform;
    this.vignetteRadiusUniform = vignetteRadiusUniform;
    this.tintStrengthUniform = tintStrengthUniform;
    this.bassUniform = bassUniform;
    this.midUniform = midUniform;
    this.highUniform = highUniform;
    this.blessingWaveUniform = blessingWaveUniform;
    this.cameraFOVUniform = cameraFOVUniform;
    this.resolutionUniform = resolutionUniform;
    this.isCircularUniform = isCircularUniform;
  }

  /**
   * Update time
   */
  setTime(value: number): void {
    this.timeUniform.value = value;
  }

  /**
   * Update intensity
   */
  setIntensity(value: number): void {
    this.intensityUniform.value = value;
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
   * Update vignette strength
   */
  setVignetteStrength(value: number): void {
    this.vignetteStrengthUniform.value = value;
  }

  /**
   * Update vignette radius
   */
  setVignetteRadius(value: number): void {
    this.vignetteRadiusUniform.value = value;
  }

  /**
   * Update tint strength
   */
  setTintStrength(value: number): void {
    this.tintStrengthUniform.value = value;
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

