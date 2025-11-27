/**
 * Soul Mirror Engine
 * 
 * Phase 2 — Section 26: SOUL MIRROR ENGINE
 * Soul Mirror Engine (E30)
 * 
 * Generate mirror disc, echo rings, glyphs, manage uniforms
 */

import * as THREE from 'three';
import { soulMirrorVertexShader } from './shaders/soul-mirror-vertex';
import { soulMirrorFragmentShader } from './shaders/soul-mirror-fragment';

export interface SoulMirrorEngineConfig {
  intensity?: number;
  mouse?: { x: number; y: number };
  parallaxStrength?: number;
  numEchoRings?: number;
  numGlyphs?: number;
}

export interface MirrorDiscData {
  radius: number;
}

export interface EchoRingData {
  ringIndex: number;
  radius: number;
}

export interface GlyphData {
  glyphIndex: number;
  orbitAngle: number;
  orbitRadius: number;
}

export class SoulMirrorEngine {
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private config: SoulMirrorEngineConfig;
  
  private mirrorDisc: MirrorDiscData;
  private echoRings: EchoRingData[] = [];
  private glyphs: GlyphData[] = [];
  
  private numEchoRings: number;
  private numGlyphs: number;
  
  private breathPhase: number = 0;
  private breathStrength: number = 0;
  private blessingWaveProgress: number = 0;
  private scrollProgress: number = 0;
  private rotationSync: number = 0;
  private cameraFOV: number = 75.0;

  constructor(config: SoulMirrorEngineConfig = {}) {
    this.config = {
      intensity: config.intensity || 1.0,
      mouse: config.mouse || { x: 0, y: 0 },
      parallaxStrength: config.parallaxStrength || 1.0,
      numEchoRings: config.numEchoRings || 4,
      numGlyphs: config.numGlyphs || 9,
    };
    
    this.numEchoRings = this.config.numEchoRings || 4;
    this.numGlyphs = this.config.numGlyphs || 9;
    
    // Generate mirror disc (high-poly circle)
    this.generateMirrorDisc();
    
    // Generate echo rings (3-5)
    this.generateEchoRings();
    
    // Generate glyphs (6-12)
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
      vertexShader: soulMirrorVertexShader,
      fragmentShader: soulMirrorFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    
    // Create mesh
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  /**
   * Generate mirror disc (high-poly circle)
   */
  private generateMirrorDisc(): void {
    this.mirrorDisc = {
      radius: 0.7,
    };
  }

  /**
   * Generate echo rings (3-5)
   */
  private generateEchoRings(): void {
    this.echoRings = [];
    
    for (let i = 0; i < this.numEchoRings; i++) {
      this.echoRings.push({
        ringIndex: i,
        radius: 0.75 + i * 0.15, // Expanding rings
      });
    }
  }

  /**
   * Generate glyphs (6-12)
   */
  private generateGlyphs(): void {
    this.glyphs = [];
    
    for (let i = 0; i < this.numGlyphs; i++) {
      const orbitAngle = (i / this.numGlyphs) * Math.PI * 2;
      const orbitRadius = 0.6;
      
      this.glyphs.push({
        glyphIndex: i,
        orbitAngle,
        orbitRadius,
      });
    }
  }

  /**
   * Create geometry with mirror disc, echo rings, and glyphs
   */
  private createGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    
    const positions: number[] = [];
    const uvs: number[] = [];
    const mirrorDiscIndices: number[] = [];
    const echoRingIndices: number[] = [];
    const glyphIndices: number[] = [];
    
    // ============================================
    // MIRROR DISC (Layer A)
    // ============================================
    const discRadius = 0.7;
    const discSegments = 64; // High-poly circle
    
    for (let i = 0; i < discSegments; i++) {
      const t = i / discSegments;
      const angle = t * Math.PI * 2;
      const radius = discRadius;
      
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = 0;
      
      // Create quad for disc segment
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
      mirrorDiscIndices.push(0, 0, 0, 0); // Single mirror disc
      echoRingIndices.push(-1, -1, -1, -1);
      glyphIndices.push(-1, -1, -1, -1);
    }
    
    // ============================================
    // ECHO RINGS (Layer B)
    // ============================================
    const ringThickness = 0.02;
    const ringSegments = 32;
    
    for (let ringIdx = 0; ringIdx < this.numEchoRings; ringIdx++) {
      const ring = this.echoRings[ringIdx];
      
      for (let i = 0; i < ringSegments; i++) {
        const t = i / ringSegments;
        const angle = t * Math.PI * 2;
        const radius = ring.radius;
        
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const z = 0;
        
        // Create quad for ring segment
        const segmentSize = ringThickness;
        positions.push(
          x - segmentSize, y - segmentSize, z, // Bottom-left
          x + segmentSize, y - segmentSize, z, // Bottom-right
          x - segmentSize, y + segmentSize, z, // Top-left
          x + segmentSize, y + segmentSize, z  // Top-right
        );
        
        // UVs
        uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
        
        // Indices
        mirrorDiscIndices.push(-1, -1, -1, -1);
        echoRingIndices.push(ringIdx, ringIdx, ringIdx, ringIdx);
        glyphIndices.push(-1, -1, -1, -1);
      }
    }
    
    // ============================================
    // GLYPHS (Layer C)
    // ============================================
    const glyphSize = 0.06;
    
    for (let i = 0; i < this.numGlyphs; i++) {
      const glyph = this.glyphs[i];
      
      // Polar orbit position
      const x = Math.cos(glyph.orbitAngle) * glyph.orbitRadius;
      const y = Math.sin(glyph.orbitAngle) * glyph.orbitRadius;
      const z = 0;
      
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
      mirrorDiscIndices.push(-1, -1, -1, -1);
      echoRingIndices.push(-1, -1, -1, -1);
      glyphIndices.push(i, i, i, i);
    }
    
    // Set attributes
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setAttribute('mirrorDiscIndex', new THREE.Float32BufferAttribute(mirrorDiscIndices, 1));
    geometry.setAttribute('echoRingIndex', new THREE.Float32BufferAttribute(echoRingIndices, 1));
    geometry.setAttribute('glyphIndex', new THREE.Float32BufferAttribute(glyphIndices, 1));
    
    // Create indices for quads
    const indices: number[] = [];
    let vertexIndex = 0;
    
    // Mirror disc
    for (let i = 0; i < discSegments; i++) {
      const base = vertexIndex;
      indices.push(
        base, base + 1, base + 2,
        base + 1, base + 3, base + 2
      );
      vertexIndex += 4;
    }
    
    // Echo rings
    for (let ringIdx = 0; ringIdx < this.numEchoRings; ringIdx++) {
      for (let i = 0; i < ringSegments; i++) {
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
   * Update with soul mirror state
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

