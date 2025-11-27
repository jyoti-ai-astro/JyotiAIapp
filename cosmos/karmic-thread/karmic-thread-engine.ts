/**
 * Karmic Thread Engine
 * 
 * Phase 2 — Section 25: COSMIC KARMIC THREAD ENGINE
 * Karmic Thread Engine (E29)
 * 
 * Generate root thread, parallel threads, glyph quads, manage uniforms
 */

import * as THREE from 'three';
import { karmicThreadVertexShader } from './shaders/karmic-thread-vertex';
import { karmicThreadFragmentShader } from './shaders/karmic-thread-fragment';

export interface KarmicThreadEngineConfig {
  intensity?: number;
  mouse?: { x: number; y: number };
  parallaxStrength?: number;
  numThreads?: number;
  numGlyphs?: number;
}

export interface RootThreadData {
  points: THREE.Vector3[];
}

export interface ParallelThreadData {
  threadId: number;
  points: THREE.Vector3[];
}

export interface GlyphData {
  glyphIndex: number;
  t: number; // Position along root thread (0-1)
  position: THREE.Vector3;
}

export class KarmicThreadEngine {
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private config: KarmicThreadEngineConfig;
  
  private rootThread: RootThreadData;
  private parallelThreads: ParallelThreadData[] = [];
  private glyphs: GlyphData[] = [];
  
  private numThreads: number;
  private numGlyphs: number;
  
  private breathPhase: number = 0;
  private breathStrength: number = 0;
  private blessingWaveProgress: number = 0;
  private scrollProgress: number = 0;
  private rotationSync: number = 0;
  private cameraFOV: number = 75.0;

  constructor(config: KarmicThreadEngineConfig = {}) {
    this.config = {
      intensity: config.intensity || 1.0,
      mouse: config.mouse || { x: 0, y: 0 },
      parallaxStrength: config.parallaxStrength || 1.0,
      numThreads: config.numThreads || 5,
      numGlyphs: config.numGlyphs || 8,
    };
    
    this.numThreads = this.config.numThreads || 5;
    this.numGlyphs = this.config.numGlyphs || 8;
    
    // Generate root thread (64 points)
    this.generateRootThread();
    
    // Generate parallel threads (4-6)
    this.generateParallelThreads();
    
    // Generate 5-10 glyph quads
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
        uRotationSync: { value: 0 },
        uCameraFOV: { value: 75.0 },
      },
      vertexShader: karmicThreadVertexShader,
      fragmentShader: karmicThreadFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    
    // Create mesh
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  /**
   * Generate root thread (64 points)
   */
  private generateRootThread(): void {
    const points: THREE.Vector3[] = [];
    const numPoints = 64;
    
    for (let i = 0; i < numPoints; i++) {
      const t = i / (numPoints - 1);
      const x = 0.0; // Centered
      const y = -0.5 + t * 1.5; // Extends vertically
      const z = -2.0; // Behind Guru
      points.push(new THREE.Vector3(x, y, z));
    }
    
    this.rootThread = { points };
  }

  /**
   * Generate parallel threads (4-6)
   */
  private generateParallelThreads(): void {
    this.parallelThreads = [];
    
    for (let i = 0; i < this.numThreads; i++) {
      const threadId = i / (this.numThreads - 1); // 0 to 1
      const points: THREE.Vector3[] = [];
      const numPoints = 64;
      
      for (let j = 0; j < numPoints; j++) {
        const t = j / (numPoints - 1);
        const basePoint = this.rootThread.points[j];
        
        // Diverge from root thread along phi offsets
        const PHI = 1.618033988749895;
        const phiOffset = Math.sin(t * PHI) * 0.15;
        const xOffset = phiOffset * (threadId - 0.5) * 2.0;
        
        const point = new THREE.Vector3(
          basePoint.x + xOffset,
          basePoint.y,
          basePoint.z
        );
        points.push(point);
      }
      
      this.parallelThreads.push({
        threadId,
        points,
      });
    }
  }

  /**
   * Generate 5-10 glyph quads
   */
  private generateGlyphs(): void {
    this.glyphs = [];
    
    for (let i = 0; i < this.numGlyphs; i++) {
      const glyphIndex = i;
      const t = i / (this.numGlyphs - 1); // 0 to 1 along root
      
      // Position along root thread
      const pointIndex = Math.floor(t * (this.rootThread.points.length - 1));
      const position = this.rootThread.points[pointIndex].clone();
      
      this.glyphs.push({
        glyphIndex,
        t,
        position,
      });
    }
  }

