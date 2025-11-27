/**
 * Cosmic GrainOverlay v1 Pass
 * 
 * Phase 3 — Section 9: COSMIC GRAINOVERLAY ENGINE v1
 * Cosmic GrainOverlay Engine v1 (F9)
 * 
 * Reusable post-processing pass for @react-three/postprocessing
 */

import { Effect, BlendFunction } from 'postprocessing';
import { Uniform, Vector2 } from 'three';
import { cosmicGrainOverlayShader } from './cosmic-grainoverlay-shader';

export interface CosmicGrainOverlayPassConfig {
  intensity?: number;
  overlayIntensity?: number;
  dustDensity?: number;
  shimmerStrength?: number;
  bass?: number;
  mid?: number;
  high?: number;
  blessingWaveProgress?: number;
  cameraFOV?: number;
  time?: number;
  disableChroma?: boolean;
  dustCount?: number;
}

export class CosmicGrainOverlayPass extends Effect {
  private timeUniform: Uniform;
  private intensityUniform: Uniform;
  private overlayIntensityUniform: Uniform;
  private dustDensityUniform: Uniform;
  private shimmerStrengthUniform: Uniform;
  private bassUniform: Uniform;
  private midUniform: Uniform;
  private highUniform: Uniform;
  private blessingWaveUniform: Uniform;
  private cameraFOVUniform: Uniform;
  private resolutionUniform: Uniform;
  private disableChromaUniform: Uniform;
  private dustCountUniform: Uniform;

  constructor(config: CosmicGrainOverlayPassConfig = {}) {
    const intensity = config.intensity ?? 1.0;
    const overlayIntensity = config.overlayIntensity ?? 0.08;
    const dustDensity = config.dustDensity ?? 0.5;
    const shimmerStrength = config.shimmerStrength ?? 0.1;
    const bass = config.bass ?? 0;
    const mid = config.mid ?? 0;
    const high = config.high ?? 0;
    const blessingWaveProgress = config.blessingWaveProgress ?? 0;
    const cameraFOV = config.cameraFOV ?? 75.0;
    const time = config.time ?? 0;
    const disableChroma = config.disableChroma ?? false;
    const dustCount = config.dustCount ?? 50.0;

    // Create uniforms
    const timeUniform = new Uniform(time);
    const intensityUniform = new Uniform(intensity);
    const overlayIntensityUniform = new Uniform(overlayIntensity);
    const dustDensityUniform = new Uniform(dustDensity);
    const shimmerStrengthUniform = new Uniform(shimmerStrength);
    const bassUniform = new Uniform(bass);
    const midUniform = new Uniform(mid);
    const highUniform = new Uniform(high);
    const blessingWaveUniform = new Uniform(blessingWaveProgress);
    const cameraFOVUniform = new Uniform(cameraFOV);
    const resolutionUniform = new Uniform(new Vector2(1, 1));
    const disableChromaUniform = new Uniform(disableChroma ? 1.0 : 0.0);
    const dustCountUniform = new Uniform(dustCount);

    super('CosmicGrainOverlayPass', cosmicGrainOverlayShader.fragmentShader, {
      blendFunction: BlendFunction.SCREEN, // Screen blend for overlay
      uniforms: new Map([
        ['uTime', timeUniform],
        ['uIntensity', intensityUniform],
        ['uOverlayIntensity', overlayIntensityUniform],
        ['uDustDensity', dustDensityUniform],
        ['uShimmerStrength', shimmerStrengthUniform],
        ['uBass', bassUniform],
        ['uMid', midUniform],
        ['uHigh', highUniform],
        ['uBlessingWaveProgress', blessingWaveUniform],
        ['uCameraFOV', cameraFOVUniform],
        ['uResolution', resolutionUniform],
        ['uDisableChroma', disableChromaUniform],
        ['uDustCount', dustCountUniform],
      ]),
    });

    // Store references for updates
    this.timeUniform = timeUniform;
    this.intensityUniform = intensityUniform;
    this.overlayIntensityUniform = overlayIntensityUniform;
    this.dustDensityUniform = dustDensityUniform;
    this.shimmerStrengthUniform = shimmerStrengthUniform;
    this.bassUniform = bassUniform;
    this.midUniform = midUniform;
    this.highUniform = highUniform;
    this.blessingWaveUniform = blessingWaveUniform;
    this.cameraFOVUniform = cameraFOVUniform;
    this.resolutionUniform = resolutionUniform;
    this.disableChromaUniform = disableChromaUniform;
    this.dustCountUniform = dustCountUniform;
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
   * Update overlay intensity
   */
  setOverlayIntensity(value: number): void {
    this.overlayIntensityUniform.value = value;
  }

  /**
   * Update dust density
   */
  setDustDensity(value: number): void {
    this.dustDensityUniform.value = value;
  }

  /**
   * Update shimmer strength
   */
  setShimmerStrength(value: number): void {
    this.shimmerStrengthUniform.value = value;
  }

  /**
   * Update disable chroma flag
   */
  setDisableChroma(value: boolean): void {
    this.disableChromaUniform.value = value ? 1.0 : 0.0;
  }

  /**
   * Update dust count
   */
  setDustCount(value: number): void {
    this.dustCountUniform.value = value;
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

