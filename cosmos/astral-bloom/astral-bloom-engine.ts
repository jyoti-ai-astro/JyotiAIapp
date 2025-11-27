/**
 * Astral Bloom Engine
 * 
 * Phase 2 — Section 39: ASTRAL BLOOM ENGINE
 * Astral Bloom Engine (E43)
 * 
 * Generate disc, shockwave ring, dust particles, manage uniforms
 */

import * as THREE from 'three';
import { bloomVertexShader } from './shaders/bloom-vertex';
import { bloomFragmentShader } from './shaders/bloom-fragment';

export interface AstralBloomEngineConfig {
  intensity?: number;
  mouse?: { x: number; y: number };
  parallaxStrength?: number;
  discSegments?: number;
  numParticles?: number;
}

export interface DiscData {
  baseRadius: number;
  maxRadius: number;
  segments: number;
}

export interface RingData {
  thickness: number;
}

export interface ParticleData {
  particleIndex: number;
  angle: number;
  radius: number;
}

export class AstralBloomEngine {
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private config: AstralBloomEngineConfig;
  
  private disc: DiscData;
  private ring: RingData;
  private particles: ParticleData[] = [];
  
  private discSegments: number;
  private numParticles: number;
  
  private breathPhase: number = 0;
  private breathStrength: number = 0;
  private blessingWaveProgress: number = 0;
  private scrollProgress: number = 0;
  private rotationSync: number = 0;
  private cameraFOV: number = 75.0;

  constructor(config: AstralBloomEngineConfig = {}) {
    this.config = {
      intensity: config.intensity || 1.0,
      mouse: config.mouse || { x: 0, y: 0 },
      parallaxStrength: config.parallaxStrength || 1.0,
      discSegments: config.discSegments || 56,
      numParticles: config.numParticles || 130,
    };
    
    this.discSegments = this.config.discSegments || 56;
    this.numParticles = this.config.numParticles || 130;
    
    // Generate disc
    this.generateDisc();
    
    // Generate ring
    this.generateRing();
    
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
      vertexShader: bloomVertexShader,
      fragmentShader: bloomFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    
    // Create mesh
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  /**
   * Generate disc
   */
  private generateDisc(): void {
    this.disc = {
      baseRadius: 0.3,
      maxRadius: 2.0,
      segments: this.discSegments,
    };
  }

  /**
   * Generate ring
   */
  private generateRing(): void {
    this.ring = {
      thickness: 0.02,
    };
  }

  /**
   * Generate particles (100-160)
   */
  private generateParticles(): void {
    this.particles = [];
    
    for (let i = 0; i < this.numParticles; i++) {
      const angle = (i / this.numParticles) * Math.PI * 2;
      const radius = 0.015; // Particle radius: 0.01-0.02
      
      this.particles.push({
        particleIndex: i,
        angle,
        radius,
      });
    }
  }

  /**
   * Create geometry with disc, ring, and particles
   */
  private createGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    
    const positions: number[] = [];
    const uvs: number[] = [];
    const discIndices: number[] = [];
    const ringIndices: number[] = [];
    const particleIndices: number[] = [];
    
    // ============================================
    // DISC (Layer A)
    // ============================================
    const baseRadius = 0.3;
    const maxRadius = 2.0;
    
    // Create disc as grid of quads
    for (let i = 0; i < this.discSegments; i++) {
      for (let j = 0; j < this.discSegments; j++) {
        const u = i / this.discSegments;
        const v = j / this.discSegments;
        
        const angle = u * Math.PI * 2;
        const radius = v * maxRadius;
        
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const z = -5.4;
        
        positions.push(x, y, z);
        uvs.push(u, v);
        
        discIndices.push(0); // Single disc
        ringIndices.push(-1);
        particleIndices.push(-1);
      }
    }
    
    // ============================================
    // RING (Layer B)
    // ============================================
    const ringThickness = 0.02;
    const ringSegments = 64;
    
    for (let i = 0; i < ringSegments; i++) {
      const t = i / ringSegments;
      const angle = t * Math.PI * 2;
      const radius = 0.3; // Starting radius
      
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = -5.4;
      
      // Create quad for ring segment
      positions.push(
        x - ringThickness, y - ringThickness, z, // Bottom-left
        x + ringThickness, y - ringThickness, z, // Bottom-right
        x - ringThickness, y + ringThickness, z, // Top-left
        x + ringThickness, y + ringThickness, z  // Top-right
      );
      
      // UVs
      uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
      
      // Indices
      discIndices.push(-1, -1, -1, -1);
      ringIndices.push(0, 0, 0, 0); // Single ring
      particleIndices.push(-1, -1, -1, -1);
    }
    
    // ============================================
    // PARTICLES (Layer C)
    // ============================================
    const particleSize = 0.015;
    
    for (let i = 0; i < this.numParticles; i++) {
      const particle = this.particles[i];
      
      // Initial position (will be animated in shader)
      const x = Math.cos(particle.angle) * 0.3;
      const y = Math.sin(particle.angle) * 0.3;
      const z = -5.4;
      
      // Create quad for each particle
      positions.push(
        x - particleSize, y - particleSize, z, // Bottom-left
        x + particleSize, y - particleSize, z, // Bottom-right
        x - particleSize, y + particleSize, z, // Top-left
        x + particleSize, y + particleSize, z  // Top-right
      );
      
      // UVs
      uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
      
      // Indices
      discIndices.push(-1, -1, -1, -1);
      ringIndices.push(-1, -1, -1, -1);
      particleIndices.push(i, i, i, i);
    }
    
    // Set attributes
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setAttribute('discIndex', new THREE.Float32BufferAttribute(discIndices, 1));
    geometry.setAttribute('ringIndex', new THREE.Float32BufferAttribute(ringIndices, 1));
    geometry.setAttribute('particleIndex', new THREE.Float32BufferAttribute(particleIndices, 1));
    
    // Create indices
    const indices: number[] = [];
    let vertexIndex = 0;
    
    // Disc (quads)
    for (let i = 0; i < this.discSegments - 1; i++) {
      for (let j = 0; j < this.discSegments - 1; j++) {
        const a = vertexIndex + i * this.discSegments + j;
        const b = a + 1;
        const c = a + this.discSegments;
        const d = c + 1;
        
        indices.push(a, b, c);
        indices.push(b, d, c);
      }
    }
    vertexIndex += this.discSegments * this.discSegments;
    
    // Ring (quads)
    for (let i = 0; i < ringSegments; i++) {
      const base = vertexIndex;
      indices.push(
        base, base + 1, base + 2,
        base + 1, base + 3, base + 2
      );
      vertexIndex += 4;
    }
    
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
   * Update with astral bloom state
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

