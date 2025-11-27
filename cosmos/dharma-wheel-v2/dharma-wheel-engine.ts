/**
 * Dharma Wheel v2 Engine
 * 
 * Phase 2 — Section 55: DHARMA WHEEL ENGINE v2
 * Dharma Wheel Engine v2 (E59)
 * 
 * Generate all 7 layers: core mandala disk, rotating karmic spokes, outer chakra ring, karmic glyphs, rotating mantra bands, aura flame shell, mandala dust field
 */

import * as THREE from 'three';
import { dharmaWheelVertexShader } from './shaders/dharma-wheel-vertex';
import { dharmaWheelFragmentShader } from './shaders/dharma-wheel-fragment';

export interface DharmaWheelEngineConfig {
  intensity?: number;
  mouse?: { x: number; y: number };
  parallaxStrength?: number;
  numSpokes?: number;
  numGlyphs?: number;
  numDust?: number;
}

export interface SpokeData {
  spokeIndex: number;
  angle: number; // 0 to 2π
}

export interface ChakraRingData {
  ringIndex: number;
  baseRadius: number; // 3.8, 4.2, 4.6
}

export interface GlyphData {
  glyphIndex: number;
  angle: number; // 0 to 2π
  baseRadius: number; // 3.2
}

export interface MantraBandData {
  bandIndex: number;
  baseRadius: number; // 2.8, 3.4
}

export class DharmaWheelEngine {
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private config: DharmaWheelEngineConfig;
  
  private spokes: SpokeData[] = [];
  private chakraRings: ChakraRingData[] = [];
  private glyphs: GlyphData[] = [];
  private mantraBands: MantraBandData[] = [];
  
  private numSpokes: number;
  private numGlyphs: number;
  private numDust: number;
  
  private breathPhase: number = 0;
  private breathStrength: number = 0;
  private blessingWaveProgress: number = 0;
  private scrollProgress: number = 0;
  private rotationSync: number = 0;
  private cameraFOV: number = 75.0;

