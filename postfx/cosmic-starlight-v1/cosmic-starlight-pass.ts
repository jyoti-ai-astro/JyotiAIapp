/**
 * Cosmic Starlight v1 Pass
 * 
 * Phase 3 — Section 10: COSMIC STARLIGHT ENGINE v1
 * Cosmic Starlight Engine v1 (F10)
 * 
 * Reusable post-processing pass for @react-three/postprocessing
 */

import { Effect, BlendFunction } from 'postprocessing';
import { Uniform, Vector2 } from 'three';
import { cosmicStarlightShader } from './cosmic-starlight-shader';

export interface CosmicStarlightPassConfig {
  starIntensity?: number;
  twinkleStrength?: number;
  layerDensity?: number;
  bass?: number;
  mid?: number;
  high?: number;
  blessingWaveProgress?: number;
  mouse?: Vector2;
  cameraFOV?: number;
  time?: number;
  disableParallax?: boolean;
  starCount?: number;
}

export class CosmicStarlightPass extends Effect {
  private timeUniform: Uniform;
  private starIntensityUniform: Uniform;
  private twinkleStrengthUniform: Uniform;
  private layerDensityUniform: Uniform;
  private bassUniform: Uniform;
  private midUniform: Uniform;
  private highUniform: Uniform;
  private blessingWaveUniform: Uniform;
  private mouseUniform: Uniform;
  private cameraFOVUniform: Uniform;
  private resolutionUniform: Uniform;
  private disableParallaxUniform: Uniform;
  private starCountUniform: Uniform;

  constructor(config: CosmicStarlightPassConfig = {}) {
    const starIntensity = config.starIntensity ?? 0.3;
    const twinkleStrength = config.twinkleStrength ?? 0.5;
    const layerDensity = config.layerDensity ?? 1.0;
    const bass = config.bass ?? 0;
    const mid = config.mid ?? 0;
    const high = config.high ?? 0;
    const blessingWaveProgress = config.blessingWaveProgress ?? 0;
    const mouse = config.mouse ?? new Vector2(0.5, 0.5);
    const cameraFOV = config.cameraFOV ?? 75.0;
    const time = config.time ?? 0;
    const disableParallax = config.disableParallax ?? false;
    const starCount = config.starCount ?? 200.0;

    // Create uniforms
    const timeUniform = new Uniform(time);
    const starIntensityUniform = new Uniform(starIntensity);
    const twinkleStrengthUniform = new Uniform(twinkleStrength);
    const layerDensityUniform = new Uniform(layerDensity);
    const bassUniform = new Uniform(bass);
    const midUniform = new Uniform(mid);
    const highUniform = new Uniform(high);
    const blessingWaveUniform = new Uniform(blessingWaveProgress);
    const mouseUniform = new Uniform(mouse);
    const cameraFOVUniform = new Uniform(cameraFOV);
    const resolutionUniform = new Uniform(new Vector2(1, 1));
    const disableParallaxUniform = new Uniform(disableParallax ? 1.0 : 0.0);
    const starCountUniform = new Uniform(starCount);

    super('CosmicStarlightPass', cosmicStarlightShader.fragmentShader, {
      blendFunction: BlendFunction.SCREEN, // Screen blend for overlay
      uniforms: new Map([
        ['uTime', timeUniform],
        ['uStarIntensity', starIntensityUniform],
        ['uTwinkleStrength', twinkleStrengthUniform],
        ['uLayerDensity', layerDensityUniform],
        ['uBass', bassUniform],
        ['uMid', midUniform],
        ['uHigh', highUniform],
        ['uBlessingWaveProgress', blessingWaveUniform],
        ['uMouse', mouseUniform],
        ['uCameraFOV', cameraFOVUniform],
        ['uResolution', resolutionUniform],
        ['uDisableParallax', disableParallaxUniform],
        ['uStarCount', starCountUniform],
      ]),
    });

    // Store references for updates
    this.timeUniform = timeUniform;
    this.starIntensityUniform = starIntensityUniform;
    this.twinkleStrengthUniform = twinkleStrengthUniform;
    this.layerDensityUniform = layerDensityUniform;
    this.bassUniform = bassUniform;
    this.midUniform = midUniform;
    this.highUniform = highUniform;
    this.blessingWaveUniform = blessingWaveUniform;
    this.mouseUniform = mouseUniform;
    this.cameraFOVUniform = cameraFOVUniform;
    this.resolutionUniform = resolutionUniform;
    this.disableParallaxUniform = disableParallaxUniform;
    this.starCountUniform = starCountUniform;
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
   * Update mouse position
   */
  setMouse(x: number, y: number): void {
    this.mouseUniform.value.set(x, y);
  }

  /**
   * Update camera FOV
   */
  setCameraFOV(value: number): void {
    this.cameraFOVUniform.value = value;
  }

  /**
   * Update star intensity
   */
  setStarIntensity(value: number): void {
    this.starIntensityUniform.value = value;
  }

  /**
   * Update twinkle strength
   */
  setTwinkleStrength(value: number): void {
    this.twinkleStrengthUniform.value = value;
  }

  /**
   * Update layer density
   */
  setLayerDensity(value: number): void {
    this.layerDensityUniform.value = value;
  }

  /**
   * Update disable parallax flag
   */
  setDisableParallax(value: boolean): void {
    this.disableParallaxUniform.value = value ? 1.0 : 0.0;
  }

  /**
   * Update star count
   */
  setStarCount(value: number): void {
    this.starCountUniform.value = value;
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

