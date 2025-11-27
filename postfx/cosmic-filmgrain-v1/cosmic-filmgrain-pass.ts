/**
 * Cosmic FilmGrain v1 Pass
 * 
 * Phase 3 — Section 6: COSMIC FILMGRAIN ENGINE v1
 * Cosmic FilmGrain Engine v1 (F6)
 * 
 * Reusable post-processing pass for @react-three/postprocessing
 */

import { Effect, BlendFunction } from 'postprocessing';
import { Uniform, Vector2 } from 'three';
import { cosmicFilmGrainShader } from './cosmic-filmgrain-shader';

export interface CosmicFilmGrainPassConfig {
  intensity?: number;
  grainIntensity?: number;
  chromaIntensity?: number;
  flickerStrength?: number;
  bass?: number;
  mid?: number;
  high?: number;
  blessingWaveProgress?: number;
  cameraFOV?: number;
  time?: number;
  grainSize?: number;
  disableChroma?: boolean;
}

export class CosmicFilmGrainPass extends Effect {
  private timeUniform: Uniform;
  private intensityUniform: Uniform;
  private grainIntensityUniform: Uniform;
  private chromaIntensityUniform: Uniform;
  private flickerStrengthUniform: Uniform;
  private bassUniform: Uniform;
  private midUniform: Uniform;
  private highUniform: Uniform;
  private blessingWaveUniform: Uniform;
  private cameraFOVUniform: Uniform;
  private resolutionUniform: Uniform;
  private grainSizeUniform: Uniform;
  private disableChromaUniform: Uniform;

  constructor(config: CosmicFilmGrainPassConfig = {}) {
    const intensity = config.intensity ?? 1.0;
    const grainIntensity = config.grainIntensity ?? 0.15;
    const chromaIntensity = config.chromaIntensity ?? 0.1;
    const flickerStrength = config.flickerStrength ?? 0.05;
    const bass = config.bass ?? 0;
    const mid = config.mid ?? 0;
    const high = config.high ?? 0;
    const blessingWaveProgress = config.blessingWaveProgress ?? 0;
    const cameraFOV = config.cameraFOV ?? 75.0;
    const time = config.time ?? 0;
    const grainSize = config.grainSize ?? 1.0;
    const disableChroma = config.disableChroma ?? false;

    // Create uniforms
    const timeUniform = new Uniform(time);
    const intensityUniform = new Uniform(intensity);
    const grainIntensityUniform = new Uniform(grainIntensity);
    const chromaIntensityUniform = new Uniform(chromaIntensity);
    const flickerStrengthUniform = new Uniform(flickerStrength);
    const bassUniform = new Uniform(bass);
    const midUniform = new Uniform(mid);
    const highUniform = new Uniform(high);
    const blessingWaveUniform = new Uniform(blessingWaveProgress);
    const cameraFOVUniform = new Uniform(cameraFOV);
    const resolutionUniform = new Uniform(new Vector2(1, 1));
    const grainSizeUniform = new Uniform(grainSize);
    const disableChromaUniform = new Uniform(disableChroma ? 1.0 : 0.0);

    super('CosmicFilmGrainPass', cosmicFilmGrainShader.fragmentShader, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map([
        ['uTime', timeUniform],
        ['uIntensity', intensityUniform],
        ['uGrainIntensity', grainIntensityUniform],
        ['uChromaIntensity', chromaIntensityUniform],
        ['uFlickerStrength', flickerStrengthUniform],
        ['uBass', bassUniform],
        ['uMid', midUniform],
        ['uHigh', highUniform],
        ['uBlessingWaveProgress', blessingWaveUniform],
        ['uCameraFOV', cameraFOVUniform],
        ['uResolution', resolutionUniform],
        ['uGrainSize', grainSizeUniform],
        ['uDisableChroma', disableChromaUniform],
      ]),
    });

    // Store references for updates
    this.timeUniform = timeUniform;
    this.intensityUniform = intensityUniform;
    this.grainIntensityUniform = grainIntensityUniform;
    this.chromaIntensityUniform = chromaIntensityUniform;
    this.flickerStrengthUniform = flickerStrengthUniform;
    this.bassUniform = bassUniform;
    this.midUniform = midUniform;
    this.highUniform = highUniform;
    this.blessingWaveUniform = blessingWaveUniform;
    this.cameraFOVUniform = cameraFOVUniform;
    this.resolutionUniform = resolutionUniform;
    this.grainSizeUniform = grainSizeUniform;
    this.disableChromaUniform = disableChromaUniform;
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
   * Update grain intensity
   */
  setGrainIntensity(value: number): void {
    this.grainIntensityUniform.value = value;
  }

  /**
   * Update chroma intensity
   */
  setChromaIntensity(value: number): void {
    this.chromaIntensityUniform.value = value;
  }

  /**
   * Update flicker strength
   */
  setFlickerStrength(value: number): void {
    this.flickerStrengthUniform.value = value;
  }

  /**
   * Update grain size
   */
  setGrainSize(value: number): void {
    this.grainSizeUniform.value = value;
  }

  /**
   * Update disable chroma flag
   */
  setDisableChroma(value: boolean): void {
    this.disableChromaUniform.value = value ? 1.0 : 0.0;
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

