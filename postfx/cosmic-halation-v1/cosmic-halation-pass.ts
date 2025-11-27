/**
 * Cosmic Halation v1 Pass
 * 
 * Phase 3 — Section 8: COSMIC HALATION ENGINE v1
 * Cosmic Halation Engine v1 (F8)
 * 
 * Reusable post-processing pass for @react-three/postprocessing
 */

import { Effect, BlendFunction } from 'postprocessing';
import { Uniform, Vector2 } from 'three';
import { cosmicHalationShader } from './cosmic-halation-shader';

export interface CosmicHalationPassConfig {
  intensity?: number;
  halationIntensity?: number;
  radius?: number;
  tintStrength?: number;
  bass?: number;
  mid?: number;
  high?: number;
  blessingWaveProgress?: number;
  cameraFOV?: number;
  time?: number;
}

export class CosmicHalationPass extends Effect {
  private timeUniform: Uniform;
  private intensityUniform: Uniform;
  private halationIntensityUniform: Uniform;
  private radiusUniform: Uniform;
  private tintStrengthUniform: Uniform;
  private bassUniform: Uniform;
  private midUniform: Uniform;
  private highUniform: Uniform;
  private blessingWaveUniform: Uniform;
  private cameraFOVUniform: Uniform;
  private resolutionUniform: Uniform;

  constructor(config: CosmicHalationPassConfig = {}) {
    const intensity = config.intensity ?? 1.0;
    const halationIntensity = config.halationIntensity ?? 0.2;
    const radius = config.radius ?? 0.3;
    const tintStrength = config.tintStrength ?? 0.15;
    const bass = config.bass ?? 0;
    const mid = config.mid ?? 0;
    const high = config.high ?? 0;
    const blessingWaveProgress = config.blessingWaveProgress ?? 0;
    const cameraFOV = config.cameraFOV ?? 75.0;
    const time = config.time ?? 0;

    // Create uniforms
    const timeUniform = new Uniform(time);
    const intensityUniform = new Uniform(intensity);
    const halationIntensityUniform = new Uniform(halationIntensity);
    const radiusUniform = new Uniform(radius);
    const tintStrengthUniform = new Uniform(tintStrength);
    const bassUniform = new Uniform(bass);
    const midUniform = new Uniform(mid);
    const highUniform = new Uniform(high);
    const blessingWaveUniform = new Uniform(blessingWaveProgress);
    const cameraFOVUniform = new Uniform(cameraFOV);
    const resolutionUniform = new Uniform(new Vector2(1, 1));

    super('CosmicHalationPass', cosmicHalationShader.fragmentShader, {
      blendFunction: BlendFunction.SCREEN, // Additive blending for halation
      uniforms: new Map([
        ['uTime', timeUniform],
        ['uIntensity', intensityUniform],
        ['uHalationIntensity', halationIntensityUniform],
        ['uRadius', radiusUniform],
        ['uTintStrength', tintStrengthUniform],
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
    this.intensityUniform = intensityUniform;
    this.halationIntensityUniform = halationIntensityUniform;
    this.radiusUniform = radiusUniform;
    this.tintStrengthUniform = tintStrengthUniform;
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
   * Update halation intensity
   */
  setHalationIntensity(value: number): void {
    this.halationIntensityUniform.value = value;
  }

  /**
   * Update diffusion radius
   */
  setRadius(value: number): void {
    this.radiusUniform.value = value;
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

