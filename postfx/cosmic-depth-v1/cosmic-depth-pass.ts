/**
 * Cosmic Depth v1 Pass
 * 
 * Phase 3 — Section 2: COSMIC DEPTH ENGINE v1
 * Cosmic Depth Engine v1 (F2)
 * 
 * Reusable post-processing pass for @react-three/postprocessing
 */

import { Effect, BlendFunction, EffectAttribute } from 'postprocessing';
import { Uniform, Vector2 } from 'three';
import { cosmicDepthShader } from './cosmic-depth-shader';

export interface CosmicDepthPassConfig {
  focusDistance?: number;
  aperture?: number;
  blurIntensity?: number;
  nearBlur?: number;
  farBlur?: number;
  bass?: number;
  mid?: number;
  high?: number;
  blessingWaveProgress?: number;
  cameraNear?: number;
  cameraFar?: number;
  fov?: number;
  time?: number;
  kernelSize?: number;
}

export class CosmicDepthPass extends Effect {
  private timeUniform: Uniform;
  private bassUniform: Uniform;
  private midUniform: Uniform;
  private highUniform: Uniform;
  private focusDistanceUniform: Uniform;
  private apertureUniform: Uniform;
  private blurIntensityUniform: Uniform;
  private nearBlurUniform: Uniform;
  private farBlurUniform: Uniform;
  private blessingWaveUniform: Uniform;
  private cameraNearUniform: Uniform;
  private cameraFarUniform: Uniform;
  private fovUniform: Uniform;
  private resolutionUniform: Uniform;
  private kernelSizeUniform: Uniform;

  constructor(config: CosmicDepthPassConfig = {}) {
    const focusDistance = config.focusDistance ?? 5.0;
    const aperture = config.aperture ?? 0.1;
    const blurIntensity = config.blurIntensity ?? 1.0;
    const nearBlur = config.nearBlur ?? 1.0;
    const farBlur = config.farBlur ?? 1.0;
    const bass = config.bass ?? 0;
    const mid = config.mid ?? 0;
    const high = config.high ?? 0;
    const blessingWaveProgress = config.blessingWaveProgress ?? 0;
    const cameraNear = config.cameraNear ?? 0.1;
    const cameraFar = config.cameraFar ?? 1000.0;
    const fov = config.fov ?? 75.0;
    const time = config.time ?? 0;
    const kernelSize = config.kernelSize ?? 9;

    // Create uniforms
    const timeUniform = new Uniform(time);
    const bassUniform = new Uniform(bass);
    const midUniform = new Uniform(mid);
    const highUniform = new Uniform(high);
    const focusDistanceUniform = new Uniform(focusDistance);
    const apertureUniform = new Uniform(aperture);
    const blurIntensityUniform = new Uniform(blurIntensity);
    const nearBlurUniform = new Uniform(nearBlur);
    const farBlurUniform = new Uniform(farBlur);
    const blessingWaveUniform = new Uniform(blessingWaveProgress);
    const cameraNearUniform = new Uniform(cameraNear);
    const cameraFarUniform = new Uniform(cameraFar);
    const fovUniform = new Uniform(fov);
    const resolutionUniform = new Uniform(new Vector2(1, 1));
    const kernelSizeUniform = new Uniform(kernelSize);

    super('CosmicDepthPass', cosmicDepthShader.fragmentShader, {
      blendFunction: BlendFunction.NORMAL,
      attributes: EffectAttribute.DEPTH, // Enable depth buffer access
      uniforms: new Map([
        ['uTime', timeUniform],
        ['uBass', bassUniform],
        ['uMid', midUniform],
        ['uHigh', highUniform],
        ['uFocusDistance', focusDistanceUniform],
        ['uAperture', apertureUniform],
        ['uBlurIntensity', blurIntensityUniform],
        ['uNearBlur', nearBlurUniform],
        ['uFarBlur', farBlurUniform],
        ['uBlessingWaveProgress', blessingWaveUniform],
        ['uCameraNear', cameraNearUniform],
        ['uCameraFar', cameraFarUniform],
        ['uFOV', fovUniform],
        ['uResolution', resolutionUniform],
        ['uKernelSize', kernelSizeUniform],
      ]),
    });

    // Store references for updates
    this.timeUniform = timeUniform;
    this.bassUniform = bassUniform;
    this.midUniform = midUniform;
    this.highUniform = highUniform;
    this.focusDistanceUniform = focusDistanceUniform;
    this.apertureUniform = apertureUniform;
    this.blurIntensityUniform = blurIntensityUniform;
    this.nearBlurUniform = nearBlurUniform;
    this.farBlurUniform = farBlurUniform;
    this.blessingWaveUniform = blessingWaveUniform;
    this.cameraNearUniform = cameraNearUniform;
    this.cameraFarUniform = cameraFarUniform;
    this.fovUniform = fovUniform;
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
   * Update audio reactive values
   */
  setAudioReactive(bass: number, mid: number, high: number): void {
    this.bassUniform.value = bass;
    this.midUniform.value = mid;
    this.highUniform.value = high;
  }

  /**
   * Update focus distance
   */
  setFocusDistance(value: number): void {
    this.focusDistanceUniform.value = value;
  }

  /**
   * Update blur intensity
   */
  setBlurIntensity(value: number): void {
    this.blurIntensityUniform.value = value;
  }

  /**
   * Update blessing wave progress
   */
  setBlessingWaveProgress(value: number): void {
    this.blessingWaveUniform.value = value;
  }

  /**
   * Update camera parameters
   */
  setCameraParams(near: number, far: number, fov: number): void {
    this.cameraNearUniform.value = near;
    this.cameraFarUniform.value = far;
    this.fovUniform.value = fov;
  }

  /**
   * Update resolution
   */
  setResolution(width: number, height: number): void {
    this.resolutionUniform.value.set(width, height);
  }

  /**
   * Update kernel size (for mobile fallback)
   */
  setKernelSize(value: number): void {
    this.kernelSizeUniform.value = value;
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

