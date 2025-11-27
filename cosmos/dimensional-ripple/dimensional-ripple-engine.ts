/**
 * Dimensional Ripple Engine
 * 
 * Phase 2 — Section 43: DIMENSIONAL RIPPLE ENGINE
 * Dimensional Ripple Engine (E47)
 * 
 * Generate ripple plane, warp overlay, drift particles, manage uniforms
 */

import * as THREE from 'three';
import { rippleVertexShader } from './shaders/ripple-vertex';
import { rippleFragmentShader } from './shaders/ripple-fragment';

export interface DimensionalRippleEngineConfig {
  intensity?: number;
  mouse?: { x: number; y: number };
  parallaxStrength?: number;
  numParticles?: number;
}

export interface RipplePlaneData {
  width: number;
  height: number;
  segments: number;
}

export interface WarpPlaneData {
  width: number;
  height: number;
  segments: number;
}

export interface ParticleData {
  particleIndex: number;
  radius: number;
  speed: number;
}

export class DimensionalRippleEngine {
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private config: DimensionalRippleEngineConfig;
  
  private ripplePlane: RipplePlaneData;
  private warpPlane: WarpPlaneData;
  private particles: ParticleData[] = [];
  
  private numParticles: number;
  
  private breathPhase: number = 0;
  private breathStrength: number = 0;
  private blessingWaveProgress: number = 0;
  private scrollProgress: number = 0;
  private rotationSync: number = 0;
  private cameraFOV: number = 75.0;

  constructor(config: DimensionalRippleEngineConfig = {}) {
    this.config = {
      intensity: config.intensity || 1.0,
      mouse: config.mouse || { x: 0, y: 0 },
      parallaxStrength: config.parallaxStrength || 1.0,
      numParticles: config.numParticles || 140,
    };
    
    this.numParticles = this.config.numParticles || 140;
    
    // Generate ripple plane
    this.generateRipplePlane();
    
    // Generate warp plane
    this.generateWarpPlane();
    
    // Generate particles
    this.generateParticles();
    
    // Create geometry
    this.geometry = this.createGeometry();
    
    // Create shader material
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uIntensity: { value: this.config.intensity },
        uBreathPhase: { value: 0 },
        uBreathStrength: { value: 0 },
        uBass: { value: 0 },
        uMid: { value: 0 },
        uHigh: { value: 0 },
        uScroll: { value: 0 },
        uBlessingWaveProgress: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uParallaxStrength: { value: this.config.parallaxStrength },
        uRotationSync: { value: 0 },
        uCameraFOV: { value: 75.0 },
      },
      vertexShader: rippleVertexShader,
      fragmentShader: rippleFragmentShader,
      transparent: true,
      blending: THREE.NormalBlending, // Base layer uses normal blending
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    
    // Create mesh
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  /**
   * Generate ripple plane
   */
  private generateRipplePlane(): void {
    this.ripplePlane = {
      width: 22.0,
      height: 14.0,
      segments: 32, // 32×32 grid resolution
    };
  }

  /**
   * Generate warp plane
   */
  private generateWarpPlane(): void {
    this.warpPlane = {
      width: 22.0,
      height: 14.0,
      segments: 32,
    };
  }

  /**
   * Generate particles (100-180)
   */
  private generateParticles(): void {
    this.particles = [];
    
    for (let i = 0; i < this.numParticles; i++) {
      const radius = 3.0 + (i / this.numParticles) * 5.0; // Varying radii
      const speed = 0.3 + (i / this.numParticles) * 0.2; // Varying speeds
      
      this.particles.push({
        particleIndex: i,
        radius,
        speed,
      });
    }
  }

  /**
   * Create geometry with ripple plane, warp plane, and particles
   */
  private createGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    
    const positions: number[] = [];
    const uvs: number[] = [];
    const rippleIndices: number[] = [];
    const warpIndices: number[] = [];
    const particleIndices: number[] = [];
    
    // ============================================
    // RIPPLE PLANE (Layer A)
    // ============================================
    const planeWidth = 22.0;
    const planeHeight = 14.0;
    const planeSegments = 32;
    
    for (let i = 0; i <= planeSegments; i++) {
      for (let j = 0; j <= planeSegments; j++) {
        const u = i / planeSegments;
        const v = j / planeSegments;
        
        const x = (u - 0.5) * planeWidth;
        const z = (v - 0.5) * planeHeight;
        const y = 0.0; // Will be displaced in shader
        
        positions.push(x, y, z);
        uvs.push(u, v);
        
        rippleIndices.push(0); // Single ripple plane
        warpIndices.push(-1);
        particleIndices.push(-1);
      }
    }
    
    // ============================================
    // WARP PLANE (Layer B)
    // ============================================
    for (let i = 0; i <= planeSegments; i++) {
      for (let j = 0; j <= planeSegments; j++) {
        const u = i / planeSegments;
        const v = j / planeSegments;
        
        const x = (u - 0.5) * planeWidth;
        const z = (v - 0.5) * planeHeight;
        const y = 0.0; // Will be displaced in shader
        
        positions.push(x, y, z);
        uvs.push(u, v);
        
        rippleIndices.push(-1);
        warpIndices.push(0); // Single warp plane
        particleIndices.push(-1);
      }
    }
    
    // ============================================
    // PARTICLES (Layer C)
    // ============================================
    const particleRadius = 0.0125;
    
