/**
 * Celestial Horizon v2 Engine
 * 
 * Phase 2 — Section 52: CELESTIAL HORIZON ENGINE v2
 * Celestial Horizon Engine v2 (E56)
 * 
 * Generate all 7 layers: gradient plane, fog bands, diffraction edge, aurora bands, light rays, particles, bloom layer
 */

import * as THREE from 'three';
import { celestialHorizonVertexShader } from './shaders/celestial-horizon-vertex';
import { celestialHorizonFragmentShader } from './shaders/celestial-horizon-fragment';

export interface CelestialHorizonEngineConfig {
  intensity?: number;
  mouse?: { x: number; y: number };
  parallaxStrength?: number;
  numParticles?: number;
}

export interface GradientPlaneData {
  width: number;
  height: number;
  segmentsX: number;
  segmentsY: number;
}

export interface FogBandData {
  fogBandIndex: number;
  baseY: number;
}

export interface DiffractionEdgeData {
  width: number;
  height: number;
}

export interface AuroraBandData {
  auroraIndex: number;
  baseX: number;
}

export interface LightRayData {
  rayIndex: number;
  baseRadius: number; // 8.0 to 18.0
  angle: number;
}

export interface ParticleData {
  particleIndex: number;
  speed: number;
  baseRadius: number;
}

export class CelestialHorizonEngine {
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private config: CelestialHorizonEngineConfig;
  
  private gradientPlane: GradientPlaneData;
  private fogBands: FogBandData[] = [];
  private diffractionEdge: DiffractionEdgeData;
  private auroraBands: AuroraBandData[] = [];
  private lightRays: LightRayData[] = [];
  private particles: ParticleData[] = [];
  
  private numParticles: number;
  
  private breathPhase: number = 0;
  private breathStrength: number = 0;
  private blessingWaveProgress: number = 0;
  private scrollProgress: number = 0;
  private rotationSync: number = 0;
  private cameraFOV: number = 75.0;

