/**
 * Astral Trail Engine
 * 
 * Phase 2 — Section 28: ASTRAL TRAIL ENGINE
 * Astral Trail Engine (E32)
 * 
 * Generate particle attributes, ribbon spline points, echo line points, manage uniforms
 */

import * as THREE from 'three';
import { trailVertexShader } from './shaders/trail-vertex';
import { trailFragmentShader } from './shaders/trail-fragment';

export interface AstralTrailEngineConfig {
  intensity?: number;
  mouse?: { x: number; y: number };
  parallaxStrength?: number;
  numParticles?: number;
  numRibbonPoints?: number;
  numEchoLines?: number;
}

export interface ParticleData {
  particleIndex: number;
  t: number; // Position along trail (0-1)
}

export interface RibbonPointData {
  pointIndex: number;
  t: number; // Position along ribbon (0-1)
}

export interface EchoLineData {
  lineIndex: number;
  t: number; // Position along line (0-1)
}

export class AstralTrailEngine {
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private config: AstralTrailEngineConfig;
  
  private particles: ParticleData[] = [];
  private ribbonPoints: RibbonPointData[] = [];
  private echoLines: EchoLineData[] = [];
  
  private numParticles: number;
  private numRibbonPoints: number;
  private numEchoLines: number;
  
  private breathPhase: number = 0;
  private breathStrength: number = 0;
  private blessingWaveProgress: number = 0;
  private scrollProgress: number = 0;
  private rotationSync: number = 0;
  private cameraFOV: number = 75.0;

