/**
 * Cosmic Bloom v1 Pass
 * 
 * Phase 3 — Section 1: COSMIC BLOOM ENGINE v1
 * Cosmic Bloom Engine v1 (F1)
 * 
 * Reusable post-processing pass for @react-three/postprocessing
 */

import { Effect, BlendFunction } from 'postprocessing';
import { Uniform, Vector2 } from 'three';
import { cosmicBloomShader } from './cosmic-bloom-shader';

export interface CosmicBloomPassConfig {
  threshold?: number;
  intensity?: number;
  bass?: number;
  mid?: number;
  high?: number;
  blessingWaveProgress?: number;
  fov?: number;
  time?: number;
}

export class CosmicBloomPass extends Effect {
  private timeUniform: Uniform;
  private highUniform: Uniform;
  private midUniform: Uniform;
  private bassUniform: Uniform;
  private thresholdUniform: Uniform;
  private intensityUniform: Uniform;
  private blessingWaveUniform: Uniform;
  private fovUniform: Uniform;
  private resolutionUniform: Uniform;

  constructor(config: CosmicBloomPassConfig = {}) {
    const threshold = config.threshold ?? 0.85;
    const intensity = config.intensity ?? 1.0;
    const bass = config.bass ?? 0;
    const mid = config.mid ?? 0;
    const high = config.high ?? 0;
    const blessingWaveProgress = config.blessingWaveProgress ?? 0;
    const fov = config.fov ?? 75.0;
    const time = config.time ?? 0;

    // Create uniforms
    const timeUniform = new Uniform(time);
    const highUniform = new Uniform(high);
    const midUniform = new Uniform(mid);
    const bassUniform = new Uniform(bass);
    const thresholdUniform = new Uniform(threshold);
    const intensityUniform = new Uniform(intensity);
    const blessingWaveUniform = new Uniform(blessingWaveProgress);
    const fovUniform = new Uniform(fov);
    const resolutionUniform = new Uniform(new Vector2(1, 1));

    super('CosmicBloomPass', cosmicBloomShader.fragmentShader, {
      blendFunction: BlendFunction.ADD, // Additive blending
      uniforms: new Map([
        ['uTime', timeUniform],
        ['uHigh', highUniform],
        ['uMid', midUniform],
        ['uBass', bassUniform],
        ['uThreshold', thresholdUniform],
        ['uIntensity', intensityUniform],
        ['uBlessingWaveProgress', blessingWaveUniform],
        ['uFOV', fovUniform],
        ['uResolution', resolutionUniform],
      ]),
    });

    // Store references for updates
    this.timeUniform = timeUniform;
    this.highUniform = highUniform;
    this.midUniform = midUniform;
    this.bassUniform = bassUniform;
    this.thresholdUniform = thresholdUniform;
    this.intensityUniform = intensityUniform;
    this.blessingWaveUniform = blessingWaveUniform;
    this.fovUniform = fovUniform;
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
   * Update intensity (motion-reactive)
   */
  setIntensity(value: number): void {
    this.intensityUniform.value = value;
  }

  /**
   * Update blessing wave progress
   */
  setBlessingWaveProgress(value: number): void {
    this.blessingWaveUniform.value = value;
  }

  /**
   * Update FOV
   */
  setFOV(value: number): void {
    this.fovUniform.value = value;
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

