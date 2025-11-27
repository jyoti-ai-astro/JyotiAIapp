/**
 * Karma Wheel Engine
 * 
 * Phase 2 — Section 36: KARMA WHEEL ENGINE
 * Karma Wheel Engine (E40)
 * 
 * Generate outer ring, glyphs, core disc, manage uniforms
 */

import * as THREE from 'three';
import { karmaVertexShader } from './shaders/karma-vertex';
import { karmaFragmentShader } from './shaders/karma-fragment';

export interface KarmaWheelEngineConfig {
  intensity?: number;
  mouse?: { x: number; y: number };
  parallaxStrength?: number;
  ringSegments?: number;
  numGlyphs?: number;
}

export interface OuterRingData {
  radius: number;
  thickness: number;
  segments: number;
}

export interface GlyphData {
  glyphIndex: number;
  angle: number;
  radius: number;
  distance: number;
}

export interface CoreData {
  radius: number;
  segments: number;
}

export class KarmaWheelEngine {
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private config: KarmaWheelEngineConfig;
  
  private outerRing: OuterRingData;
  private glyphs: GlyphData[] = [];
  private core: CoreData;
  
  private ringSegments: number;
  private numGlyphs: number;
  
  private breathPhase: number = 0;
  private breathStrength: number = 0;
  private blessingWaveProgress: number = 0;
  private scrollProgress: number = 0;
  private rotationSync: number = 0;
  private cameraFOV: number = 75.0;

  constructor(config: KarmaWheelEngineConfig = {}) {
    this.config = {
      intensity: config.intensity || 1.0,
      mouse: config.mouse || { x: 0, y: 0 },
      parallaxStrength: config.parallaxStrength || 1.0,
      ringSegments: config.ringSegments || 40,
      numGlyphs: config.numGlyphs || 16,
    };
    
    this.ringSegments = this.config.ringSegments || 40;
    this.numGlyphs = this.config.numGlyphs || 16;
    
    // Generate outer ring
    this.generateOuterRing();
    
    // Generate glyphs
    this.generateGlyphs();
    
    // Generate core
    this.generateCore();
    
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
      vertexShader: karmaVertexShader,
      fragmentShader: karmaFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    
    // Create mesh
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  /**
   * Generate outer ring
   */
  private generateOuterRing(): void {
    this.outerRing = {
      radius: 0.9,
      thickness: 0.025,
      segments: this.ringSegments,
    };
  }

  /**
   * Generate glyphs (12-20)
   */
  private generateGlyphs(): void {
    this.glyphs = [];
    
    for (let i = 0; i < this.numGlyphs; i++) {
      const angle = (i / this.numGlyphs) * Math.PI * 2;
      const radius = 0.08; // Glyph radius
      const distance = 0.65; // Glyph distance from center
      
      this.glyphs.push({
        glyphIndex: i,
        angle,
        radius,
        distance,
      });
    }
  }

  /**
   * Generate core
   */
  private generateCore(): void {
    this.core = {
      radius: 0.22,
      segments: 32,
    };
  }

  /**
   * Create geometry with outer ring, glyphs, and core
   */
  private createGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    
    const positions: number[] = [];
    const uvs: number[] = [];
    const outerRingIndices: number[] = [];
    const glyphIndices: number[] = [];
    const coreIndices: number[] = [];
    
    // ============================================
    // OUTER RING (Layer A)
    // ============================================
    const ringRadius = 0.9;
    const ringThickness = 0.025;
    
    for (let i = 0; i < this.ringSegments; i++) {
      const t = i / this.ringSegments;
      const angle = t * Math.PI * 2;
      const radius = ringRadius;
      
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = -4.2;
      
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
      outerRingIndices.push(0, 0, 0, 0); // Single outer ring
      glyphIndices.push(-1, -1, -1, -1);
      coreIndices.push(-1, -1, -1, -1);
    }
    
    // ============================================
    // GLYPHS (Layer B)
    // ============================================
    const glyphSize = 0.08;
    
    for (let i = 0; i < this.numGlyphs; i++) {
      const glyph = this.glyphs[i];
      
      // Position glyph
      const x = Math.cos(glyph.angle) * glyph.distance;
      const y = Math.sin(glyph.angle) * glyph.distance;
      const z = -4.2;
      
      // Create quad for each glyph
      positions.push(
        x - glyphSize, y - glyphSize, z, // Bottom-left
        x + glyphSize, y - glyphSize, z, // Bottom-right
        x - glyphSize, y + glyphSize, z, // Top-left
        x + glyphSize, y + glyphSize, z  // Top-right
      );
      
      // UVs
      uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
      
      // Indices
      outerRingIndices.push(-1, -1, -1, -1);
      glyphIndices.push(i, i, i, i);
      coreIndices.push(-1, -1, -1, -1);
    }
    
    // ============================================
    // CORE (Layer C)
    // ============================================
    const coreRadius = 0.22;
    
    for (let i = 0; i < this.core.segments; i++) {
      const t = i / this.core.segments;
      const angle = t * Math.PI * 2;
      const radius = coreRadius;
      
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = -4.2;
      
      // Create quad for core segment
      const segmentSize = 0.01;
      positions.push(
        x - segmentSize, y - segmentSize, z, // Bottom-left
        x + segmentSize, y - segmentSize, z, // Bottom-right
        x - segmentSize, y + segmentSize, z, // Top-left
        x + segmentSize, y + segmentSize, z  // Top-right
      );
      
      // UVs
      uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
      
      // Indices
      outerRingIndices.push(-1, -1, -1, -1);
      glyphIndices.push(-1, -1, -1, -1);
      coreIndices.push(0, 0, 0, 0); // Single core
    }
    
    // Set attributes
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setAttribute('outerRingIndex', new THREE.Float32BufferAttribute(outerRingIndices, 1));
    geometry.setAttribute('glyphIndex', new THREE.Float32BufferAttribute(glyphIndices, 1));
    geometry.setAttribute('coreIndex', new THREE.Float32BufferAttribute(coreIndices, 1));
    
    // Create indices
    const indices: number[] = [];
    let vertexIndex = 0;
    
    // Outer ring (quads)
    for (let i = 0; i < this.ringSegments; i++) {
      const base = vertexIndex;
      indices.push(
        base, base + 1, base + 2,
        base + 1, base + 3, base + 2
      );
      vertexIndex += 4;
    }
    
    // Glyphs (quads)
    for (let i = 0; i < this.numGlyphs; i++) {
      const base = vertexIndex;
      indices.push(
        base, base + 1, base + 2,
        base + 1, base + 3, base + 2
      );
      vertexIndex += 4;
    }
    
    // Core (quads)
    for (let i = 0; i < this.core.segments; i++) {
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
   * Update with karma wheel state
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

