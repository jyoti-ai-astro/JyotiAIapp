/**
 * Soul Star Engine
 * 
 * Phase 2 — Section 31: SOUL STAR ENGINE
 * Soul Star Engine (E35)
 * 
 * Generate core star, spikes, particles, manage uniforms
 */

import * as THREE from 'three';
import { starVertexShader } from './shaders/star-vertex';
import { starFragmentShader } from './shaders/star-fragment';

export interface SoulStarEngineConfig {
  intensity?: number;
  mouse?: { x: number; y: number };
  parallaxStrength?: number;
  numStarPoints?: number;
  numSpikes?: number;
  numParticles?: number;
}

export interface CoreStarData {
  radius: number;
  numPoints: number;
}

export interface SpikeData {
  spikeIndex: number;
  angle: number;
}

export interface ParticleData {
  particleIndex: number;
  orbitAngle: number;
  orbitRadius: number;
}

export class SoulStarEngine {
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private config: SoulStarEngineConfig;
  
  private coreStar: CoreStarData;
  private spikes: SpikeData[] = [];
  private particles: ParticleData[] = [];
  
  private numStarPoints: number;
  private numSpikes: number;
  private numParticles: number;
  
  private breathPhase: number = 0;
  private breathStrength: number = 0;
  private blessingWaveProgress: number = 0;
  private scrollProgress: number = 0;
  private rotationSync: number = 0;
  private cameraFOV: number = 75.0;

  constructor(config: SoulStarEngineConfig = {}) {
    this.config = {
      intensity: config.intensity || 1.0,
      mouse: config.mouse || { x: 0, y: 0 },
      parallaxStrength: config.parallaxStrength || 1.0,
      numStarPoints: config.numStarPoints || 8,
      numSpikes: config.numSpikes || 15,
      numParticles: config.numParticles || 70,
    };
    
    this.numStarPoints = this.config.numStarPoints || 8;
    this.numSpikes = this.config.numSpikes || 15;
    this.numParticles = this.config.numParticles || 70;
    
    // Generate core star (8-point)
    this.generateCoreStar();
    
    // Generate spikes (12-18)
    this.generateSpikes();
    
    // Generate particles (50-90)
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
      vertexShader: starVertexShader,
      fragmentShader: starFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    
    // Create mesh
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  /**
   * Generate core star (8-point)
   */
  private generateCoreStar(): void {
    this.coreStar = {
      radius: 0.45,
      numPoints: this.numStarPoints,
    };
  }

  /**
   * Generate spikes (12-18)
   */
  private generateSpikes(): void {
    this.spikes = [];
    
    for (let i = 0; i < this.numSpikes; i++) {
      const angle = (i / this.numSpikes) * Math.PI * 2;
      this.spikes.push({
        spikeIndex: i,
        angle,
      });
    }
  }

  /**
   * Generate particles (50-90)
   */
  private generateParticles(): void {
    this.particles = [];
    
    for (let i = 0; i < this.numParticles; i++) {
      const orbitAngle = (i / this.numParticles) * Math.PI * 2;
      const orbitRadius = 0.6;
      
      this.particles.push({
        particleIndex: i,
        orbitAngle,
        orbitRadius,
      });
    }
  }

  /**
   * Create geometry with core star, spikes, and particles
   */
  private createGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    
    const positions: number[] = [];
    const uvs: number[] = [];
    const coreStarIndices: number[] = [];
    const spikeIndices: number[] = [];
    const particleIndices: number[] = [];
    
    // ============================================
    // CORE STAR (Layer A)
    // ============================================
    const starRadius = 0.45;
    const starSegments = this.numStarPoints * 2; // 2 segments per point
    
    for (let i = 0; i < starSegments; i++) {
      const t = i / starSegments;
      const angle = t * Math.PI * 2;
      const radius = starRadius;
      
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = -2.8;
      
      // Create quad for star segment
      const segmentSize = 0.02;
      positions.push(
        x - segmentSize, y - segmentSize, z, // Bottom-left
        x + segmentSize, y - segmentSize, z, // Bottom-right
        x - segmentSize, y + segmentSize, z, // Top-left
        x + segmentSize, y + segmentSize, z  // Top-right
      );
      
      // UVs
      uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
      
      // Indices
      coreStarIndices.push(0, 0, 0, 0); // Single core star
      spikeIndices.push(-1, -1, -1, -1);
      particleIndices.push(-1, -1, -1, -1);
    }
    
    // ============================================
    // SPIKES (Layer B)
    // ============================================
    const spikeWidth = 0.03;
    const spikeLength = 0.5;
    
    for (let i = 0; i < this.numSpikes; i++) {
      const spike = this.spikes[i];
      
      // Position spike
      const x = Math.cos(spike.angle) * spikeLength;
      const y = Math.sin(spike.angle) * spikeLength;
      const z = -2.8;
      
      // Create quad for spike
      positions.push(
        x - spikeWidth, y - spikeWidth, z, // Bottom-left
        x + spikeWidth, y - spikeWidth, z, // Bottom-right
        x - spikeWidth, y + spikeWidth, z, // Top-left
        x + spikeWidth, y + spikeWidth, z  // Top-right
      );
      
      // UVs
      uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
      
      // Indices
      coreStarIndices.push(-1, -1, -1, -1);
      spikeIndices.push(i, i, i, i);
      particleIndices.push(-1, -1, -1, -1);
    }
    
    // ============================================
    // PARTICLES (Layer C)
    // ============================================
    const particleSize = 0.02;
    
    for (let i = 0; i < this.numParticles; i++) {
      const particle = this.particles[i];
      
      // Orbit position
      const x = Math.cos(particle.orbitAngle) * particle.orbitRadius;
      const y = Math.sin(particle.orbitAngle) * particle.orbitRadius;
      const z = -2.8;
      
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
      coreStarIndices.push(-1, -1, -1, -1);
      spikeIndices.push(-1, -1, -1, -1);
      particleIndices.push(i, i, i, i);
    }
    
    // Set attributes
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setAttribute('coreStarIndex', new THREE.Float32BufferAttribute(coreStarIndices, 1));
    geometry.setAttribute('spikeIndex', new THREE.Float32BufferAttribute(spikeIndices, 1));
    geometry.setAttribute('particleIndex', new THREE.Float32BufferAttribute(particleIndices, 1));
    
    // Create indices for quads
    const indices: number[] = [];
    let vertexIndex = 0;
    
    // Core star
    for (let i = 0; i < starSegments; i++) {
      const base = vertexIndex;
      indices.push(
        base, base + 1, base + 2,
        base + 1, base + 3, base + 2
      );
      vertexIndex += 4;
    }
    
    // Spikes
    for (let i = 0; i < this.numSpikes; i++) {
      const base = vertexIndex;
      indices.push(
        base, base + 1, base + 2,
        base + 1, base + 3, base + 2
      );
      vertexIndex += 4;
    }
    
    // Particles
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
   * Update with soul star state
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

