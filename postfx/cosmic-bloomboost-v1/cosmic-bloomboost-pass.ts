/**
 * Cosmic BloomBoost v1 Pass
 * 
 * Phase 3 — Section 11: COSMIC BLOOMBOOST ENGINE v1
 * Cosmic BloomBoost Engine v1 (F11)
 * 
 * Reusable post-processing pass for @react-three/postprocessing
 */

import { Effect, BlendFunction } from 'postprocessing';
import { Uniform, Vector2 } from 'three';
import { cosmicBloomBoostShader } from './cosmic-bloomboost-shader';

export interface CosmicBloomBoostPassConfig {
  boostIntensity?: number;
  boostRadius?: number;
  threshold?: number;
  bass?: number;
  mid?: number;
  high?: number;
  blessingWaveProgress?: number;
  cameraFOV?: number;
  time?: number;
}

export class CosmicBloomBoostPass extends Effect {
  private timeUniform: Uniform;
  private boostIntensityUniform: Uniform;
  private boostRadiusUniform: Uniform;
  private thresholdUniform: Uniform;
  private bassUniform: Uniform;
  private midUniform: Uniform;
  private highUniform: Uniform;
  private blessingWaveUniform: Uniform;
  private cameraFOVUniform: Uniform;
  private resolutionUniform: Uniform;

  constructor(config: CosmicBloomBoostPassConfig = {}) {
    const boostIntensity = config.boostIntensity ?? 0.4;
    const boostRadius = config.boostRadius ?? 0.2;
    const threshold = config.threshold ?? 0.95;
    const bass = config.bass ?? 0;
    const mid = config.mid ?? 0;
    const high = config.high ?? 0;
    const blessingWaveProgress = config.blessingWaveProgress ?? 0;
    const cameraFOV = config.cameraFOV ?? 75.0;
    const time = config.time ?? 0;

    // Create uniforms
    const timeUniform = new Uniform(time);
    const boostIntensityUniform = new Uniform(boostIntensity);
    const boostRadiusUniform = new Uniform(boostRadius);
    const thresholdUniform = new Uniform(threshold);
    const bassUniform = new Uniform(bass);
    const midUniform = new Uniform(mid);
    const highUniform = new Uniform(high);
    const blessingWaveUniform = new Uniform(blessingWaveProgress);
    const cameraFOVUniform = new Uniform(cameraFOV);
    const resolutionUniform = new Uniform(new Vector2(1, 1));

    super('CosmicBloomBoostPass', cosmicBloomBoostShader.fragmentShader, {
      blendFunction: BlendFunction.ADD, // Additive blending for boost
      uniforms: new Map([
        ['uTime', timeUniform],
        ['uBoostIntensity', boostIntensityUniform],
        ['uBoostRadius', boostRadiusUniform],
        ['uThreshold', thresholdUniform],
        ['uBass', bassUniform],
        ['uMid', midUniform],
        ['uHigh', highUniform],
        ['uBlessingWaveProgress', blessingWaveUniform],
        ['uCameraFOV', cameraFOVUniform],
        ['uResolution', resolutionUniform],
      ]),
    });

    // Store references for updates
    this.timeUniform = timeUniform;
    this.boostIntensityUniform = boostIntensityUniform;
    this.boostRadiusUniform = boostRadiusUniform;
    this.thresholdUniform = thresholdUniform;
    this.bassUniform = bassUniform;
    this.midUniform = midUniform;
    this.highUniform = highUniform;
    this.blessingWaveUniform = blessingWaveUniform;
    this.cameraFOVUniform = cameraFOVUniform;
    this.resolutionUniform = resolutionUniform;
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
   * Update boost intensity
   */
  setBoostIntensity(value: number): void {
    this.boostIntensityUniform.value = value;
  }

  /**
   * Update boost radius
   */
  setBoostRadius(value: number): void {
    this.boostRadiusUniform.value = value;
  }

  /**
   * Update threshold
   */
  setThreshold(value: number): void {
    this.thresholdUniform.value = value;
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

