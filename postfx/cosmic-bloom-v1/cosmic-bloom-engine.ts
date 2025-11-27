/**
 * Cosmic Bloom v1 Engine
 * 
 * Phase 3 — Section 1: COSMIC BLOOM ENGINE v1
 * Cosmic Bloom Engine v1 (F1)
 * 
 * 7-stage Gaussian pyramid bloom system with render targets
 */

import * as THREE from 'three';
import { Effect, BlendFunction } from 'postprocessing';
import { Uniform, WebGLRenderTarget, Vector2 } from 'three';
import { cosmicBloomShader, downsampleShader, upsampleShader } from './cosmic-bloom-shader';

export interface CosmicBloomEngineConfig {
  threshold?: number;
  intensity?: number;
  resolution?: number;
  kernelSize?: number;
}

export class CosmicBloomEngine {
  private config: CosmicBloomEngineConfig;
  private renderTargets: WebGLRenderTarget[] = [];
  private downsampleTargets: WebGLRenderTarget[] = [];
  private upsampleTargets: WebGLRenderTarget[] = [];
  private thresholdPass: THREE.ShaderMaterial | null = null;
  private downsamplePasses: THREE.ShaderMaterial[] = [];
  private upsamplePasses: THREE.ShaderMaterial[] = [];
  private compositePass: THREE.ShaderMaterial | null = null;
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private quad: THREE.Mesh;
  
  // Uniforms
  private uniforms: {
    uTime: Uniform;
    uHigh: Uniform;
    uMid: Uniform;
    uBass: Uniform;
    uThreshold: Uniform;
    uIntensity: Uniform;
    uBlessingWaveProgress: Uniform;
    uFOV: Uniform;
    uResolution: Uniform;
  };

  constructor(config: CosmicBloomEngineConfig = {}) {
    this.config = {
      threshold: config.threshold || 0.85,
      intensity: config.intensity || 1.0,
      resolution: config.resolution || 256,
      kernelSize: config.kernelSize || 9,
    };

    // Create uniforms
    this.uniforms = {
      uTime: new Uniform(0),
      uHigh: new Uniform(0),
      uMid: new Uniform(0),
      uBass: new Uniform(0),
      uThreshold: new Uniform(this.config.threshold),
      uIntensity: new Uniform(this.config.intensity),
      uBlessingWaveProgress: new Uniform(0),
      uFOV: new Uniform(75.0),
      uResolution: new Uniform(new Vector2(1, 1)),
    };

    // Create scene and camera for fullscreen quad
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    
    // Create fullscreen quad
    const geometry = new THREE.PlaneGeometry(2, 2);
    this.quad = new THREE.Mesh(geometry);
    this.scene.add(this.quad);

    // Initialize render targets for 7-stage pyramid
    this.initializeRenderTargets();
  }

  /**
   * Initialize render targets for 7-stage pyramid
   * Stages: 1 full, 6 downsampled (1/2, 1/4, 1/8, 1/16, 1/32, 1/64)
   */
  private initializeRenderTargets(): void {
    const baseResolution = this.config.resolution || 256;
    
    // Create threshold pass render target
    const thresholdTarget = new WebGLRenderTarget(baseResolution, baseResolution, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.UnsignedByteType,
    });
    this.renderTargets.push(thresholdTarget);

