/**
 * Cosmic Depth v1 Engine
 * 
 * Phase 3 — Section 2: COSMIC DEPTH ENGINE v1
 * Cosmic Depth Engine v1 (F2)
 * 
 * Depth-of-Field engine with render targets for CoC generation and blur passes
 */

import * as THREE from 'three';
import { Uniform, WebGLRenderTarget, Vector2 } from 'three';
import { cosmicDepthShader, cocShader } from './cosmic-depth-shader';

export interface CosmicDepthEngineConfig {
  focusDistance?: number;
  aperture?: number;
  blurIntensity?: number;
  nearBlur?: number;
  farBlur?: number;
  resolution?: number;
  kernelSize?: number;
}

export class CosmicDepthEngine {
  private config: CosmicDepthEngineConfig;
  private cocTarget: WebGLRenderTarget | null = null;
  private blurTargets: WebGLRenderTarget[] = [];
  private cocPass: THREE.ShaderMaterial | null = null;
  private blurPasses: THREE.ShaderMaterial[] = [];
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private quad: THREE.Mesh;
  
  // Uniforms
  private uniforms: {
    uTime: Uniform;
    uBass: Uniform;
    uMid: Uniform;
    uHigh: Uniform;
    uFocusDistance: Uniform;
    uAperture: Uniform;
    uBlurIntensity: Uniform;
    uNearBlur: Uniform;
    uFarBlur: Uniform;
    uBlessingWaveProgress: Uniform;
    uCameraNear: Uniform;
    uCameraFar: Uniform;
    uFOV: Uniform;
    uResolution: Uniform;
    uKernelSize: Uniform;
  };

  constructor(config: CosmicDepthEngineConfig = {}) {
    this.config = {
      focusDistance: config.focusDistance || 5.0,
      aperture: config.aperture || 0.1,
      blurIntensity: config.blurIntensity || 1.0,
      nearBlur: config.nearBlur || 1.0,
      farBlur: config.farBlur || 1.0,
      resolution: config.resolution || 256,
      kernelSize: config.kernelSize || 9,
    };

    // Create uniforms
    this.uniforms = {
      uTime: new Uniform(0),
      uBass: new Uniform(0),
      uMid: new Uniform(0),
      uHigh: new Uniform(0),
      uFocusDistance: new Uniform(this.config.focusDistance),
      uAperture: new Uniform(this.config.aperture),
      uBlurIntensity: new Uniform(this.config.blurIntensity),
      uNearBlur: new Uniform(this.config.nearBlur),
      uFarBlur: new Uniform(this.config.farBlur),
      uBlessingWaveProgress: new Uniform(0),
      uCameraNear: new Uniform(0.1),
      uCameraFar: new Uniform(1000.0),
      uFOV: new Uniform(75.0),
      uResolution: new Uniform(new Vector2(1, 1)),
      uKernelSize: new Uniform(this.config.kernelSize),
    };

    // Create scene and camera for fullscreen quad
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    
    // Create fullscreen quad
    const geometry = new THREE.PlaneGeometry(2, 2);
    this.quad = new THREE.Mesh(geometry);
    this.scene.add(this.quad);

    // Initialize render targets
    this.initializeRenderTargets();
  }

  /**
   * Initialize render targets for CoC and blur passes
   */
  private initializeRenderTargets(): void {
    const baseResolution = this.config.resolution || 256;
    
    // Create CoC render target
    this.cocTarget = new WebGLRenderTarget(baseResolution, baseResolution, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.UnsignedByteType,
    });