  /**
   * Create geometry with root thread, parallel threads, and glyphs
   */
  private createGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    
    const positions: number[] = [];
    const uvs: number[] = [];
    const rootThreadIndices: number[] = [];
    const parallelThreadIndices: number[] = [];
    const glyphIndices: number[] = [];
    const threadTs: number[] = [];
    
    // ============================================
    // ROOT THREAD (Layer A)
    // ============================================
    const threadWidth = 0.01;
    const threadSegments = 64;
    
    for (let i = 0; i < threadSegments; i++) {
      const t = i / (threadSegments - 1);
      const point = this.rootThread.points[i];
      
      // Create quad for thread segment
      const x = point.x;
      const y = point.y;
      const z = point.z;
      
      // Quad vertices (4 vertices per segment)
      positions.push(
        x - threadWidth, y, z, // Left
        x + threadWidth, y, z, // Right
        x - threadWidth, y, z, // Left (duplicate for quad)
        x + threadWidth, y, z  // Right (duplicate for quad)
      );
      
      // UVs
      uvs.push(0, t, 1, t, 0, t, 1, t);
      
      // Indices
      rootThreadIndices.push(0, 0, 0, 0); // Single root thread
      parallelThreadIndices.push(-1, -1, -1, -1);
      glyphIndices.push(-1, -1, -1, -1);
      
      // Thread T (position along thread)
      threadTs.push(t, t, t, t);
    }
    
    // ============================================
    // PARALLEL THREADS (Layer B)
    // ============================================
    const parallelThreadWidth = 0.008;
    
    for (let threadIdx = 0; threadIdx < this.numThreads; threadIdx++) {
      const thread = this.parallelThreads[threadIdx];
      
      for (let i = 0; i < threadSegments; i++) {
        const t = i / (threadSegments - 1);
        const point = thread.points[i];
        
        // Create quad for thread segment
        const x = point.x;
        const y = point.y;
        const z = point.z;
        
        // Quad vertices (4 vertices per segment)
        positions.push(
          x - parallelThreadWidth, y, z, // Left
          x + parallelThreadWidth, y, z, // Right
          x - parallelThreadWidth, y, z, // Left (duplicate for quad)
          x + parallelThreadWidth, y, z  // Right (duplicate for quad)
        );
        
        // UVs
        uvs.push(0, t, 1, t, 0, t, 1, t);
        
        // Indices
        rootThreadIndices.push(-1, -1, -1, -1);
        parallelThreadIndices.push(threadIdx, threadIdx, threadIdx, threadIdx);
        glyphIndices.push(-1, -1, -1, -1);
        
        // Thread T
        threadTs.push(t, t, t, t);
      }
    }
    
    // ============================================
    // GLYPHS (Layer C)
    // ============================================
    const glyphSize = 0.08;
    
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
      rootThreadIndices.push(-1, -1, -1, -1);
      parallelThreadIndices.push(-1, -1, -1, -1);
      glyphIndices.push(i, i, i, i);
      
      // Thread T (glyph position along root)
      threadTs.push(glyph.t, glyph.t, glyph.t, glyph.t);
    }
    
    // Set attributes
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setAttribute('rootThreadIndex', new THREE.Float32BufferAttribute(rootThreadIndices, 1));
    geometry.setAttribute('parallelThreadIndex', new THREE.Float32BufferAttribute(parallelThreadIndices, 1));
    geometry.setAttribute('glyphIndex', new THREE.Float32BufferAttribute(glyphIndices, 1));
    geometry.setAttribute('threadT', new THREE.Float32BufferAttribute(threadTs, 1));
    
    // Create indices for quads
    const indices: number[] = [];
    let vertexIndex = 0;
    
    // Root thread
    for (let i = 0; i < threadSegments; i++) {
      const base = vertexIndex;
      indices.push(
        base, base + 1, base + 2,
        base + 1, base + 3, base + 2
      );
      vertexIndex += 4;
    }
    
    // Parallel threads
    for (let threadIdx = 0; threadIdx < this.numThreads; threadIdx++) {
      for (let i = 0; i < threadSegments; i++) {
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
   * Update with karmic thread state
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