    // Create 6 downsampled targets (1/2, 1/4, 1/8, 1/16, 1/32, 1/64)
    for (let i = 0; i < 6; i++) {
      const scale = Math.pow(2, i + 1);
      const width = Math.max(1, Math.floor(baseResolution / scale));
      const height = Math.max(1, Math.floor(baseResolution / scale));
      
      const target = new WebGLRenderTarget(width, height, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        type: THREE.UnsignedByteType,
      });
      this.downsampleTargets.push(target);
    }

    // Create 6 upsampled targets (same sizes as downsample, in reverse order)
    for (let i = 5; i >= 0; i--) {
      const scale = Math.pow(2, i + 1);
      const width = Math.max(1, Math.floor(baseResolution / scale));
      const height = Math.max(1, Math.floor(baseResolution / scale));
      
      const target = new WebGLRenderTarget(width, height, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        type: THREE.UnsignedByteType,
      });
      this.upsampleTargets.push(target);
    }

    // Create threshold pass material
    this.thresholdPass = new THREE.ShaderMaterial({
      uniforms: {
        ...this.uniforms,
        uInputTexture: new Uniform(null),
      },
      vertexShader: cosmicBloomShader.vertexShader,
      fragmentShader: cosmicBloomShader.fragmentShader.replace(
        'uniform sampler2D uBloomTexture;',
        ''
      ).replace(
        'vec4 bloomTexture = texture2D(uBloomTexture, warpedUV);',
        'vec4 bloomTexture = vec4(0.0);'
      ).replace(
        'vec3 finalColor = inputColor.rgb + bloomTexture.rgb * uIntensity;',
        'vec3 finalColor = bloomColor.rgb;'
      ),
    });

    // Create downsample pass materials
    for (let i = 0; i < 6; i++) {
      const scale = Math.pow(2, i + 1);
      const width = Math.max(1, Math.floor((this.config.resolution || 256) / scale));
      const height = Math.max(1, Math.floor((this.config.resolution || 256) / scale));
      
      const material = new THREE.ShaderMaterial({
        uniforms: {
          uInputTexture: new Uniform(null),
          uResolution: new Uniform(new Vector2(width, height)),
        },
        vertexShader: downsampleShader.vertexShader,
        fragmentShader: downsampleShader.fragmentShader,
      });
      this.downsamplePasses.push(material);
    }

    // Create upsample pass materials
    for (let i = 0; i < 6; i++) {
      const scale = Math.pow(2, 6 - i);
      const width = Math.max(1, Math.floor((this.config.resolution || 256) / scale));
      const height = Math.max(1, Math.floor((this.config.resolution || 256) / scale));
      
      const material = new THREE.ShaderMaterial({
        uniforms: {
          uInputTexture: new Uniform(null),
          uPreviousTexture: new Uniform(null),
          uResolution: new Uniform(new Vector2(width, height)),
          uIntensity: new Uniform(1.0),
        },
        vertexShader: upsampleShader.vertexShader,
        fragmentShader: upsampleShader.fragmentShader,
      });
      this.upsamplePasses.push(material);
    }

    // Create composite pass material
    this.compositePass = new THREE.ShaderMaterial({
      uniforms: {
        ...this.uniforms,
        uInputTexture: new Uniform(null),
        uBloomTexture: new Uniform(null),
      },
      vertexShader: cosmicBloomShader.vertexShader,
      fragmentShader: cosmicBloomShader.fragmentShader,
    });
  }

  /**
   * Update uniforms
   */
  updateUniforms(
    time: number,
    high: number,
    mid: number,
    bass: number,
    blessingWaveProgress: number,
    fov: number,
    resolution: Vector2
  ): void {
    this.uniforms.uTime.value = time;
    this.uniforms.uHigh.value = high;
    this.uniforms.uMid.value = mid;
    this.uniforms.uBass.value = bass;
    this.uniforms.uBlessingWaveProgress.value = blessingWaveProgress;
    this.uniforms.uFOV.value = fov;
    this.uniforms.uResolution.value = resolution;

    // Update all pass materials
    if (this.thresholdPass) {
      Object.assign(this.thresholdPass.uniforms, this.uniforms);
    }
    if (this.compositePass) {
      Object.assign(this.compositePass.uniforms, this.uniforms);
      this.compositePass.uniforms.uResolution.value = resolution;
    }
  }

  /**
   * Render bloom pipeline
   */
  render(
    renderer: THREE.WebGLRenderer,
    inputTexture: THREE.Texture,
    outputTarget: WebGLRenderTarget
  ): void {
    if (!this.thresholdPass || !this.compositePass) return;

    // Stage 1: Threshold extraction
    this.thresholdPass.uniforms.uInputTexture.value = inputTexture;
    this.quad.material = this.thresholdPass;
    renderer.setRenderTarget(this.renderTargets[0]);
    renderer.render(this.scene, this.camera);

    // Stage 2-7: Downsample pyramid
    let previousTexture: THREE.Texture = this.renderTargets[0].texture;
    for (let i = 0; i < 6; i++) {
      this.downsamplePasses[i].uniforms.uInputTexture.value = previousTexture;
      this.quad.material = this.downsamplePasses[i];
      renderer.setRenderTarget(this.downsampleTargets[i]);
      renderer.render(this.scene, this.camera);
      previousTexture = this.downsampleTargets[i].texture;
    }

    // Stage 8-13: Upsample pyramid
    previousTexture = this.downsampleTargets[5].texture;
    for (let i = 0; i < 6; i++) {
      this.upsamplePasses[i].uniforms.uInputTexture.value = previousTexture;
      if (i > 0) {
        this.upsamplePasses[i].uniforms.uPreviousTexture.value = this.upsampleTargets[i - 1].texture;
      } else {
        this.upsamplePasses[i].uniforms.uPreviousTexture.value = this.downsampleTargets[4].texture;
      }
      this.quad.material = this.upsamplePasses[i];
      renderer.setRenderTarget(this.upsampleTargets[i]);
      renderer.render(this.scene, this.camera);
      previousTexture = this.upsampleTargets[i].texture;
    }

    // Stage 14: Composite
    this.compositePass.uniforms.uInputTexture.value = inputTexture;
    this.compositePass.uniforms.uBloomTexture.value = this.upsampleTargets[5].texture;
    this.quad.material = this.compositePass;
    renderer.setRenderTarget(outputTarget);
    renderer.render(this.scene, this.camera);
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    // Dispose render targets
    this.renderTargets.forEach(target => target.dispose());
    this.downsampleTargets.forEach(target => target.dispose());
    this.upsampleTargets.forEach(target => target.dispose());

    // Dispose materials
    if (this.thresholdPass) this.thresholdPass.dispose();
    this.downsamplePasses.forEach(pass => pass.dispose());
    this.upsamplePasses.forEach(pass => pass.dispose());
    if (this.compositePass) this.compositePass.dispose();

    // Dispose geometry
    this.quad.geometry.dispose();
  }

  /**
   * Get final bloom texture
   */
  getBloomTexture(): THREE.Texture | null {
    if (this.upsampleTargets.length > 0) {
      return this.upsampleTargets[5].texture;
    }
    return null;
  }
}

