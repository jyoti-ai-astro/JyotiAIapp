/**
 * Divine Compass Engine
 * 
 * Phase 2 — Section 27: DIVINE COMPASS ENGINE
 * Divine Compass Engine (E31)
 * 
 * Generate compass ring, direction glyphs, star mandala, arrow, manage uniforms
 */

import * as THREE from 'three';
import { compassVertexShader } from './shaders/compass-vertex';
import { compassFragmentShader } from './shaders/compass-fragment';

export interface DivineCompassEngineConfig {
  intensity?: number;
  mouse?: { x: number; y: number };
  parallaxStrength?: number;
  numStarPoints?: number;
  includeGlyphs?: boolean;
}

export interface CompassRingData {
  radius: number;
}

export interface GlyphData {
  glyphIndex: number;
  directionAngle: number;
}

export interface StarData {
  numPoints: number;
  radius: number;
}

export interface ArrowData {
  position: THREE.Vector3;
}

export class DivineCompassEngine {
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private config: DivineCompassEngineConfig;
  
  private compassRing: CompassRingData;
  private glyphs: GlyphData[] = [];
  private star: StarData;
  private arrow: ArrowData;
  
  private numStarPoints: number;
  private includeGlyphs: boolean;
  
  private breathPhase: number = 0;
  private breathStrength: number = 0;
  private blessingWaveProgress: number = 0;
  private scrollProgress: number = 0;
  private rotationSync: number = 0;
  private cameraFOV: number = 75.0;

