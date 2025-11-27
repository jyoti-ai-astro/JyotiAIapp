/**
 * Memory Stream Engine
 * 
 * Phase 2 — Section 21: COSMIC MEMORY STREAM ENGINE
 * Memory Stream Engine (E25)
 * 
 * Generate particle attributes, ribbon splines, glyph quads, manage uniforms
 */

import * as THREE from 'three';
import { memoryStreamVertexShader } from './shaders/memory-stream-vertex';
import { memoryStreamFragmentShader } from './shaders/memory-stream-fragment';

export interface MemoryStreamEngineConfig {
  intensity?: number;
  mouse?: { x: number; y: number };
  parallaxStrength?: number;
  numParticles?: number;
  numRibbons?: number;
  numGlyphs?: number;
}

export interface ParticleData {
  position: THREE.Vector3;
  orbitSpeed: number;
  size: number;
}

export interface RibbonData {
  points: THREE.Vector3[];
}

export interface GlyphData {
  position: THREE.Vector3;
  size: number;
}

export class MemoryStreamEngine {
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private config: MemoryStreamEngineConfig;
  
  private particles: ParticleData[] = [];
  private ribbons: RibbonData[] = [];
  private glyphs: GlyphData[] = [];
  
  private numParticles: number;
  private numRibbons: number;
  private numGlyphs: number;
  
  private breathPhase: number = 0;
  private breathStrength: number = 0;
  private blessingWaveProgress: number = 0;
  private scrollProgress: number = 0;
  private pulseIntensity: number = 0;
  private pulseDamping: number = 0.9;

  constructor(config: MemoryStreamEngineConfig = {}) {
    this.config = {
      intensity: config.intensity || 1.0,
      mouse: config.mouse || { x: 0, y: 0 },
      parallaxStrength: config.parallaxStrength || 1.0,
      numParticles: config.numParticles || 200,
      numRibbons: config.numRibbons || 4,
      numGlyphs: config.numGlyphs || 8,
    };
    
    this.numParticles = this.config.numParticles || 200;
    this.numRibbons = this.config.numRibbons || 4;
    this.numGlyphs = this.config.numGlyphs || 8;
    
    // Generate particle attributes
    this.generateParticles();
    
    // Generate ribbon splines
    this.generateRibbons();
    
    // Generate glyph quads
    this.generateGlyphs();
    
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
      },
      vertexShader: memoryStreamVertexShader,
      fragmentShader: memoryStreamFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    
    // Create mesh
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  /**
   * Generate particle attributes (positions, orbit speed, size)
   */
  private generateParticles(): void {
    this.particles = [];
    
    for (let i = 0; i < this.numParticles; i++) {
      const t = i / this.numParticles;
      
      // Random orbit speed
      const orbitSpeed = 0.3 + Math.random() * 0.4; // 0.3 to 0.7
      
      // Random size
      const size = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
      
      // Initial position (will be updated in shader)
      const position = new THREE.Vector3(0, 0, 0);
      
      this.particles.push({
        position,
        orbitSpeed,
        size,
      });
    }
  }

  /**
   * Generate ribbon splines (3-5)
   */
  private generateRibbons(): void {
    this.ribbons = [];
    
    for (let i = 0; i < this.numRibbons; i++) {
      const points: THREE.Vector3[] = [];
      const numPoints = 32; // Points per ribbon
      
      for (let j = 0; j < numPoints; j++) {
        const t = j / (numPoints - 1);
        const point = this.phiSpiralRibbon(t, i);
        points.push(point);
      }
      
      this.ribbons.push({ points });
    }
  }

  /**
   * Phi-based spiral for ribbons
   */
  private phiSpiralRibbon(t: number, ribbonId: number): THREE.Vector3 {
    const phi = 1.618033988749895;
    const spiralRadius = 0.6;
    const spiralTurns = 2.0;
    const spiralHeight = 0.0;
    
    // Offset each ribbon
    const ribbonOffset = ribbonId * 0.3;
    
    // Angle based on phi and ribbon offset
    const angle = (t * spiralTurns + ribbonOffset) * Math.PI * 2;
    const radius = t * spiralRadius;
    
    // X-Z plane spiral (horizontal)
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    
    // Y position (vertical lift with scroll)
    const y = spiralHeight + t * 0.4;
    
    return new THREE.Vector3(x, y, z);
  }

