/**
 * Gateway v3 Engine
 * 
 * Phase 2 — Section 56: GATEWAY ENGINE v3
 * Gateway Engine v3 (E60)
 * 
 * Generate all 9 layers: portal base disc, rotating outer ring, inner vortex spiral, portal glyph band, spiral energy threads, portal rays, dimensional tear layer, energy particles, bloom mask layer
 */

import * as THREE from 'three';
import { gatewayVertexShader } from './shaders/gateway-vertex';
import { gatewayFragmentShader } from './shaders/gateway-fragment';

export interface GatewayEngineConfig {
  intensity?: number;
  mouse?: { x: number; y: number };
  parallaxStrength?: number;
  numGlyphs?: number;
  numSpiralThreads?: number;
  numRays?: number;
  numParticles?: number;
}

export interface OuterRingData {
  ringIndex: number;
  baseRadius: number; // 4.2, 4.5, 4.8
}

export interface GlyphData {
  glyphIndex: number;
  angle: number; // 0 to 2π
  baseRadius: number; // 3.8
}

export interface SpiralThreadData {
  threadIndex: number;
}

export interface RayData {
  rayIndex: number;
  angle: number; // 0 to 2π
}

export class GatewayEngine {
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private config: GatewayEngineConfig;
  
  private outerRings: OuterRingData[] = [];
  private glyphs: GlyphData[] = [];
  private spiralThreads: SpiralThreadData[] = [];
  private rays: RayData[] = [];
  
  private numGlyphs: number;
  private numSpiralThreads: number;
  private numRays: number;
  private numParticles: number;
  
  private breathPhase: number = 0;
  private breathStrength: number = 0;
  private blessingWaveProgress: number = 0;
  private scrollProgress: number = 0;
  private rotationSync: number = 0;
  private cameraFOV: number = 75.0;