  constructor(config: DivineCompassEngineConfig = {}) {
    this.config = {
      intensity: config.intensity || 1.0,
      mouse: config.mouse || { x: 0, y: 0 },
      parallaxStrength: config.parallaxStrength || 1.0,
      numStarPoints: config.numStarPoints || 12,
      includeGlyphs: config.includeGlyphs !== undefined ? config.includeGlyphs : true,
    };
    
    this.numStarPoints = this.config.numStarPoints || 12;
    this.includeGlyphs = this.config.includeGlyphs !== undefined ? this.config.includeGlyphs : true;
    
    // Generate compass ring (64 segments)
    this.generateCompassRing();
    
    // Generate direction glyphs (8 glyph quads)
    if (this.includeGlyphs) {
      this.generateGlyphs();
    }
    
    // Generate star mandala (12 points)
    this.generateStar();
    
    // Generate arrow quad
    this.generateArrow();
    
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
      vertexShader: compassVertexShader,
      fragmentShader: compassFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    
    // Create mesh
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  /**
   * Generate compass ring (64 segments)
   */
  private generateCompassRing(): void {
    this.compassRing = {
      radius: 0.5,
    };
  }

  /**
   * Generate direction glyphs (8 glyph quads)
   */
  private generateGlyphs(): void {
    this.glyphs = [];
    
    // 8 directions: N, NE, E, SE, S, SW, W, NW
    for (let i = 0; i < 8; i++) {
      const directionAngle = (i / 8.0) * Math.PI * 2;
      this.glyphs.push({
        glyphIndex: i,
        directionAngle,
      });
    }
  }

  /**
   * Generate star mandala (12 points)
   */
  private generateStar(): void {
    this.star = {
      numPoints: this.numStarPoints,
      radius: 0.35,
    };
  }

  /**
   * Generate arrow quad
   */
  private generateArrow(): void {
    this.arrow = {
      position: new THREE.Vector3(0, 0, 0),
    };
  }

  /**
   * Create geometry with compass ring, glyphs, star, and arrow
   */
  private createGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    
    const positions: number[] = [];
    const uvs: number[] = [];
    const compassRingIndices: number[] = [];
    const glyphIndices: number[] = [];
    const starIndices: number[] = [];
    const arrowIndices: number[] = [];
    
    // ============================================
    // COMPASS RING (Layer A)
    // ============================================
    const ringRadius = 0.5;
    const ringSegments = 64;
    
    for (let i = 0; i < ringSegments; i++) {
      const t = i / ringSegments;
      const angle = t * Math.PI * 2;
      const radius = ringRadius;
      
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = 0;
      
      // Create quad for ring segment
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
      compassRingIndices.push(0, 0, 0, 0); // Single compass ring
      glyphIndices.push(-1, -1, -1, -1);
      starIndices.push(-1, -1, -1, -1);
      arrowIndices.push(-1, -1, -1, -1);
    }
    
    // ============================================
    // DIRECTION GLYPHS (Layer A)
    // ============================================
    if (this.includeGlyphs) {
      const glyphSize = 0.05;
      
      for (let i = 0; i < this.glyphs.length; i++) {
        const glyph = this.glyphs[i];
        const glyphRadius = 0.45;
        
        const x = Math.cos(glyph.directionAngle) * glyphRadius;
        const y = Math.sin(glyph.directionAngle) * glyphRadius;
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
        compassRingIndices.push(-1, -1, -1, -1);
        glyphIndices.push(i, i, i, i);
        starIndices.push(-1, -1, -1, -1);
        arrowIndices.push(-1, -1, -1, -1);
      }
    }
    
    // ============================================
    // STAR MANDALA (Layer B)
    // ============================================
    const starRadius = 0.35;
    const starSegments = this.numStarPoints * 2; // 2 segments per point
    
    for (let i = 0; i < starSegments; i++) {
      const t = i / starSegments;
      const angle = t * Math.PI * 2;
      const radius = starRadius;
      
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = 0;
      
      // Create quad for star segment
      const segmentSize = 0.015;
      positions.push(
        x - segmentSize, y - segmentSize, z, // Bottom-left
        x + segmentSize, y - segmentSize, z, // Bottom-right
        x - segmentSize, y + segmentSize, z, // Top-left
        x + segmentSize, y + segmentSize, z  // Top-right
      );
      
      // UVs
      uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
      
      // Indices
      compassRingIndices.push(-1, -1, -1, -1);
      glyphIndices.push(-1, -1, -1, -1);
      starIndices.push(0, 0, 0, 0); // Single star
      arrowIndices.push(-1, -1, -1, -1);
    }
    
    // ============================================
    // ARROW (Layer C)
    // ============================================
    const arrowSize = 0.08;
    const x = 0;
    const y = 0;
    const z = 0;
    
    // Create quad for arrow
    positions.push(
      x - arrowSize, y - arrowSize, z, // Bottom-left
      x + arrowSize, y - arrowSize, z, // Bottom-right
      x - arrowSize, y + arrowSize, z, // Top-left
      x + arrowSize, y + arrowSize, z  // Top-right
    );
    
    // UVs
    uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
    
    // Indices
    compassRingIndices.push(-1, -1, -1, -1);
    glyphIndices.push(-1, -1, -1, -1);
    starIndices.push(-1, -1, -1, -1);
    arrowIndices.push(0, 0, 0, 0);
    
    // Set attributes
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setAttribute('compassRingIndex', new THREE.Float32BufferAttribute(compassRingIndices, 1));
    geometry.setAttribute('glyphIndex', new THREE.Float32BufferAttribute(glyphIndices, 1));
    geometry.setAttribute('starIndex', new THREE.Float32BufferAttribute(starIndices, 1));
    geometry.setAttribute('arrowIndex', new THREE.Float32BufferAttribute(arrowIndices, 1));
    
    // Create indices for quads
    const indices: number[] = [];
    let vertexIndex = 0;
    
    // Compass ring
    for (let i = 0; i < ringSegments; i++) {
      const base = vertexIndex;
      indices.push(
        base, base + 1, base + 2,
        base + 1, base + 3, base + 2
      );
      vertexIndex += 4;
    }
    
    // Glyphs
    if (this.includeGlyphs) {
      for (let i = 0; i < this.glyphs.length; i++) {
        const base = vertexIndex;
        indices.push(
          base, base + 1, base + 2,
          base + 1, base + 3, base + 2
        );
        vertexIndex += 4;
      }
    }
    
    // Star
    for (let i = 0; i < starSegments; i++) {
      const base = vertexIndex;
      indices.push(
        base, base + 1, base + 2,
        base + 1, base + 3, base + 2
      );
      vertexIndex += 4;
    }
    
    // Arrow
    const base = vertexIndex;
    indices.push(
      base, base + 1, base + 2,
      base + 1, base + 3, base + 2
    );
    
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
   * Update with divine compass state
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

