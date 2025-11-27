/**
 * Cosmic Glare v1 Pass
 * 
 * Phase 3 — Section 4: COSMIC GLARE ENGINE v1
 * Cosmic Glare Engine v1 (F4)
 * 
 * Reusable post-processing pass for @react-three/postprocessing
 */

import { Effect, BlendFunction } from 'postprocessing';
import { Uniform, Vector2 } from 'three';
import { cosmicGlareShader } from './cosmic-glare-shader';

export interface CosmicGlarePassConfig {
  intensity?: number;
  streakLength?: number;
  starStrength?: number;
  bass?: number;
  mid?: number;
  high?: number;
  blessingWaveProgress?: number;
  cameraFOV?: number;
  time?: number;
  kernelSize?: number;
}

export class CosmicGlarePass extends Effect {
  private timeUniform: Uniform;
  private intensityUniform: Uniform;
  private bassUniform: Uniform;
  private midUniform: Uniform;
  private highUniform: Uniform;
  private blessingWaveUniform: Uniform;
  private cameraFOVUniform: Uniform;
  private streakLengthUniform: Uniform;
  private starStrengthUniform: Uniform;
  private resolutionUniform: Uniform;
  private kernelSizeUniform: Uniform;

  constructor(config: CosmicGlarePassConfig = {}) {
    const intensity = config.intensity ?? 1.0;
    const streakLength = config.streakLength ?? 0.5;
    const starStrength = config.starStrength ?? 1.0;
    const bass = config.bass ?? 0;
    const mid = config.mid ?? 0;
    const high = config.high ?? 0;
    const blessingWaveProgress = config.blessingWaveProgress ?? 0;
    const cameraFOV = config.cameraFOV ?? 75.0;
    const time = config.time ?? 0;
    const kernelSize = config.kernelSize ?? 15;

    // Create uniforms
    const timeUniform = new Uniform(time);
    const intensityUniform = new Uniform(intensity);
    const bassUniform = new Uniform(bass);
    const midUniform = new Uniform(mid);
    const highUniform = new Uniform(high);
    const blessingWaveUniform = new Uniform(blessingWaveProgress);
    const cameraFOVUniform = new Uniform(cameraFOV);
    const streakLengthUniform = new Uniform(streakLength);
    const starStrengthUniform = new Uniform(starStrength);
    const resolutionUniform = new Uniform(new Vector2(1, 1));
    const kernelSizeUniform = new Uniform(kernelSize);

    super('CosmicGlarePass', cosmicGlareShader.fragmentShader, {
      blendFunction: BlendFunction.SCREEN, // Additive blending for glare
      uniforms: new Map([
        ['uTime', timeUniform],
        ['uIntensity', intensityUniform],
        ['uBass', bassUniform],
        ['uMid', midUniform],
        ['uHigh', highUniform],
        ['uBlessingWaveProgress', blessingWaveUniform],
        ['uCameraFOV', cameraFOVUniform],
        ['uStreakLength', streakLengthUniform],
        ['uStarStrength', starStrengthUniform],
        ['uResolution', resolutionUniform],
        ['uKernelSize', kernelSizeUniform],
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
    this.streakLengthUniform = streakLengthUniform;
    this.starStrengthUniform = starStrengthUniform;
    this.resolutionUniform = resolutionUniform;
    this.kernelSizeUniform = kernelSizeUniform;
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
   * Update streak length
   */
  setStreakLength(value: number): void {
    this.streakLengthUniform.value = value;
  }

  /**
   * Update star strength
   */
  setStarStrength(value: number): void {
    this.starStrengthUniform.value = value;
  }

  /**
   * Update kernel size (for mobile fallback)
   */
  setKernelSize(value: number): void {
    this.kernelSizeUniform.value = value;
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