  constructor(config: GatewayEngineConfig = {}) {
    this.config = {
      intensity: config.intensity || 1.0,
      mouse: config.mouse || { x: 0, y: 0 },
      parallaxStrength: config.parallaxStrength || 1.0,
      numGlyphs: config.numGlyphs || 72,
      numSpiralThreads: config.numSpiralThreads || 12,
      numRays: config.numRays || 40,
      numParticles: config.numParticles || 320,
    };
    
    this.numGlyphs = this.config.numGlyphs || 72;
    this.numSpiralThreads = this.config.numSpiralThreads || 12;
    this.numRays = this.config.numRays || 40;
    this.numParticles = this.config.numParticles || 320;
    
    // Generate outer rings (3)
    this.generateOuterRings();
    
    // Generate glyphs (48–72)
    this.generateGlyphs();
    
    // Generate spiral threads (6–12)
    this.generateSpiralThreads();
    
    // Generate rays (20–40)
    this.generateRays();
    
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
      vertexShader: gatewayVertexShader,
      fragmentShader: gatewayFragmentShader,
      transparent: true,
      blending: THREE.NormalBlending, // Base layer uses normal blending
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    
    // Create mesh
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  /**
   * Generate logarithmic spiral position
   */
  private logarithmicSpiral(t: number, spiralIndex: number): THREE.Vector2 {
    const angle = t * Math.PI * 2.0 * 3.0; // 3 full rotations
    const baseRadius = 0.5;
    const maxRadius = 4.0;
    const radius = baseRadius * Math.exp(t * Math.log(maxRadius / baseRadius));
    
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    
    return new THREE.Vector2(x, z);
  }

  /**
   * Generate outer rings (3)
   */
  private generateOuterRings(): void {
    this.outerRings = [];
    
    for (let i = 0; i < 3; i++) {
      const baseRadius = 4.2 + i * 0.3; // 4.2, 4.5, 4.8
      this.outerRings.push({
        ringIndex: i,
        baseRadius,
      });
    }
  }

  /**
   * Generate glyphs (48–72)
   */
  private generateGlyphs(): void {
    this.glyphs = [];
    
    for (let i = 0; i < this.numGlyphs; i++) {
      const angle = (i / this.numGlyphs) * Math.PI * 2.0;
      const baseRadius = 3.8;
      this.glyphs.push({
        glyphIndex: i,
        angle,
        baseRadius,
      });
    }
  }

  /**
   * Generate spiral threads (6–12)
   */
  private generateSpiralThreads(): void {
    this.spiralThreads = [];
    
    for (let i = 0; i < this.numSpiralThreads; i++) {
      this.spiralThreads.push({
        threadIndex: i,
      });
    }
  }

  /**
   * Generate rays (20–40)
   */
  private generateRays(): void {
    this.rays = [];
    
    for (let i = 0; i < this.numRays; i++) {
      const angle = (i / this.numRays) * Math.PI * 2.0;
      this.rays.push({
        rayIndex: i,
        angle,
      });
    }
  }

  /**
   * Create geometry with all 9 layers
   */
  private createGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    
    const positions: number[] = [];
    const uvs: number[] = [];
    const baseDiscIndices: number[] = [];
    const outerRingIndices: number[] = [];
    const vortexSpiralIndices: number[] = [];
    const glyphIndices: number[] = [];
    const spiralThreadIndices: number[] = [];
    const rayIndices: number[] = [];
    const tearIndices: number[] = [];
    const particleIndices: number[] = [];
    const bloomIndices: number[] = [];
    const radialSegments: number[] = [];
    const concentricRings: number[] = [];
    
    // ============================================
    // BASE DISC (Layer A - 64 radial × 32 concentric)
    // ============================================
    const discRadius = 4.5;
    const radialSegmentsCount = 64;
    const concentricRingsCount = 32;
    
    for (let i = 0; i <= radialSegmentsCount; i++) {
      for (let j = 0; j <= concentricRingsCount; j++) {
        const u = i / radialSegmentsCount; // 0 to 1 (angle)
        const v = j / concentricRingsCount; // 0 to 1 (radius)
        
        const angle = u * Math.PI * 2.0;
        const radius = v * discRadius;
        
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = 0.0;
        
        positions.push(x, y, z - 13.4);
        uvs.push(u, v);
        
        baseDiscIndices.push(0); // Single base disc
        outerRingIndices.push(-1);
        vortexSpiralIndices.push(-1);
        glyphIndices.push(-1);
        spiralThreadIndices.push(-1);
        rayIndices.push(-1);
        tearIndices.push(-1);
        particleIndices.push(-1);
        bloomIndices.push(-1);
        radialSegments.push(i);
        concentricRings.push(j);
      }
    }
    
    // ============================================
    // OUTER RINGS (Layer B - 3 rings)
    // ============================================
    const ringSegments = 64;
    const ringThickness = 0.18;
    
    for (let ring = 0; ring < 3; ring++) {
      const ringData = this.outerRings[ring];
      
      for (let i = 0; i <= ringSegments; i++) {
        for (let j = 0; j <= 4; j++) { // Thickness segments
          const u = i / ringSegments; // 0 to 1 (angle)
          const v = j / 4.0; // 0 to 1 (thickness)
          
          const angle = u * Math.PI * 2.0;
          const radius = ringData.baseRadius + (v - 0.5) * ringThickness;
          
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          const y = 0.0;
          
          positions.push(x, y, z - 13.4);
          uvs.push(u, v);
          
          outerRingIndices.push(ring);
          baseDiscIndices.push(-1);
          vortexSpiralIndices.push(-1);
          glyphIndices.push(-1);
          spiralThreadIndices.push(-1);
          rayIndices.push(-1);
          tearIndices.push(-1);
          particleIndices.push(-1);
          bloomIndices.push(-1);
          radialSegments.push(i);
          concentricRings.push(j);
        }
      }
    }
    
    // ============================================
    // VORTEX SPIRAL (Layer C)
    // ============================================
    const spiralSegments = 128;
    const spiralWidth = 0.1;
    
    for (let i = 0; i < spiralSegments; i++) {
      const t = i / spiralSegments; // 0 to 1 along spiral
      const tNext = (i + 1) / spiralSegments;
      
      const spiralPos1 = this.logarithmicSpiral(t, 0);
      const spiralPos2 = this.logarithmicSpiral(tNext, 0);
      
      // Create quad for spiral segment
      const tangent = new THREE.Vector2().subVectors(spiralPos2, spiralPos1).normalize();
      const normal = new THREE.Vector2(-tangent.y, tangent.x);
      
      const offset1 = normal.clone().multiplyScalar(-spiralWidth * 0.5);
      const offset2 = normal.clone().multiplyScalar(spiralWidth * 0.5);
      
      positions.push(
        spiralPos1.x + offset1.x, 0.0, spiralPos1.y + offset1.y - 13.4, // Bottom-left
        spiralPos1.x + offset2.x, 0.0, spiralPos1.y + offset2.y - 13.4, // Bottom-right
        spiralPos2.x + offset1.x, 0.0, spiralPos2.y + offset1.y - 13.4, // Top-left
        spiralPos2.x + offset2.x, 0.0, spiralPos2.y + offset2.y - 13.4  // Top-right
      );
      
      // UVs
      uvs.push(0, t, 1, t, 0, tNext, 1, tNext);
      
      // Indices
      vortexSpiralIndices.push(0, 0, 0, 0); // Single vortex spiral
      baseDiscIndices.push(-1, -1, -1, -1);
      outerRingIndices.push(-1, -1, -1, -1);
      glyphIndices.push(-1, -1, -1, -1);
      spiralThreadIndices.push(-1, -1, -1, -1);
      rayIndices.push(-1, -1, -1, -1);
      tearIndices.push(-1, -1, -1, -1);
      particleIndices.push(-1, -1, -1, -1);
      bloomIndices.push(-1, -1, -1, -1);
      radialSegments.push(i, i, i, i);
      concentricRings.push(0, 0, 0, 0);
    }
    
    // ============================================
    // GLYPHS (Layer D - 48–72)
    // ============================================
    const glyphSize = 0.2;
    
    for (let i = 0; i < this.numGlyphs; i++) {
      const glyph = this.glyphs[i];
      const glyphX = Math.cos(glyph.angle) * glyph.baseRadius;
      const glyphZ = Math.sin(glyph.angle) * glyph.baseRadius;
      
      // Create quad for each glyph
      positions.push(
        glyphX - glyphSize, 0.0 - glyphSize, glyphZ - 13.4, // Bottom-left
        glyphX + glyphSize, 0.0 - glyphSize, glyphZ - 13.4, // Bottom-right
        glyphX - glyphSize, 0.0 + glyphSize, glyphZ - 13.4, // Top-left
        glyphX + glyphSize, 0.0 + glyphSize, glyphZ - 13.4  // Top-right
      );
      
      // UVs
      uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
      
      // Indices
      glyphIndices.push(i, i, i, i);
      baseDiscIndices.push(-1, -1, -1, -1);
      outerRingIndices.push(-1, -1, -1, -1);
      vortexSpiralIndices.push(-1, -1, -1, -1);
      spiralThreadIndices.push(-1, -1, -1, -1);
      rayIndices.push(-1, -1, -1, -1);
      tearIndices.push(-1, -1, -1, -1);
      particleIndices.push(-1, -1, -1, -1);
      bloomIndices.push(-1, -1, -1, -1);
      radialSegments.push(0, 0, 0, 0);
      concentricRings.push(0, 0, 0, 0);
    }
    
    // ============================================
    // SPIRAL THREADS (Layer E - 6–12)
    // ============================================
    const threadWidth = 0.06;
    const threadSegments = 64;
    
    for (let thread = 0; thread < this.numSpiralThreads; thread++) {
      for (let i = 0; i < threadSegments; i++) {
        const t = i / threadSegments; // 0 to 1 along thread
        const tNext = (i + 1) / threadSegments;
        
        const spiralPos1 = this.logarithmicSpiral(t, thread);
        const spiralPos2 = this.logarithmicSpiral(tNext, thread);
        
        // Create quad for thread segment
        const tangent = new THREE.Vector2().subVectors(spiralPos2, spiralPos1).normalize();
        const normal = new THREE.Vector2(-tangent.y, tangent.x);
        
        const offset1 = normal.clone().multiplyScalar(-threadWidth * 0.5);
        const offset2 = normal.clone().multiplyScalar(threadWidth * 0.5);
        
        positions.push(
          spiralPos1.x + offset1.x, 0.0, spiralPos1.y + offset1.y - 13.4, // Bottom-left
          spiralPos1.x + offset2.x, 0.0, spiralPos1.y + offset2.y - 13.4, // Bottom-right
          spiralPos2.x + offset1.x, 0.0, spiralPos2.y + offset1.y - 13.4, // Top-left
          spiralPos2.x + offset2.x, 0.0, spiralPos2.y + offset2.y - 13.4  // Top-right
        );
        
        // UVs
        uvs.push(0, t, 1, t, 0, tNext, 1, tNext);
        
        // Indices
        spiralThreadIndices.push(thread, thread, thread, thread);
        baseDiscIndices.push(-1, -1, -1, -1);
        outerRingIndices.push(-1, -1, -1, -1);
        vortexSpiralIndices.push(-1, -1, -1, -1);
        glyphIndices.push(-1, -1, -1, -1);
        rayIndices.push(-1, -1, -1, -1);
        tearIndices.push(-1, -1, -1, -1);
        particleIndices.push(-1, -1, -1, -1);
        bloomIndices.push(-1, -1, -1, -1);
        radialSegments.push(i, i, i, i);
        concentricRings.push(0, 0, 0, 0);
      }
    }
    
    // ============================================
    // PORTAL RAYS (Layer F - 20–40)
    // ============================================
    const rayLength = 4.5;
    const rayWidth = 0.08;
    const raySegments = 32;
    
    for (let ray = 0; ray < this.numRays; ray++) {
      const rayData = this.rays[ray];
      
      for (let i = 0; i < raySegments; i++) {
        const t = i / raySegments; // 0 to 1 along ray
        const tNext = (i + 1) / raySegments;
        
        const radius1 = t * rayLength;
        const radius2 = tNext * rayLength;
        
        const x1 = Math.cos(rayData.angle) * radius1;
        const z1 = Math.sin(rayData.angle) * radius1;
        const x2 = Math.cos(rayData.angle) * radius2;
        const z2 = Math.sin(rayData.angle) * radius2;
        
        // Perpendicular direction for width
        const perpAngle = rayData.angle + Math.PI / 2.0;
        const perpX = Math.cos(perpAngle);
        const perpZ = Math.sin(perpAngle);
        
        // Create quad for ray segment
        positions.push(
          x1 - perpX * rayWidth * 0.5, 0.0, z1 - perpZ * rayWidth * 0.5 - 13.4, // Bottom-left
          x1 + perpX * rayWidth * 0.5, 0.0, z1 + perpZ * rayWidth * 0.5 - 13.4, // Bottom-right
          x2 - perpX * rayWidth * 0.5, 0.0, z2 - perpZ * rayWidth * 0.5 - 13.4, // Top-left
          x2 + perpX * rayWidth * 0.5, 0.0, z2 + perpZ * rayWidth * 0.5 - 13.4  // Top-right
        );
        
        // UVs
        uvs.push(0, t, 1, t, 0, tNext, 1, tNext);
        
        // Indices
        rayIndices.push(ray, ray, ray, ray);
        baseDiscIndices.push(-1, -1, -1, -1);
        outerRingIndices.push(-1, -1, -1, -1);
        vortexSpiralIndices.push(-1, -1, -1, -1);
        glyphIndices.push(-1, -1, -1, -1);
        spiralThreadIndices.push(-1, -1, -1, -1);
        tearIndices.push(-1, -1, -1, -1);
        particleIndices.push(-1, -1, -1, -1);
        bloomIndices.push(-1, -1, -1, -1);
        radialSegments.push(i, i, i, i);
        concentricRings.push(0, 0, 0, 0);
      }
    }
    
    // ============================================
    // DIMENSIONAL TEAR (Layer G)
    // ============================================
    const tearWidth = 9.0;
    const tearHeight = 9.0;
    const tearSegmentsX = 64;
    const tearSegmentsY = 64;
    
    for (let i = 0; i <= tearSegmentsX; i++) {
      for (let j = 0; j <= tearSegmentsY; j++) {
        const u = i / tearSegmentsX;
        const v = j / tearSegmentsY;
        
        const x = (u - 0.5) * tearWidth;
        const z = (v - 0.5) * tearHeight;
        const y = 0.0; // Will be displaced in shader
        
        positions.push(x, y, z - 13.4);
        uvs.push(u, v);
        
        tearIndices.push(0); // Single tear layer
        baseDiscIndices.push(-1);
        outerRingIndices.push(-1);
        vortexSpiralIndices.push(-1);
        glyphIndices.push(-1);
        spiralThreadIndices.push(-1);
        rayIndices.push(-1);
        particleIndices.push(-1);
        bloomIndices.push(-1);
        radialSegments.push(i);
        concentricRings.push(j);
      }
    }
    
    // ============================================
    // ENERGY PARTICLES (Layer H - 200–320)
    // ============================================
    const particleRadius = 0.0125;
    
    for (let i = 0; i < this.numParticles; i++) {
      // Distribute around portal
      const angle = (i / this.numParticles) * Math.PI * 2.0 * 5.0; // 5 full rotations
      const baseRadius = 1.0 + (i / this.numParticles) * 4.5; // 1.0 to 5.5
      const radius = baseRadius;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = Math.sin(angle * 1.6) * 0.1; // Slight vertical variation
      
      // Create quad for each particle
      positions.push(
        x - particleRadius, y - particleRadius, z - 13.4, // Bottom-left
        x + particleRadius, y - particleRadius, z - 13.4, // Bottom-right
        x - particleRadius, y + particleRadius, z - 13.4, // Top-left
        x + particleRadius, y + particleRadius, z - 13.4  // Top-right
      );
      
      // UVs
      uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
      
      // Indices
      particleIndices.push(i, i, i, i);
      baseDiscIndices.push(-1, -1, -1, -1);
      outerRingIndices.push(-1, -1, -1, -1);
      vortexSpiralIndices.push(-1, -1, -1, -1);
      glyphIndices.push(-1, -1, -1, -1);
      spiralThreadIndices.push(-1, -1, -1, -1);
      rayIndices.push(-1, -1, -1, -1);
      tearIndices.push(-1, -1, -1, -1);
      bloomIndices.push(-1, -1, -1, -1);
      radialSegments.push(0, 0, 0, 0);
      concentricRings.push(0, 0, 0, 0);
    }
    
    // ============================================
    // BLOOM MASK (Layer I)
    // ============================================
    // Same as base disc
    for (let i = 0; i <= radialSegmentsCount; i++) {
      for (let j = 0; j <= concentricRingsCount; j++) {
        const u = i / radialSegmentsCount;
        const v = j / concentricRingsCount;
        
        const angle = u * Math.PI * 2.0;
        const radius = v * discRadius;
        
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = 0.0;
        
        positions.push(x, y, z - 13.4);
        uvs.push(u, v);
        
        bloomIndices.push(0); // Single bloom layer
        baseDiscIndices.push(-1);
        outerRingIndices.push(-1);
        vortexSpiralIndices.push(-1);
        glyphIndices.push(-1);
        spiralThreadIndices.push(-1);
        rayIndices.push(-1);
        tearIndices.push(-1);
        particleIndices.push(-1);
        radialSegments.push(i);
        concentricRings.push(j);
      }
    }
    
    // Set attributes
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setAttribute('baseDiscIndex', new THREE.Float32BufferAttribute(baseDiscIndices, 1));
    geometry.setAttribute('outerRingIndex', new THREE.Float32BufferAttribute(outerRingIndices, 1));
    geometry.setAttribute('vortexSpiralIndex', new THREE.Float32BufferAttribute(vortexSpiralIndices, 1));
    geometry.setAttribute('glyphIndex', new THREE.Float32BufferAttribute(glyphIndices, 1));
    geometry.setAttribute('spiralThreadIndex', new THREE.Float32BufferAttribute(spiralThreadIndices, 1));
    geometry.setAttribute('rayIndex', new THREE.Float32BufferAttribute(rayIndices, 1));
    geometry.setAttribute('tearIndex', new THREE.Float32BufferAttribute(tearIndices, 1));
    geometry.setAttribute('particleIndex', new THREE.Float32BufferAttribute(particleIndices, 1));
    geometry.setAttribute('bloomIndex', new THREE.Float32BufferAttribute(bloomIndices, 1));
    geometry.setAttribute('radialSegment', new THREE.Float32BufferAttribute(radialSegments, 1));
    geometry.setAttribute('concentricRing', new THREE.Float32BufferAttribute(concentricRings, 1));
    
    // Create indices
    const indices: number[] = [];
    let vertexIndex = 0;
    
    // Base disc (quads) - 64 radial × 32 concentric
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
    
    // Outer rings (quads) - 3 rings
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
    
    // Vortex spiral (quads)
    for (let i = 0; i < spiralSegments; i++) {
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
    
    // Spiral threads (quads) - 6–12 threads
    for (let thread = 0; thread < this.numSpiralThreads; thread++) {
      for (let i = 0; i < threadSegments; i++) {
        const base = vertexIndex;
        indices.push(
          base, base + 1, base + 2,
          base + 1, base + 3, base + 2
        );
        vertexIndex += 4;
      }
    }
    
    // Portal rays (quads) - 20–40 rays
    for (let ray = 0; ray < this.numRays; ray++) {
      for (let i = 0; i < raySegments; i++) {
        const base = vertexIndex;
        indices.push(
          base, base + 1, base + 2,
          base + 1, base + 3, base + 2
        );
        vertexIndex += 4;
      }
    }
    
    // Dimensional tear (quads)
    for (let i = 0; i < tearSegmentsX; i++) {
      for (let j = 0; j < tearSegmentsY; j++) {
        const a = vertexIndex + i * (tearSegmentsY + 1) + j;
        const b = a + 1;
        const c = a + (tearSegmentsY + 1);
        const d = c + 1;
        
        indices.push(a, b, c);
        indices.push(b, d, c);
      }
    }
    vertexIndex += (tearSegmentsX + 1) * (tearSegmentsY + 1);
    
    // Energy particles (quads)
    for (let i = 0; i < this.numParticles; i++) {
      const base = vertexIndex;
      indices.push(
        base, base + 1, base + 2,
        base + 1, base + 3, base + 2
      );
      vertexIndex += 4;
    }
    
    // Bloom mask (quads) - same as base disc
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
   * Update with gateway state
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

