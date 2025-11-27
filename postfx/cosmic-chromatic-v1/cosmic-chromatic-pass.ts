/**
 * Cosmic Chromatic v1 Pass
 * 
 * Phase 3 — Section 3: COSMIC CHROMATIC ENGINE v1
 * Cosmic Chromatic Engine v1 (F3)
 * 
 * Reusable post-processing pass for @react-three/postprocessing
 */

import { Effect, BlendFunction } from 'postprocessing';
import { Uniform, Vector2 } from 'three';
import { cosmicChromaticShader } from './cosmic-chromatic-shader';

export interface CosmicChromaticPassConfig {
  intensity?: number;
  prismStrength?: number;
  warpStrength?: number;
  bass?: number;
  mid?: number;
  high?: number;
  blessingWaveProgress?: number;
  cameraFOV?: number;
  time?: number;
  globalMotion?: [number, number];
}

export class CosmicChromaticPass extends Effect {
  private timeUniform: Uniform;
  private intensityUniform: Uniform;
  private bassUniform: Uniform;
  private midUniform: Uniform;
  private highUniform: Uniform;
  private blessingWaveUniform: Uniform;
  private cameraFOVUniform: Uniform;
  private warpStrengthUniform: Uniform;
  private prismStrengthUniform: Uniform;
  private resolutionUniform: Uniform;
  private globalMotionUniform: Uniform;

  constructor(config: CosmicChromaticPassConfig = {}) {
    const intensity = config.intensity ?? 0.02;
    const prismStrength = config.prismStrength ?? 1.0;
    const warpStrength = config.warpStrength ?? 0.1;
    const bass = config.bass ?? 0;
    const mid = config.mid ?? 0;
    const high = config.high ?? 0;
    const blessingWaveProgress = config.blessingWaveProgress ?? 0;
    const cameraFOV = config.cameraFOV ?? 75.0;
    const time = config.time ?? 0;
    const globalMotion = config.globalMotion ?? [0, 0];

    // Create uniforms
    const timeUniform = new Uniform(time);
    const intensityUniform = new Uniform(intensity);
    const bassUniform = new Uniform(bass);
    const midUniform = new Uniform(mid);
    const highUniform = new Uniform(high);
    const blessingWaveUniform = new Uniform(blessingWaveProgress);
    const cameraFOVUniform = new Uniform(cameraFOV);
    const warpStrengthUniform = new Uniform(warpStrength);
    const prismStrengthUniform = new Uniform(prismStrength);
    const resolutionUniform = new Uniform(new Vector2(1, 1));
    const globalMotionUniform = new Uniform(new Vector2(globalMotion[0], globalMotion[1]));

    super('CosmicChromaticPass', cosmicChromaticShader.fragmentShader, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map([
        ['uTime', timeUniform],
        ['uIntensity', intensityUniform],
        ['uBass', bassUniform],
        ['uMid', midUniform],
        ['uHigh', highUniform],
        ['uBlessingWaveProgress', blessingWaveUniform],
        ['uCameraFOV', cameraFOVUniform],
        ['uWarpStrength', warpStrengthUniform],
        ['uPrismStrength', prismStrengthUniform],
        ['uResolution', resolutionUniform],
        ['uGlobalMotion', globalMotionUniform],
      ]),
    });

    // Store references for updates
    this.timeUniform = timeUniform;
    this.intensityUniform = intensityUniform;
    this.bassUniform = bassUniform;
    this.midUniform = midUniform;
    this.highUniform = highUniform;
    this.blessingWaveUniform = blessingWaveUniform;
    this.cameraFOVUniform = cameraFOVUniform;
    this.warpStrengthUniform = warpStrengthUniform;
    this.prismStrengthUniform = prismStrengthUniform;
    this.resolutionUniform = resolutionUniform;
    this.globalMotionUniform = globalMotionUniform;
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
   * Update warp strength
   */
  setWarpStrength(value: number): void {
    this.warpStrengthUniform.value = value;
  }

  /**
   * Update prism strength
   */
  setPrismStrength(value: number): void {
    this.prismStrengthUniform.value = value;
  }

  /**
   * Update global motion (for velocity warp)
   */
  setGlobalMotion(x: number, y: number): void {
    this.globalMotionUniform.value.set(x, y);
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