  constructor(config: CelestialHorizonEngineConfig = {}) {
    this.config = {
      intensity: config.intensity || 1.0,
      mouse: config.mouse || { x: 0, y: 0 },
      parallaxStrength: config.parallaxStrength || 1.0,
      numParticles: config.numParticles || 185,
    };
    
    this.numParticles = this.config.numParticles || 185;
    
    // Generate gradient plane
    this.generateGradientPlane();
    
    // Generate fog bands
    this.generateFogBands();
    
    // Generate diffraction edge
    this.generateDiffractionEdge();
    
    // Generate aurora bands
    this.generateAuroraBands();
    
    // Generate light rays
    this.generateLightRays();
    
    // Generate particles
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
      vertexShader: celestialHorizonVertexShader,
      fragmentShader: celestialHorizonFragmentShader,
      transparent: true,
      blending: THREE.NormalBlending, // Base layer uses normal blending
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    
    // Create mesh
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  /**
   * Generate gradient plane
   */
  private generateGradientPlane(): void {
    this.gradientPlane = {
      width: 36.0,
      height: 18.0,
      segmentsX: 64,
      segmentsY: 48,
    };
  }

  /**
   * Generate fog bands (4-6)
   */
  private generateFogBands(): void {
    this.fogBands = [];
    
    for (let i = 0; i < 6; i++) {
      const baseY = -9.0 + (i / 5.0) * 18.0; // -9.0 to 9.0
      this.fogBands.push({
        fogBandIndex: i,
        baseY,
      });
    }
  }

  /**
   * Generate diffraction edge
   */
  private generateDiffractionEdge(): void {
    this.diffractionEdge = {
      width: 36.0,
      height: 1.5, // 1-2 unit band
    };
  }

  /**
   * Generate aurora bands (3-5)
   */
  private generateAuroraBands(): void {
    this.auroraBands = [];
    
    for (let i = 0; i < 5; i++) {
      const baseX = (i / 4.0) * 36.0 - 18.0; // -18.0 to 18.0
      this.auroraBands.push({
        auroraIndex: i,
        baseX,
      });
    }
  }

  /**
   * Generate light rays (20-40)
   */
  private generateLightRays(): void {
    this.lightRays = [];
    
    for (let i = 0; i < 40; i++) {
      const baseRadius = 8.0 + (i / 39.0) * 10.0; // 8.0 to 18.0
      const angle = (i / 40.0) * Math.PI * 2.0; // 0 to 2π
      this.lightRays.push({
        rayIndex: i,
        baseRadius,
        angle,
      });
    }
  }

  /**
   * Generate particles (150-220)
   */
  private generateParticles(): void {
    this.particles = [];
    
    for (let i = 0; i < this.numParticles; i++) {
      const speed = 0.06 + (i / this.numParticles) * 0.05; // Varying speeds
      const baseRadius = 8.0 + (i / this.numParticles) * 10.0; // 8.0 to 18.0
      
      this.particles.push({
        particleIndex: i,
        speed,
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
    const gradientIndices: number[] = [];
    const fogBandIndices: number[] = [];
    const diffractionIndices: number[] = [];
    const auroraIndices: number[] = [];
    const rayIndices: number[] = [];
    const particleIndices: number[] = [];
    const bloomIndices: number[] = [];
    
    // ============================================
    // GRADIENT PLANE (Layer A)
    // ============================================
    const planeWidth = 36.0;
    const planeHeight = 18.0;
    const segmentsX = 64;
    const segmentsY = 48;
    
    for (let i = 0; i <= segmentsX; i++) {
      for (let j = 0; j <= segmentsY; j++) {
        const u = i / segmentsX;
        const v = j / segmentsY;
        
        const x = (u - 0.5) * planeWidth;
        const z = (v - 0.5) * planeHeight;
        const y = 0.0; // Will be positioned in shader
        
        positions.push(x, y, z);
        uvs.push(u, v);
        
        gradientIndices.push(0); // Single gradient plane
        fogBandIndices.push(-1);
        diffractionIndices.push(-1);
        auroraIndices.push(-1);
        rayIndices.push(-1);
        particleIndices.push(-1);
        bloomIndices.push(-1);
      }
    }
    
    // ============================================
    // FOG BANDS (Layer B - 6 bands)
    // ============================================
    for (let band = 0; band < 6; band++) {
      const bandData = this.fogBands[band];
      
      for (let i = 0; i <= segmentsX; i++) {
        const u = i / segmentsX;
        const v = 0.5; // Center of band
        
        const x = (u - 0.5) * planeWidth;
        const z = bandData.baseY;
        const y = 0.0; // Will be positioned in shader
        
        positions.push(x, y, z);
        uvs.push(u, v);
        
        gradientIndices.push(-1);
        fogBandIndices.push(band);
        diffractionIndices.push(-1);
        auroraIndices.push(-1);
        rayIndices.push(-1);
        particleIndices.push(-1);
        bloomIndices.push(-1);
      }
    }
    
    // ============================================
    // DIFFRACTION EDGE (Layer C)
    // ============================================
    const edgeWidth = 36.0;
    const edgeHeight = 1.5;
    const edgeSegmentsX = 64;
    const edgeSegmentsY = 4;
    
    for (let i = 0; i <= edgeSegmentsX; i++) {
      for (let j = 0; j <= edgeSegmentsY; j++) {
        const u = i / edgeSegmentsX;
        const v = j / edgeSegmentsY;
        
        const x = (u - 0.5) * edgeWidth;
        const z = (v - 0.5) * edgeHeight;
        const y = 0.0; // Will be positioned in shader
        
        positions.push(x, y, z);
        uvs.push(u, v);
        
        gradientIndices.push(-1);
        fogBandIndices.push(-1);
        diffractionIndices.push(0); // Single diffraction edge
        auroraIndices.push(-1);
        rayIndices.push(-1);
        particleIndices.push(-1);
        bloomIndices.push(-1);
      }
    }
    
    // ============================================
    // AURORA BANDS (Layer D - 5 bands)
    // ============================================
    for (let band = 0; band < 5; band++) {
      const bandData = this.auroraBands[band];
      
      for (let i = 0; i <= 4; i++) {
        for (let j = 0; j <= segmentsY; j++) {
          const u = i / 4.0;
          const v = j / segmentsY;
          
          const x = bandData.baseX + (u - 0.5) * 2.0; // Thin vertical band
          const z = (v - 0.5) * planeHeight;
          const y = 0.0; // Will be positioned in shader
          
          positions.push(x, y, z);
          uvs.push(u, v);
          
          gradientIndices.push(-1);
          fogBandIndices.push(-1);
          diffractionIndices.push(-1);
          auroraIndices.push(band);
          rayIndices.push(-1);
          particleIndices.push(-1);
          bloomIndices.push(-1);
        }
      }
    }
    
    // ============================================
    // LIGHT RAYS (Layer E - 40 rays)
    // ============================================
    const wedgeWidth = 0.3; // Thin wedge
    const raySegments = 8; // Segments along ray length
    
    for (let ray = 0; ray < 40; ray++) {
      const rayData = this.lightRays[ray];
      
      for (let i = 0; i <= raySegments; i++) {
        for (let j = 0; j <= 2; j++) { // 3 points for wedge
          const u = i / raySegments; // 0 to 1 (radius progression)
          const v = j / 2.0; // -1 to 1 (wedge width)
          
          const radius = 8.0 + u * 10.0; // 8.0 to 18.0
          const angle = rayData.angle + (v - 0.5) * wedgeWidth;
          
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          const y = 0.0; // Will be positioned in shader
          
          positions.push(x, y, z);
          uvs.push(u, v);
          
          gradientIndices.push(-1);
          fogBandIndices.push(-1);
          diffractionIndices.push(-1);
          auroraIndices.push(-1);
          rayIndices.push(ray);
          particleIndices.push(-1);
          bloomIndices.push(-1);
        }
      }
    }
    
    // ============================================
    // PARTICLES (Layer F)
    // ============================================
    const particleRadius = 0.0125;
    
    for (let i = 0; i < this.numParticles; i++) {
      const particle = this.particles[i];
      const x = 0.0; // Will be positioned in shader
      const y = 0.0;
      const z = 0.0;
      
      // Create quad for each particle
      positions.push(
        x - particleRadius, y - particleRadius, z, // Bottom-left
        x + particleRadius, y - particleRadius, z, // Bottom-right
        x - particleRadius, y + particleRadius, z, // Top-left
        x + particleRadius, y + particleRadius, z  // Top-right
      );
      
      // UVs
      uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
      
      // Indices
      gradientIndices.push(-1, -1, -1, -1);
      fogBandIndices.push(-1, -1, -1, -1);
      diffractionIndices.push(-1, -1, -1, -1);
      auroraIndices.push(-1, -1, -1, -1);
      rayIndices.push(-1, -1, -1, -1);
      particleIndices.push(i, i, i, i);
      bloomIndices.push(-1, -1, -1, -1);
    }
    
    // ============================================
    // BLOOM LAYER (Layer G)
    // ============================================
    // Same as gradient plane
    for (let i = 0; i <= segmentsX; i++) {
      for (let j = 0; j <= segmentsY; j++) {
        const u = i / segmentsX;
        const v = j / segmentsY;
        
        const x = (u - 0.5) * planeWidth;
        const z = (v - 0.5) * planeHeight;
        const y = 0.0; // Will be positioned in shader
        
        positions.push(x, y, z);
        uvs.push(u, v);
        
        gradientIndices.push(-1);
        fogBandIndices.push(-1);
        diffractionIndices.push(-1);
        auroraIndices.push(-1);
        rayIndices.push(-1);
        particleIndices.push(-1);
        bloomIndices.push(0); // Single bloom layer
      }
    }
    
    // Set attributes
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setAttribute('gradientIndex', new THREE.Float32BufferAttribute(gradientIndices, 1));
    geometry.setAttribute('fogBandIndex', new THREE.Float32BufferAttribute(fogBandIndices, 1));
    geometry.setAttribute('diffractionIndex', new THREE.Float32BufferAttribute(diffractionIndices, 1));
    geometry.setAttribute('auroraIndex', new THREE.Float32BufferAttribute(auroraIndices, 1));
    geometry.setAttribute('rayIndex', new THREE.Float32BufferAttribute(rayIndices, 1));
    geometry.setAttribute('particleIndex', new THREE.Float32BufferAttribute(particleIndices, 1));
    geometry.setAttribute('bloomIndex', new THREE.Float32BufferAttribute(bloomIndices, 1));
    
    // Create indices
    const indices: number[] = [];
    let vertexIndex = 0;
    
    // Gradient plane (quads)
    for (let i = 0; i < segmentsX; i++) {
      for (let j = 0; j < segmentsY; j++) {
        const a = vertexIndex + i * (segmentsY + 1) + j;
        const b = a + 1;
        const c = a + (segmentsY + 1);
        const d = c + 1;
        
        indices.push(a, b, c);
        indices.push(b, d, c);
      }
    }
    vertexIndex += (segmentsX + 1) * (segmentsY + 1);
    
    // Fog bands (lines/bands)
    for (let band = 0; band < 6; band++) {
      for (let i = 0; i < segmentsX; i++) {
        const a = vertexIndex + i;
        const b = a + 1;
        indices.push(a, b);
      }
      vertexIndex += segmentsX + 1;
    }
    
    // Diffraction edge (quads)
    for (let i = 0; i < edgeSegmentsX; i++) {
      for (let j = 0; j < edgeSegmentsY; j++) {
        const a = vertexIndex + i * (edgeSegmentsY + 1) + j;
        const b = a + 1;
        const c = a + (edgeSegmentsY + 1);
        const d = c + 1;
        
        indices.push(a, b, c);
        indices.push(b, d, c);
      }
    }
    vertexIndex += (edgeSegmentsX + 1) * (edgeSegmentsY + 1);
    
    // Aurora bands (quads) - 5 bands
    for (let band = 0; band < 5; band++) {
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < segmentsY; j++) {
          const a = vertexIndex + i * (segmentsY + 1) + j;
          const b = a + 1;
          const c = a + (segmentsY + 1);
          const d = c + 1;
          
          indices.push(a, b, c);
          indices.push(b, d, c);
        }
      }
      vertexIndex += 5 * (segmentsY + 1);
    }
    
    // Light rays (triangles) - 40 rays
    for (let ray = 0; ray < 40; ray++) {
      for (let i = 0; i < raySegments; i++) {
        const a = vertexIndex + i * 3;
        const b = a + 1;
        const c = a + 2;
        const d = a + 3;
        const e = a + 4;
        const f = a + 5;
        
        // Two triangles per segment
        indices.push(a, b, c);
        indices.push(b, d, c);
        indices.push(c, d, e);
        indices.push(d, f, e);
      }
      vertexIndex += (raySegments + 1) * 3;
    }
    
    // Particles (quads)
    for (let i = 0; i < this.numParticles; i++) {
      const base = vertexIndex;
      indices.push(
        base, base + 1, base + 2,
        base + 1, base + 3, base + 2
      );
      vertexIndex += 4;
    }
    
    // Bloom layer (quads) - same as gradient plane
    for (let i = 0; i < segmentsX; i++) {
      for (let j = 0; j < segmentsY; j++) {
        const a = vertexIndex + i * (segmentsY + 1) + j;
        const b = a + 1;
        const c = a + (segmentsY + 1);
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
   * Update with celestial horizon state
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

