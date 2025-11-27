/**
 * Timeline Stream Engine
 * 
 * Phase 2 — Section 23: COSMIC TIMELINE STREAM ENGINE
 * Timeline Stream Engine (E27)
 * 
 * Generate past particles, present ribbon, future lines, manage uniforms
 */

import * as THREE from 'three';
import { timelineVertexShader } from './shaders/timeline-vertex';
import { timelineFragmentShader } from './shaders/timeline-fragment';

export interface TimelineStreamEngineConfig {
  intensity?: number;
  mouse?: { x: number; y: number };
  parallaxStrength?: number;
  numParticles?: number;
  numLines?: number;
}

export interface ParticleData {
  position: THREE.Vector3;
  timeIndex: number; // 0→1 representing ancient→recent past
}

export interface RibbonData {
  points: THREE.Vector3[];
}

export interface LineData {
  position: THREE.Vector3;
}

export class TimelineStreamEngine {
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private config: TimelineStreamEngineConfig;
  
  private particles: ParticleData[] = [];
  private ribbon: RibbonData;
  private lines: LineData[] = [];
  
  private numParticles: number;
  private numLines: number;
  
  private breathPhase: number = 0;
  private breathStrength: number = 0;
  private blessingWaveProgress: number = 0;
  private scrollProgress: number = 0;
  private rotationSync: number = 0;
  private cameraFOV: number = 75.0;