    // Create blur render targets (horizontal and vertical)
    for (let i = 0; i < 2; i++) {
      const target = new WebGLRenderTarget(baseResolution, baseResolution, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        type: THREE.UnsignedByteType,
      });
      this.blurTargets.push(target);
    }

    // Create CoC pass material
    this.cocPass = new THREE.ShaderMaterial({
      uniforms: {
        ...this.uniforms,
        depthTexture: new Uniform(null),
      },
      vertexShader: cocShader.vertexShader,
      fragmentShader: cocShader.fragmentShader,
    });

    // Create blur pass materials (horizontal and vertical)
    for (let i = 0; i < 2; i++) {
      const direction = i === 0 ? new Vector2(1.0, 0.0) : new Vector2(0.0, 1.0);
      const material = new THREE.ShaderMaterial({
        uniforms: {
          ...this.uniforms,
          inputTexture: new Uniform(null),
        },
        vertexShader: cosmicDepthShader.vertexShader,
        fragmentShader: cosmicDepthShader.fragmentShader.replace(
          'vec2 direction',
          `vec2 direction = vec2(${direction.x}, ${direction.y});`
        ),
      });
      this.blurPasses.push(material);
    }
  }

  /**
   * Update uniforms
   */
  updateUniforms(
    time: number,
    bass: number,
    mid: number,
    high: number,
    blessingWaveProgress: number,
    cameraNear: number,
    cameraFar: number,
    fov: number,
    resolution: Vector2,
    kernelSize?: number
  ): void {
    this.uniforms.uTime.value = time;
    this.uniforms.uBass.value = bass;
    this.uniforms.uMid.value = mid;
    this.uniforms.uHigh.value = high;
    this.uniforms.uBlessingWaveProgress.value = blessingWaveProgress;
    this.uniforms.uCameraNear.value = cameraNear;
    this.uniforms.uCameraFar.value = cameraFar;
    this.uniforms.uFOV.value = fov;
    this.uniforms.uResolution.value = resolution;
    
    if (kernelSize !== undefined) {
      this.uniforms.uKernelSize.value = kernelSize;
    }

    // Update all pass materials
    if (this.cocPass) {
      Object.assign(this.cocPass.uniforms, this.uniforms);
    }
    this.blurPasses.forEach(pass => {
      Object.assign(pass.uniforms, this.uniforms);
      pass.uniforms.uResolution.value = resolution;
    });
  }

  /**
   * Render DOF pipeline
   */
  render(
    renderer: THREE.WebGLRenderer,
    inputTexture: THREE.Texture,
    depthTexture: THREE.Texture,
    outputTarget: WebGLRenderTarget
  ): void {
    if (!this.cocTarget || !this.cocPass) return;

    // Stage 1: Generate CoC from depth
    this.cocPass.uniforms.depthTexture.value = depthTexture;
    this.quad.material = this.cocPass;
    renderer.setRenderTarget(this.cocTarget);
    renderer.render(this.scene, this.camera);

    // Stage 2: Horizontal blur
    if (this.blurPasses[0] && this.blurTargets[0]) {
      this.blurPasses[0].uniforms.inputTexture.value = inputTexture;
      this.blurPasses[0].uniforms.depthTexture.value = depthTexture;
      this.quad.material = this.blurPasses[0];
      renderer.setRenderTarget(this.blurTargets[0]);
      renderer.render(this.scene, this.camera);
    }

    // Stage 3: Vertical blur
    if (this.blurPasses[1] && this.blurTargets[1]) {
      this.blurPasses[1].uniforms.inputTexture.value = this.blurTargets[0].texture;
      this.blurPasses[1].uniforms.depthTexture.value = depthTexture;
      this.quad.material = this.blurPasses[1];
      renderer.setRenderTarget(outputTarget);
      renderer.render(this.scene, this.camera);
    }
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    if (this.cocTarget) this.cocTarget.dispose();
    this.blurTargets.forEach(target => target.dispose());

    if (this.cocPass) this.cocPass.dispose();
    this.blurPasses.forEach(pass => pass.dispose());

    this.quad.geometry.dispose();
  }

  /**
   * Get CoC texture
   */
  getCoCTexture(): THREE.Texture | null {
    return this.cocTarget?.texture || null;
  }
}

