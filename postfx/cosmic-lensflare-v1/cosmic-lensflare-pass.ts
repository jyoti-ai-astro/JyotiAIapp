/**
 * Cosmic LensFlare v1 Pass
 * 
 * Phase 3 — Section 7: COSMIC LENSFLARE ENGINE v1
 * Cosmic LensFlare Engine v1 (F7)
 * 
 * Reusable post-processing pass for @react-three/postprocessing
 */

import { Effect, BlendFunction } from 'postprocessing';
import { Uniform, Vector2 } from 'three';
import { cosmicLensFlareShader } from './cosmic-lensflare-shader';

export interface CosmicLensFlarePassConfig {
  intensity?: number;
  flareIntensity?: number;
  ghostIntensity?: number;
  chromaStrength?: number;
  streakLength?: number;
  bass?: number;
  mid?: number;
  high?: number;
  blessingWaveProgress?: number;
  cameraFOV?: number;
  time?: number;
  ghostCount?: number;
  flareCenter?: [number, number];
}

export class CosmicLensFlarePass extends Effect {
  private timeUniform: Uniform;
  private intensityUniform: Uniform;
  private flareIntensityUniform: Uniform;
  private ghostIntensityUniform: Uniform;
  private chromaStrengthUniform: Uniform;
  private streakLengthUniform: Uniform;
  private bassUniform: Uniform;
  private midUniform: Uniform;
  private highUniform: Uniform;
  private blessingWaveUniform: Uniform;
  private cameraFOVUniform: Uniform;
  private resolutionUniform: Uniform;
  private ghostCountUniform: Uniform;
  private flareCenterUniform: Uniform;

  constructor(config: CosmicLensFlarePassConfig = {}) {
    const intensity = config.intensity ?? 1.0;
    const flareIntensity = config.flareIntensity ?? 0.3;
    const ghostIntensity = config.ghostIntensity ?? 0.2;
    const chromaStrength = config.chromaStrength ?? 0.15;
    const streakLength = config.streakLength ?? 0.5;
    const bass = config.bass ?? 0;
    const mid = config.mid ?? 0;
    const high = config.high ?? 0;
    const blessingWaveProgress = config.blessingWaveProgress ?? 0;
    const cameraFOV = config.cameraFOV ?? 75.0;
    const time = config.time ?? 0;
    const ghostCount = config.ghostCount ?? 5.0;
    const flareCenter = config.flareCenter ?? [0.5, 0.5];

    // Create uniforms
    const timeUniform = new Uniform(time);
    const intensityUniform = new Uniform(intensity);
    const flareIntensityUniform = new Uniform(flareIntensity);
    const ghostIntensityUniform = new Uniform(ghostIntensity);
    const chromaStrengthUniform = new Uniform(chromaStrength);
    const streakLengthUniform = new Uniform(streakLength);
    const bassUniform = new Uniform(bass);
    const midUniform = new Uniform(mid);
    const highUniform = new Uniform(high);
    const blessingWaveUniform = new Uniform(blessingWaveProgress);
    const cameraFOVUniform = new Uniform(cameraFOV);
    const resolutionUniform = new Uniform(new Vector2(1, 1));
    const ghostCountUniform = new Uniform(ghostCount);
    const flareCenterUniform = new Uniform(new Vector2(flareCenter[0], flareCenter[1]));

    super('CosmicLensFlarePass', cosmicLensFlareShader.fragmentShader, {
      blendFunction: BlendFunction.SCREEN, // Additive blending for flares
      uniforms: new Map([
        ['uTime', timeUniform],
        ['uIntensity', intensityUniform],
        ['uFlareIntensity', flareIntensityUniform],
        ['uGhostIntensity', ghostIntensityUniform],
        ['uChromaStrength', chromaStrengthUniform],
        ['uStreakLength', streakLengthUniform],
        ['uBass', bassUniform],
        ['uMid', midUniform],
        ['uHigh', highUniform],
        ['uBlessingWaveProgress', blessingWaveUniform],
        ['uCameraFOV', cameraFOVUniform],
        ['uResolution', resolutionUniform],
        ['uGhostCount', ghostCountUniform],
        ['uFlareCenter', flareCenterUniform],
      ]),
    });

    // Store references for updates
    this.timeUniform = timeUniform;
    this.intensityUniform = intensityUniform;
    this.flareIntensityUniform = flareIntensityUniform;
    this.ghostIntensityUniform = ghostIntensityUniform;
    this.chromaStrengthUniform = chromaStrengthUniform;
    this.streakLengthUniform = streakLengthUniform;
    this.bassUniform = bassUniform;
    this.midUniform = midUniform;
    this.highUniform = highUniform;
    this.blessingWaveUniform = blessingWaveUniform;
    this.cameraFOVUniform = cameraFOVUniform;
    this.resolutionUniform = resolutionUniform;
    this.ghostCountUniform = ghostCountUniform;
    this.flareCenterUniform = flareCenterUniform;
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
   * Update flare intensity
   */
  setFlareIntensity(value: number): void {
    this.flareIntensityUniform.value = value;
  }

  /**
   * Update ghost intensity
   */
  setGhostIntensity(value: number): void {
    this.ghostIntensityUniform.value = value;
  }

  /**
   * Update chroma strength
   */
  setChromaStrength(value: number): void {
    this.chromaStrengthUniform.value = value;
  }

  /**
   * Update streak length
   */
  setStreakLength(value: number): void {
    this.streakLengthUniform.value = value;
  }

  /**
   * Update ghost count
   */
  setGhostCount(value: number): void {
    this.ghostCountUniform.value = value;
  }

  /**
   * Update flare center
   */
  setFlareCenter(x: number, y: number): void {
    this.flareCenterUniform.value.set(x, y);
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