  constructor(config: TimelineStreamEngineConfig = {}) {
    this.config = {
      intensity: config.intensity || 1.0,
      mouse: config.mouse || { x: 0, y: 0 },
      parallaxStrength: config.parallaxStrength || 1.0,
      numParticles: config.numParticles || 150,
      numLines: config.numLines || 8,
    };
    
    this.numParticles = this.config.numParticles || 150;
    this.numLines = this.config.numLines || 8;
    
    // Generate past particles
    this.generateParticles();
    
    // Generate present ribbon
    this.generateRibbon();
    
    // Generate future lines
    this.generateLines();
    
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
      vertexShader: timelineVertexShader,
      fragmentShader: timelineFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    
    // Create mesh
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  /**
   * Generate past particles (100-200)
   */
  private generateParticles(): void {
    this.particles = [];
    
    for (let i = 0; i < this.numParticles; i++) {
      const t = i / this.numParticles;
      
      // timeIndex: 0 = ancient past, 1 = recent past
      const timeIndex = t;
      
      // Initial position (will be updated in shader)
      const position = new THREE.Vector3(0, 0, 0);
      
      this.particles.push({
        position,
        timeIndex,
      });
    }
  }

  /**
   * Generate present ribbon (32 points)
   */
  private generateRibbon(): void {
    const points: THREE.Vector3[] = [];
    const numPoints = 32;
    
    for (let i = 0; i < numPoints; i++) {
      const t = i / (numPoints - 1);
      const x = (t - 0.5) * 1.5;
      const y = 0.8; // Behind Guru's head
      const z = -1.8;
      points.push(new THREE.Vector3(x, y, z));
    }
    
    this.ribbon = { points };
  }

  /**
   * Generate future lines (6-10)
   */
  private generateLines(): void {
    this.lines = [];
    
    for (let i = 0; i < this.numLines; i++) {
      const t = i / (this.numLines - 1);
      
      // Initial position (will be updated in shader)
      const position = new THREE.Vector3(0, 0, 0);
      
      this.lines.push({
        position,
      });
    }
  }

  /**
   * Create geometry with particles, ribbon, and lines
   */
  private createGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    
    const positions: number[] = [];
    const uvs: number[] = [];
    const particleIndices: number[] = [];
    const ribbonIndices: number[] = [];
    const lineIndices: number[] = [];
    const timeIndices: number[] = [];
    
    // ============================================
    // PARTICLES (Layer A)
    // ============================================
    const particleSize = 0.05;
    
    for (let i = 0; i < this.numParticles; i++) {
      const particle = this.particles[i];
      
      // Create quad for each particle
      const x = particle.position.x;
      const y = particle.position.y;
      const z = particle.position.z;
      
      // Quad vertices (4 vertices per particle)
      positions.push(
        x - particleSize, y, z - particleSize, // Bottom-left
        x + particleSize, y, z - particleSize, // Bottom-right
        x - particleSize, y, z + particleSize, // Top-left
        x + particleSize, y, z + particleSize  // Top-right
      );
      
      // UVs
      uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
      
      // Indices
      particleIndices.push(i, i, i, i);
      ribbonIndices.push(-1, -1, -1, -1);
      lineIndices.push(-1, -1, -1, -1);
      
      // Time index
      timeIndices.push(particle.timeIndex, particle.timeIndex, particle.timeIndex, particle.timeIndex);
    }
    
    // ============================================
    // RIBBON (Layer B)
    // ============================================
    const ribbonWidth = 0.02;
    const ribbonSegments = 32;
    
    for (let i = 0; i < ribbonSegments; i++) {
      const t = i / (ribbonSegments - 1);
      const point = this.ribbon.points[Math.floor(t * (this.ribbon.points.length - 1))];
      
      // Create quad for ribbon segment
      const x = point.x;
      const y = point.y;
      const z = point.z;
      
      // Quad vertices (4 vertices per segment)
      positions.push(
        x, y - ribbonWidth, z, // Bottom
        x, y + ribbonWidth, z, // Top
        x, y - ribbonWidth, z, // Bottom (duplicate for quad)
        x, y + ribbonWidth, z  // Top (duplicate for quad)
      );
      
      // UVs
      uvs.push(t, 0, t, 1, t, 0, t, 1);
      
      // Indices
      particleIndices.push(-1, -1, -1, -1);
      ribbonIndices.push(0, 0, 0, 0); // Single ribbon
      lineIndices.push(-1, -1, -1, -1);
      
      // Time index (not used for ribbon)
      timeIndices.push(0, 0, 0, 0);
    }
    
    // ============================================
    // LINES (Layer C)
    // ============================================
    const lineWidth = 0.01;
    const lineHeight = 1.0;
    
    for (let i = 0; i < this.numLines; i++) {
      const line = this.lines[i];
      
      // Create quad for each line
      const x = line.position.x;
      const y = line.position.y;
      const z = line.position.z;
      
      // Quad vertices (4 vertices per line)
      positions.push(
        x - lineWidth, y - lineHeight, z, // Bottom-left
        x + lineWidth, y - lineHeight, z, // Bottom-right
        x - lineWidth, y + lineHeight, z, // Top-left
        x + lineWidth, y + lineHeight, z  // Top-right
      );
      
      // UVs
      uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
      
      // Indices
      particleIndices.push(-1, -1, -1, -1);
      ribbonIndices.push(-1, -1, -1, -1);
      lineIndices.push(i, i, i, i);
      
      // Time index (not used for lines)
      timeIndices.push(0, 0, 0, 0);
    }
    
    // Set attributes
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setAttribute('particleIndex', new THREE.Float32BufferAttribute(particleIndices, 1));
    geometry.setAttribute('ribbonIndex', new THREE.Float32BufferAttribute(ribbonIndices, 1));
    geometry.setAttribute('lineIndex', new THREE.Float32BufferAttribute(lineIndices, 1));
    geometry.setAttribute('timeIndex', new THREE.Float32BufferAttribute(timeIndices, 1));
    
    // Create indices for quads
    const indices: number[] = [];
    let vertexIndex = 0;
    
    // Particles
    for (let i = 0; i < this.numParticles; i++) {
      const base = vertexIndex;
      indices.push(
        base, base + 1, base + 2,
        base + 1, base + 3, base + 2
      );
      vertexIndex += 4;
    }
    
    // Ribbon
    for (let i = 0; i < ribbonSegments; i++) {
      const base = vertexIndex;
      indices.push(
        base, base + 1, base + 2,
        base + 1, base + 3, base + 2
      );
      vertexIndex += 4;
    }
    
    // Lines
    for (let i = 0; i < this.numLines; i++) {
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
   * Update with timeline stream state
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