    for (let i = 0; i < this.numParticles; i++) {
      const particle = this.particles[i];
      const x = 0.0; // Will be positioned on circular path in shader
      const y = 0.0;
      const z = 0.0;
      
      // Create quad for each particle
      positions.push(
        x - particleRadius, y - particleRadius, z, // Bottom-left
        x + particleRadius, y - particleRadius, z, // Bottom-right
        x - particleRadius, y + particleRadius, z, // Top-left
        x + particleRadius, y + particleRadius, z  // Top-right
      );
      
      // UVs
      uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
      
      // Indices
      rippleIndices.push(-1, -1, -1, -1);
      warpIndices.push(-1, -1, -1, -1);
      particleIndices.push(i, i, i, i);
    }
    
    // Set attributes
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setAttribute('rippleIndex', new THREE.Float32BufferAttribute(rippleIndices, 1));
    geometry.setAttribute('warpIndex', new THREE.Float32BufferAttribute(warpIndices, 1));
    geometry.setAttribute('particleIndex', new THREE.Float32BufferAttribute(particleIndices, 1));
    
    // Create indices
    const indices: number[] = [];
    let vertexIndex = 0;
    
    // Ripple plane (quads)
    for (let i = 0; i < planeSegments; i++) {
      for (let j = 0; j < planeSegments; j++) {
        const a = vertexIndex + i * (planeSegments + 1) + j;
        const b = a + 1;
        const c = a + (planeSegments + 1);
        const d = c + 1;
        
        indices.push(a, b, c);
        indices.push(b, d, c);
      }
    }
    vertexIndex += (planeSegments + 1) * (planeSegments + 1);
    
    // Warp plane (quads)
    for (let i = 0; i < planeSegments; i++) {
      for (let j = 0; j < planeSegments; j++) {
        const a = vertexIndex + i * (planeSegments + 1) + j;
        const b = a + 1;
        const c = a + (planeSegments + 1);
        const d = c + 1;
        
        indices.push(a, b, c);
        indices.push(b, d, c);
      }
    }
    vertexIndex += (planeSegments + 1) * (planeSegments + 1);
    
    // Particles (quads)
    for (let i = 0; i < this.numParticles; i++) {
      const base = vertexIndex;
      indices.push(
        base, base + 1, base + 2,
        base + 1, base + 3, base + 2
      );
      vertexIndex += 4;
    }
    
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    
    return geometry;
  }

  /**
   * Set breath data
   */
  setBreath(phase: number, strength: number): void {
    this.breathPhase = phase;
    this.breathStrength = strength;
    if (this.material.uniforms) {
      this.material.uniforms.uBreathPhase.value = phase;
      this.material.uniforms.uBreathStrength.value = strength;
    }
  }

  /**
   * Set blessing wave progress
   */
  setBlessingWave(progress: number): void {
    this.blessingWaveProgress = progress;
    if (this.material.uniforms) {
      this.material.uniforms.uBlessingWaveProgress.value = progress;
    }
  }

  /**
   * Set scroll progress
   */
  setScroll(scroll: number): void {
    this.scrollProgress = scroll;
    if (this.material.uniforms) {
      this.material.uniforms.uScroll.value = scroll;
    }
  }

  /**
   * Set rotation sync (from Projection E17)
   */
  setRotationSync(rotation: number): void {
    this.rotationSync = rotation;
    if (this.material.uniforms) {
      this.material.uniforms.uRotationSync.value = rotation;
    }
  }

  /**
   * Set camera FOV (from CameraController E18)
   */
  setCameraFOV(fov: number): void {
    this.cameraFOV = fov;
    if (this.material.uniforms) {
      this.material.uniforms.uCameraFOV.value = fov;
    }
  }

  /**
   * Update with dimensional ripple state
   */
  update(
    time: number,
    scrollProgress: number,
    bass: number,
    mid: number,
    high: number,
    deltaTime: number
  ): void {
    if (!this.material.uniforms) return;
    
    // Update time
    this.material.uniforms.uTime.value = time;
    
    // Update scroll
    this.material.uniforms.uScroll.value = scrollProgress;
    
    // Update audio reactive
    this.material.uniforms.uBass.value = bass;
    this.material.uniforms.uMid.value = mid;
    this.material.uniforms.uHigh.value = high;
    
    // Update intensity
    this.material.uniforms.uIntensity.value = this.config.intensity || 1.0;
    this.material.uniforms.uParallaxStrength.value = this.config.parallaxStrength || 1.0;
    
    // Update mouse
    if (this.config.mouse) {
      this.material.uniforms.uMouse.value.set(
        this.config.mouse.x,
        this.config.mouse.y
      );
    }
  }

  /**
   * Get mesh (for R3F)
   */
  getMesh(): THREE.Mesh {
    return this.mesh;
  }

  /**
   * Get material
   */
  getMaterial(): THREE.ShaderMaterial {
    return this.material;
  }

  /**
   * Get geometry
   */
  getGeometry(): THREE.BufferGeometry {
    return this.geometry;
  }

  /**
   * Set position
   */
  setPosition(x: number, y: number, z: number): void {
    this.mesh.position.set(x, y, z);
  }

  /**
   * Set scale
   */
  setScale(scale: number): void {
    this.mesh.scale.setScalar(scale);
  }

  /**
   * Dispose
   */
  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}