  constructor(config: AstralTrailEngineConfig = {}) {
    this.config = {
      intensity: config.intensity || 1.0,
      mouse: config.mouse || { x: 0, y: 0 },
      parallaxStrength: config.parallaxStrength || 1.0,
      numParticles: config.numParticles || 100,
      numRibbonPoints: config.numRibbonPoints || 32,
      numEchoLines: config.numEchoLines || 6,
    };
    
    this.numParticles = this.config.numParticles || 100;
    this.numRibbonPoints = this.config.numRibbonPoints || 32;
    this.numEchoLines = this.config.numEchoLines || 6;
    
    // Generate particle attributes
    this.generateParticles();
    
    // Generate ribbon spline points
    this.generateRibbonPoints();
    
    // Generate echo line points
    this.generateEchoLines();
    
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
      vertexShader: trailVertexShader,
      fragmentShader: trailFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    
    // Create mesh
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  /**
   * Generate particle attributes
   */
  private generateParticles(): void {
    this.particles = [];
    
    for (let i = 0; i < this.numParticles; i++) {
      const t = i / (this.numParticles - 1);
      this.particles.push({
        particleIndex: i,
        t,
      });
    }
  }

  /**
   * Generate ribbon spline points
   */
  private generateRibbonPoints(): void {
    this.ribbonPoints = [];
    
    for (let i = 0; i < this.numRibbonPoints; i++) {
      const t = i / (this.numRibbonPoints - 1);
      this.ribbonPoints.push({
        pointIndex: i,
        t,
      });
    }
  }

  /**
   * Generate echo line points
   */
  private generateEchoLines(): void {
    this.echoLines = [];
    
    for (let i = 0; i < this.numEchoLines; i++) {
      const t = i / (this.numEchoLines - 1);
      this.echoLines.push({
        lineIndex: i,
        t,
      });
    }
  }

  /**
   * Create geometry with particles, ribbon, and echo lines
   */
  private createGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    
    const positions: number[] = [];
    const uvs: number[] = [];
    const particleIndices: number[] = [];
    const ribbonIndices: number[] = [];
    const echoLineIndices: number[] = [];
    const trailTs: number[] = [];
    
    // ============================================
    // PARTICLES (Layer A)
    // ============================================
    const particleSize = 0.03;
    
    for (let i = 0; i < this.numParticles; i++) {
      const particle = this.particles[i];
      
      // Create quad for each particle
      const x = 0;
      const y = 0;
      const z = 0;
      
      positions.push(
        x - particleSize, y - particleSize, z, // Bottom-left
        x + particleSize, y - particleSize, z, // Bottom-right
        x - particleSize, y + particleSize, z, // Top-left
        x + particleSize, y + particleSize, z  // Top-right
      );
      
      // UVs
      uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
      
      // Indices
      particleIndices.push(i, i, i, i);
      ribbonIndices.push(-1, -1, -1, -1);
      echoLineIndices.push(-1, -1, -1, -1);
      
      // Trail T
      trailTs.push(particle.t, particle.t, particle.t, particle.t);
    }
    
    // ============================================
    // RIBBON (Layer B)
    // ============================================
    const ribbonWidth = 0.02;
    
    for (let i = 0; i < this.numRibbonPoints; i++) {
      const ribbon = this.ribbonPoints[i];
      
      // Create quad for ribbon segment
      const x = 0;
      const y = 0;
      const z = 0;
      
      positions.push(
        x - ribbonWidth, y, z, // Left
        x + ribbonWidth, y, z, // Right
        x - ribbonWidth, y, z, // Left (duplicate for quad)
        x + ribbonWidth, y, z  // Right (duplicate for quad)
      );
      
      // UVs
      uvs.push(0, ribbon.t, 1, ribbon.t, 0, ribbon.t, 1, ribbon.t);
      
      // Indices
      particleIndices.push(-1, -1, -1, -1);
      ribbonIndices.push(0, 0, 0, 0); // Single ribbon
      echoLineIndices.push(-1, -1, -1, -1);
      
      // Trail T
      trailTs.push(ribbon.t, ribbon.t, ribbon.t, ribbon.t);
    }
    
    // ============================================
    // ECHO LINES (Layer C)
    // ============================================
    const lineWidth = 0.01;
    
    for (let lineIdx = 0; lineIdx < this.numEchoLines; lineIdx++) {
      for (let i = 0; i < 16; i++) { // 16 points per line
        const t = i / 15.0;
        const echoLine = this.echoLines[lineIdx];
        
        // Create quad for line segment
        const x = 0;
        const y = 0;
        const z = 0;
        
        positions.push(
          x - lineWidth, y, z, // Left
          x + lineWidth, y, z, // Right
          x - lineWidth, y, z, // Left (duplicate for quad)
          x + lineWidth, y, z  // Right (duplicate for quad)
        );
        
        // UVs
        uvs.push(0, t, 1, t, 0, t, 1, t);
        
        // Indices
        particleIndices.push(-1, -1, -1, -1);
        ribbonIndices.push(-1, -1, -1, -1);
        echoLineIndices.push(lineIdx, lineIdx, lineIdx, lineIdx);
        
        // Trail T
        trailTs.push(echoLine.t, echoLine.t, echoLine.t, echoLine.t);
      }
    }
    
    // Set attributes
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setAttribute('particleIndex', new THREE.Float32BufferAttribute(particleIndices, 1));
    geometry.setAttribute('ribbonIndex', new THREE.Float32BufferAttribute(ribbonIndices, 1));
    geometry.setAttribute('echoLineIndex', new THREE.Float32BufferAttribute(echoLineIndices, 1));
    geometry.setAttribute('trailT', new THREE.Float32BufferAttribute(trailTs, 1));
    
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
    for (let i = 0; i < this.numRibbonPoints; i++) {
      const base = vertexIndex;
      indices.push(
        base, base + 1, base + 2,
        base + 1, base + 3, base + 2
      );
      vertexIndex += 4;
    }
    
    // Echo lines
    for (let lineIdx = 0; lineIdx < this.numEchoLines; lineIdx++) {
      for (let i = 0; i < 16; i++) {
        const base = vertexIndex;
        indices.push(
          base, base + 1, base + 2,
          base + 1, base + 3, base + 2
        );
        vertexIndex += 4;
      }
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
   * Update with astral trail state
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