  constructor(config: DharmaWheelEngineConfig = {}) {
    this.config = {
      intensity: config.intensity || 1.0,
      mouse: config.mouse || { x: 0, y: 0 },
      parallaxStrength: config.parallaxStrength || 1.0,
      numSpokes: config.numSpokes || 16,
      numGlyphs: config.numGlyphs || 48,
      numDust: config.numDust || 260,
    };
    
    this.numSpokes = this.config.numSpokes || 16;
    this.numGlyphs = this.config.numGlyphs || 48;
    this.numDust = this.config.numDust || 260;
    
    // Generate spokes (8, 12, or 16)
    this.generateSpokes();
    
    // Generate chakra rings (3)
    this.generateChakraRings();
    
    // Generate glyphs (32–48)
    this.generateGlyphs();
    
    // Generate mantra bands (2)
    this.generateMantraBands();
    
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
      vertexShader: dharmaWheelVertexShader,
      fragmentShader: dharmaWheelFragmentShader,
      transparent: true,
      blending: THREE.NormalBlending, // Base layer uses normal blending
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    
    // Create mesh
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  /**
   * Generate spokes (8, 12, or 16)
   */
  private generateSpokes(): void {
    this.spokes = [];
    
    for (let i = 0; i < this.numSpokes; i++) {
      const angle = (i / this.numSpokes) * Math.PI * 2.0;
      this.spokes.push({
        spokeIndex: i,
        angle,
      });
    }
  }

  /**
   * Generate chakra rings (3)
   */
  private generateChakraRings(): void {
    this.chakraRings = [];
    
    for (let i = 0; i < 3; i++) {
      const baseRadius = 3.8 + i * 0.4; // 3.8, 4.2, 4.6
      this.chakraRings.push({
        ringIndex: i,
        baseRadius,
      });
    }
  }

  /**
   * Generate glyphs (32–48)
   */
  private generateGlyphs(): void {
    this.glyphs = [];
    
    for (let i = 0; i < this.numGlyphs; i++) {
      const angle = (i / this.numGlyphs) * Math.PI * 2.0;
      const baseRadius = 3.2;
      this.glyphs.push({
        glyphIndex: i,
        angle,
        baseRadius,
      });
    }
  }

  /**
   * Generate mantra bands (2)
   */
  private generateMantraBands(): void {
    this.mantraBands = [];
    
    for (let i = 0; i < 2; i++) {
      const baseRadius = 2.8 + i * 0.6; // 2.8, 3.4
      this.mantraBands.push({
        bandIndex: i,
        baseRadius,
      });
    }
  }

  /**
   * Create geometry with all 7 layers
   */
  private createGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    
    const positions: number[] = [];
    const uvs: number[] = [];
    const mandalaIndices: number[] = [];
    const spokeIndices: number[] = [];
    const chakraRingIndices: number[] = [];
    const glyphIndices: number[] = [];
    const mantraBandIndices: number[] = [];
    const flameIndices: number[] = [];
    const dustIndices: number[] = [];
    const radialSegments: number[] = [];
    const concentricRings: number[] = [];
    
    // ============================================
    // MANDALA DISK (Layer A - 64 radial + 32 concentric rings)
    // ============================================
    const diskRadius = 3.5;
    const radialSegmentsCount = 64;
    const concentricRingsCount = 32;
    
    for (let i = 0; i <= radialSegmentsCount; i++) {
      for (let j = 0; j <= concentricRingsCount; j++) {
        const u = i / radialSegmentsCount; // 0 to 1 (angle)
        const v = j / concentricRingsCount; // 0 to 1 (radius)
        
        const angle = u * Math.PI * 2.0;
        const radius = v * diskRadius;
        
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = 0.0;
        
        positions.push(x, y, z - 12.0);
        uvs.push(u, v);
        
        mandalaIndices.push(0); // Single mandala disk
        spokeIndices.push(-1);
        chakraRingIndices.push(-1);
        glyphIndices.push(-1);
        mantraBandIndices.push(-1);
        flameIndices.push(-1);
        dustIndices.push(-1);
        radialSegments.push(i);
        concentricRings.push(j);
      }
    }
    
    // ============================================
    // SPOKES (Layer B - 8, 12, or 16)
    // ============================================
    const spokeLength = 3.5;
    const spokeWidth = 0.08;
    const spokeSegments = 32;
    
    for (let spoke = 0; spoke < this.numSpokes; spoke++) {
      const spokeData = this.spokes[spoke];
      
      for (let i = 0; i < spokeSegments; i++) {
        const t1 = i / spokeSegments; // 0 to 1 along spoke
        const t2 = (i + 1) / spokeSegments;
        
        const radius1 = t1 * spokeLength;
        const radius2 = t2 * spokeLength;
        
        const x1 = Math.cos(spokeData.angle) * radius1;
        const z1 = Math.sin(spokeData.angle) * radius1;
        const x2 = Math.cos(spokeData.angle) * radius2;
        const z2 = Math.sin(spokeData.angle) * radius2;
        
        // Perpendicular direction for width
        const perpAngle = spokeData.angle + Math.PI / 2.0;
        const perpX = Math.cos(perpAngle);
        const perpZ = Math.sin(perpAngle);
        
        // Create quad for spoke segment (4 vertices)
        positions.push(
          x1 - perpX * spokeWidth * 0.5, 0.0, z1 - perpZ * spokeWidth * 0.5, // Bottom-left
          x1 + perpX * spokeWidth * 0.5, 0.0, z1 + perpZ * spokeWidth * 0.5, // Bottom-right
          x2 - perpX * spokeWidth * 0.5, 0.0, z2 - perpZ * spokeWidth * 0.5, // Top-left
          x2 + perpX * spokeWidth * 0.5, 0.0, z2 + perpZ * spokeWidth * 0.5  // Top-right
        );
        
        // UVs
        uvs.push(0, t1, 1, t1, 0, t2, 1, t2);
        
        // Indices
        spokeIndices.push(spoke, spoke, spoke, spoke);
        mandalaIndices.push(-1, -1, -1, -1);
        chakraRingIndices.push(-1, -1, -1, -1);
        glyphIndices.push(-1, -1, -1, -1);
        mantraBandIndices.push(-1, -1, -1, -1);
        flameIndices.push(-1, -1, -1, -1);
        dustIndices.push(-1, -1, -1, -1);
        radialSegments.push(i, i, i, i);
        concentricRings.push(0, 0, 0, 0);
      }
    }
    
    // ============================================
    // CHAKRA RINGS (Layer C - 3 rings)
    // ============================================
    const ringSegments = 64;
    const thickness = 0.15;
    
    for (let ring = 0; ring < 3; ring++) {
      const ringData = this.chakraRings[ring];
      
      for (let i = 0; i <= ringSegments; i++) {
        for (let j = 0; j <= 4; j++) { // Thickness segments
          const u = i / ringSegments; // 0 to 1 (angle)
          const v = j / 4.0; // 0 to 1 (thickness)
          
          const angle = u * Math.PI * 2.0;
          const radius = ringData.baseRadius + (v - 0.5) * thickness;
          
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          const y = 0.0;
          
          positions.push(x, y, z - 12.0);
          uvs.push(u, v);
          
          chakraRingIndices.push(ring);
          mandalaIndices.push(-1);
          spokeIndices.push(-1);
          glyphIndices.push(-1);
          mantraBandIndices.push(-1);
          flameIndices.push(-1);
          dustIndices.push(-1);
          radialSegments.push(i);
          concentricRings.push(j);
        }
      }
    }
    
    // ============================================
    // GLYPHS (Layer D - 32–48)
    // ============================================
    const glyphSize = 0.18;
    
    for (let i = 0; i < this.numGlyphs; i++) {
      const glyph = this.glyphs[i];
      const glyphX = Math.cos(glyph.angle) * glyph.baseRadius;
      const glyphZ = Math.sin(glyph.angle) * glyph.baseRadius;
      
      // Create quad for each glyph
      positions.push(
        glyphX - glyphSize, 0.0 - glyphSize, glyphZ - 12.0, // Bottom-left
        glyphX + glyphSize, 0.0 - glyphSize, glyphZ - 12.0, // Bottom-right
        glyphX - glyphSize, 0.0 + glyphSize, glyphZ - 12.0, // Top-left
        glyphX + glyphSize, 0.0 + glyphSize, glyphZ - 12.0  // Top-right
      );
      
      // UVs
      uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
      
      // Indices
      glyphIndices.push(i, i, i, i);
      mandalaIndices.push(-1, -1, -1, -1);
      spokeIndices.push(-1, -1, -1, -1);
      chakraRingIndices.push(-1, -1, -1, -1);
      mantraBandIndices.push(-1, -1, -1, -1);
      flameIndices.push(-1, -1, -1, -1);
      dustIndices.push(-1, -1, -1, -1);
      radialSegments.push(0, 0, 0, 0);
      concentricRings.push(0, 0, 0, 0);
    }
    
    // ============================================
    // MANTRA BANDS (Layer E - 2 bands)
    // ============================================
    const bandSegments = 64;
    const bandThickness = 0.12;
    
    for (let band = 0; band < 2; band++) {
      const bandData = this.mantraBands[band];
      
      for (let i = 0; i <= bandSegments; i++) {
        for (let j = 0; j <= 4; j++) { // Thickness segments
          const u = i / bandSegments; // 0 to 1 (angle)
          const v = j / 4.0; // 0 to 1 (thickness)
          
          const angle = u * Math.PI * 2.0;
          const radius = bandData.baseRadius + (v - 0.5) * bandThickness;
          
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          const y = 0.0;
          
          positions.push(x, y, z - 12.0);
          uvs.push(u, v);
          
          mantraBandIndices.push(band);
          mandalaIndices.push(-1);
          spokeIndices.push(-1);
          chakraRingIndices.push(-1);
          glyphIndices.push(-1);
          flameIndices.push(-1);
          dustIndices.push(-1);
          radialSegments.push(i);
          concentricRings.push(j);
        }
      }
    }
    
    // ============================================
    // FLAME SHELL (Layer F)
    // ============================================
    const flameBaseRadius = 4.0;
    const flameThickness = 1.5;
    const flameSegments = 64;
    const flameRings = 8;
    
    for (let i = 0; i <= flameSegments; i++) {
      for (let j = 0; j <= flameRings; j++) {
        const u = i / flameSegments; // 0 to 1 (angle)
        const v = j / flameRings; // 0 to 1 (thickness)
        
        const angle = u * Math.PI * 2.0;
        const radius = flameBaseRadius + (v - 0.5) * flameThickness;
        
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = 0.0; // Will be displaced in shader
        
        positions.push(x, y, z - 12.0);
        uvs.push(u, v);
        
        flameIndices.push(0); // Single flame shell
        mandalaIndices.push(-1);
        spokeIndices.push(-1);
        chakraRingIndices.push(-1);
        glyphIndices.push(-1);
        mantraBandIndices.push(-1);
        dustIndices.push(-1);
        radialSegments.push(i);
        concentricRings.push(j);
      }
    }
    
    // ============================================
    // DUST FIELD (Layer G - 200–260)
    // ============================================
    const dustRadius = 0.0125;
    
    for (let i = 0; i < this.numDust; i++) {
      // Distribute around mandala
      const angle = (i / this.numDust) * Math.PI * 2.0 * 4.0; // 4 full rotations
      const baseRadius = 1.5 + (i / this.numDust) * 4.5; // 1.5 to 6.0
      const radius = baseRadius;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = Math.sin(angle * 1.8) * 0.1; // Slight vertical variation
      
      // Create quad for each dust particle
      positions.push(
        x - dustRadius, y - dustRadius, z - 12.0, // Bottom-left
        x + dustRadius, y - dustRadius, z - 12.0, // Bottom-right
        x - dustRadius, y + dustRadius, z - 12.0, // Top-left
        x + dustRadius, y + dustRadius, z - 12.0  // Top-right
      );
      
      // UVs
      uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
      
      // Indices
      dustIndices.push(i, i, i, i);
      mandalaIndices.push(-1, -1, -1, -1);
      spokeIndices.push(-1, -1, -1, -1);
      chakraRingIndices.push(-1, -1, -1, -1);
      glyphIndices.push(-1, -1, -1, -1);
      mantraBandIndices.push(-1, -1, -1, -1);
      flameIndices.push(-1, -1, -1, -1);
      radialSegments.push(0, 0, 0, 0);
      concentricRings.push(0, 0, 0, 0);
    }
    
    // Set attributes
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setAttribute('mandalaIndex', new THREE.Float32BufferAttribute(mandalaIndices, 1));
    geometry.setAttribute('spokeIndex', new THREE.Float32BufferAttribute(spokeIndices, 1));
    geometry.setAttribute('chakraRingIndex', new THREE.Float32BufferAttribute(chakraRingIndices, 1));
    geometry.setAttribute('glyphIndex', new THREE.Float32BufferAttribute(glyphIndices, 1));
    geometry.setAttribute('mantraBandIndex', new THREE.Float32BufferAttribute(mantraBandIndices, 1));
    geometry.setAttribute('flameIndex', new THREE.Float32BufferAttribute(flameIndices, 1));
    geometry.setAttribute('dustIndex', new THREE.Float32BufferAttribute(dustIndices, 1));
    geometry.setAttribute('radialSegment', new THREE.Float32BufferAttribute(radialSegments, 1));
    geometry.setAttribute('concentricRing', new THREE.Float32BufferAttribute(concentricRings, 1));
    
    // Create indices
    const indices: number[] = [];
    let vertexIndex = 0;
    
    // Mandala disk (quads) - 64 radial × 32 concentric
    for (let i = 0; i < radialSegmentsCount; i++) {
      for (let j = 0; j < concentricRingsCount; j++) {
        const a = vertexIndex + i * (concentricRingsCount + 1) + j;
        const b = a + 1;
        const c = a + (concentricRingsCount + 1);
        const d = c + 1;
        
        indices.push(a, b, c);
        indices.push(b, d, c);
      }
    }
    vertexIndex += (radialSegmentsCount + 1) * (concentricRingsCount + 1);
    
    // Spokes (quads) - 8, 12, or 16 spokes
    for (let spoke = 0; spoke < this.numSpokes; spoke++) {
      for (let i = 0; i < spokeSegments; i++) {
        const base = vertexIndex;
        indices.push(
          base, base + 1, base + 2,
          base + 1, base + 3, base + 2
        );
        vertexIndex += 4;
      }
    }
    
    // Chakra rings (quads) - 3 rings
    for (let ring = 0; ring < 3; ring++) {
      for (let i = 0; i < ringSegments; i++) {
        for (let j = 0; j < 4; j++) {
          const a = vertexIndex + i * 5 + j;
          const b = a + 1;
          const c = a + 5;
          const d = c + 1;
          
          indices.push(a, b, c);
          indices.push(b, d, c);
        }
      }
      vertexIndex += (ringSegments + 1) * 5;
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
    
    // Mantra bands (quads) - 2 bands
    for (let band = 0; band < 2; band++) {
      for (let i = 0; i < bandSegments; i++) {
        for (let j = 0; j < 4; j++) {
          const a = vertexIndex + i * 5 + j;
          const b = a + 1;
          const c = a + 5;
          const d = c + 1;
          
          indices.push(a, b, c);
          indices.push(b, d, c);
        }
      }
      vertexIndex += (bandSegments + 1) * 5;
    }
    
    // Flame shell (quads)
    for (let i = 0; i < flameSegments; i++) {
      for (let j = 0; j < flameRings; j++) {
        const a = vertexIndex + i * (flameRings + 1) + j;
        const b = a + 1;
        const c = a + (flameRings + 1);
        const d = c + 1;
        
        indices.push(a, b, c);
        indices.push(b, d, c);
      }
    }
    vertexIndex += (flameSegments + 1) * (flameRings + 1);
    
    // Dust field (quads)
    for (let i = 0; i < this.numDust; i++) {
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
   * Update with dharma wheel state
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