  /**
   * Generate glyph quads
   */
  private generateGlyphs(): void {
    this.glyphs = [];
    
    for (let i = 0; i < this.numGlyphs; i++) {
      const t = i / this.numGlyphs;
      
      // Initial position (will be updated in shader for orbit)
      const position = new THREE.Vector3(0, 0, 0);
      
      // Random size
      const size = 0.9 + Math.random() * 0.2; // 0.9 to 1.1
      
      this.glyphs.push({
        position,
        size,
      });
    }
  }

  /**
   * Create geometry with particles, ribbons, and glyphs
   */
  private createGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    
    const positions: number[] = [];
    const uvs: number[] = [];
    const particleIndices: number[] = [];
    const ribbonIndices: number[] = [];
    const glyphIndices: number[] = [];
    const orbitSpeeds: number[] = [];
    const particleSizes: number[] = [];
    
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
      glyphIndices.push(-1, -1, -1, -1);
      
      // Orbit speed and size
      orbitSpeeds.push(particle.orbitSpeed, particle.orbitSpeed, particle.orbitSpeed, particle.orbitSpeed);
      particleSizes.push(particle.size, particle.size, particle.size, particle.size);
    }
    
    // ============================================
    // RIBBONS (Layer B)
    // ============================================
    const ribbonWidth = 0.02;
    const ribbonSegments = 32;
    
    for (let i = 0; i < this.numRibbons; i++) {
      const ribbon = this.ribbons[i];
      
      for (let j = 0; j < ribbonSegments; j++) {
        const t = j / (ribbonSegments - 1);
        const point = ribbon.points[Math.floor(t * (ribbon.points.length - 1))];
        
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
        ribbonIndices.push(i, i, i, i);
        glyphIndices.push(-1, -1, -1, -1);
        
        // Orbit speed and size (not used for ribbons)
        orbitSpeeds.push(0, 0, 0, 0);
        particleSizes.push(1, 1, 1, 1);
      }
    }
    
    // ============================================
    // GLYPHS (Layer C)
    // ============================================
    const glyphSize = 0.15;
    
    for (let i = 0; i < this.numGlyphs; i++) {
      const glyph = this.glyphs[i];
      
      // Create quad for each glyph
      const x = glyph.position.x;
      const y = glyph.position.y;
      const z = glyph.position.z;
      
      // Quad vertices (4 vertices per glyph)
      positions.push(
        x - glyphSize, y - glyphSize, z, // Bottom-left
        x + glyphSize, y - glyphSize, z, // Bottom-right
        x - glyphSize, y + glyphSize, z, // Top-left
        x + glyphSize, y + glyphSize, z  // Top-right
      );
      
      // UVs
      uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
      
      // Indices
      particleIndices.push(-1, -1, -1, -1);
      ribbonIndices.push(-1, -1, -1, -1);
      glyphIndices.push(i, i, i, i);
      
      // Orbit speed and size (not used for glyphs)
      orbitSpeeds.push(0, 0, 0, 0);
      particleSizes.push(glyph.size, glyph.size, glyph.size, glyph.size);
    }
    
    // Set attributes
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setAttribute('particleIndex', new THREE.Float32BufferAttribute(particleIndices, 1));
    geometry.setAttribute('ribbonIndex', new THREE.Float32BufferAttribute(ribbonIndices, 1));
    geometry.setAttribute('glyphIndex', new THREE.Float32BufferAttribute(glyphIndices, 1));
    geometry.setAttribute('orbitSpeed', new THREE.Float32BufferAttribute(orbitSpeeds, 1));
    geometry.setAttribute('particleSize', new THREE.Float32BufferAttribute(particleSizes, 1));
    
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
    
    // Ribbons
    for (let i = 0; i < this.numRibbons; i++) {
      for (let j = 0; j < ribbonSegments; j++) {
        const base = vertexIndex;
        indices.push(
          base, base + 1, base + 2,
          base + 1, base + 3, base + 2
        );
        vertexIndex += 4;
      }
    }
    
    // Glyphs
    for (let i = 0; i < this.numGlyphs; i++) {
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
   * Set glyph count
   */
  setGlyphCount(n: number): void {
    if (n !== this.numGlyphs) {
      this.numGlyphs = n;
      this.generateGlyphs();
      // Geometry would need to be regenerated, but for now we'll keep existing
    }
  }

  /**
   * Pulse memory stream
   */
  pulse(intensity: number = 1.0): void {
    this.pulseIntensity = intensity;
  }

  /**
   * Update with memory stream state
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
    
    // Update pulse (decay)
    this.pulseIntensity *= this.pulseDamping;
    
    // Update intensity (with pulse)
    const finalIntensity = (this.config.intensity || 1.0) * (1.0 + this.pulseIntensity * 0.2);
    this.material.uniforms.uIntensity.value = finalIntensity;
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

