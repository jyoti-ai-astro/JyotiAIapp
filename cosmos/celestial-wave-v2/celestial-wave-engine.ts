/**
 * Celestial Wave v2 Engine
 * 
 * Phase 2 — Section 51: CELESTIAL WAVE ENGINE v2
 * Celestial Wave Engine v2 (E55)
 * 
 * Generate base wave sheet, cross-wave sheet, ripple rings, aura streams, particles, manage uniforms
 */

import * as THREE from 'three';
import { celestialWaveVertexShader } from './shaders/celestial-wave-vertex';
import { celestialWaveFragmentShader } from './shaders/celestial-wave-fragment';

export interface CelestialWaveEngineConfig {
  intensity?: number;
  mouse?: { x: number; y: number };
  parallaxStrength?: number;
  numParticles?: number;
  numAuraStreams?: number;
}

export interface WaveSheetData {
  width: number;
  height: number;
  segments: number;
}

export interface CrossWaveData {
  width: number;
  height: number;
  segments: number;
}

export interface RippleRingData {
  rippleIndex: number;
  baseRadius: number; // 1.5 to 7.0
  thickness: number;
}

export interface AuraStreamData {
  auraStreamIndex: number;
  baseX: number;
}

export interface ParticleData {
  particleIndex: number;
  speed: number;
  baseRadius: number;
}

export class CelestialWaveEngine {
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private config: CelestialWaveEngineConfig;
  
  private waveSheet: WaveSheetData;
  private crossWave: CrossWaveData;
  private rippleRings: RippleRingData[] = [];
  private auraStreams: AuraStreamData[] = [];
  private particles: ParticleData[] = [];
  
  private numParticles: number;
  private numAuraStreams: number;
  
  private breathPhase: number = 0;
  private breathStrength: number = 0;
  private blessingWaveProgress: number = 0;
  private scrollProgress: number = 0;
  private rotationSync: number = 0;
  private cameraFOV: number = 75.0;

  constructor(config: CelestialWaveEngineConfig = {}) {
    this.config = {
      intensity: config.intensity || 1.0,
      mouse: config.mouse || { x: 0, y: 0 },
      parallaxStrength: config.parallaxStrength || 1.0,
      numParticles: config.numParticles || 220,
      numAuraStreams: config.numAuraStreams || 80,
    };
    
    this.numParticles = this.config.numParticles || 220;
    this.numAuraStreams = this.config.numAuraStreams || 80;
    
    // Generate wave sheet
    this.generateWaveSheet();
    
    // Generate cross-wave
    this.generateCrossWave();
    
    // Generate ripple rings
    this.generateRippleRings();
    
    // Generate aura streams
    this.generateAuraStreams();
    
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
      vertexShader: celestialWaveVertexShader,
      fragmentShader: celestialWaveFragmentShader,
      transparent: true,
      blending: THREE.NormalBlending, // Base layer uses normal blending
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    
    // Create mesh
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  /**
   * Generate wave sheet
   */
  private generateWaveSheet(): void {
    this.waveSheet = {
      width: 28.0,
      height: 16.0,
      segments: 64, // 64×64 grid
    };
  }

  /**
   * Generate cross-wave
   */
  private generateCrossWave(): void {
    this.crossWave = {
      width: 24.0,
      height: 14.0,
      segments: 48, // 48×48 grid
    };
  }

  /**
   * Generate ripple rings (12-18)
   */
  private generateRippleRings(): void {
    this.rippleRings = [];
    
    for (let i = 0; i < 18; i++) {
      const baseRadius = 1.5 + (i / 17.0) * 5.5; // 1.5 to 7.0
      this.rippleRings.push({
        rippleIndex: i,
        baseRadius,
        thickness: 0.2,
      });
    }
  }

  /**
   * Generate aura streams (60-100)
   */
  private generateAuraStreams(): void {
    this.auraStreams = [];
    
    for (let i = 0; i < this.numAuraStreams; i++) {
      const baseX = (i / this.numAuraStreams) * 24.0 - 12.0; // -12 to 12
      this.auraStreams.push({
        auraStreamIndex: i,
        baseX,
      });
    }
  }

  /**
   * Generate particles (180-260)
   */
  private generateParticles(): void {
    this.particles = [];
    
    for (let i = 0; i < this.numParticles; i++) {
      const speed = 0.08 + (i / this.numParticles) * 0.06; // Varying speeds
      const baseRadius = 1.0 + (i / this.numParticles) * 6.0; // 1.0 to 7.0
      
      this.particles.push({
        particleIndex: i,
        speed,
        baseRadius,
      });
    }
  }

  /**
   * Create geometry with all 5 layers
   */
  private createGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    
    const positions: number[] = [];
    const uvs: number[] = [];
    const waveSheetIndices: number[] = [];
    const crossWaveIndices: number[] = [];
    const rippleIndices: number[] = [];
    const auraStreamIndices: number[] = [];
    const particleIndices: number[] = [];
    
    // ============================================
    // BASE WAVE SHEET (Layer A)
    // ============================================
    const waveWidth = 28.0;
    const waveHeight = 16.0;
    const waveSegments = 64;
    
    for (let i = 0; i <= waveSegments; i++) {
      for (let j = 0; j <= waveSegments; j++) {
        const u = i / waveSegments;
        const v = j / waveSegments;
        
        const x = (u - 0.5) * waveWidth;
        const z = (v - 0.5) * waveHeight;
        const y = 0.0; // Will be displaced in shader
        
        positions.push(x, y, z);
        uvs.push(u, v);
        
        waveSheetIndices.push(0); // Single wave sheet
        crossWaveIndices.push(-1);
        rippleIndices.push(-1);
        auraStreamIndices.push(-1);
        particleIndices.push(-1);
      }
    }
    
    // ============================================
    // CROSS-WAVE SHEET (Layer B)
    // ============================================
    const crossWidth = 24.0;
    const crossHeight = 14.0;
    const crossSegments = 48;
    
    for (let i = 0; i <= crossSegments; i++) {
      for (let j = 0; j <= crossSegments; j++) {
        const u = i / crossSegments;
        const v = j / crossSegments;
        
        const x = (u - 0.5) * crossWidth;
        const z = (v - 0.5) * crossHeight;
        const y = 0.0; // Will be displaced in shader
        
        positions.push(x, y, z);
        uvs.push(u, v);
        
        waveSheetIndices.push(-1);
        crossWaveIndices.push(0); // Single cross-wave sheet
        rippleIndices.push(-1);
        auraStreamIndices.push(-1);
        particleIndices.push(-1);
      }
    }
    
    // ============================================
    // RIPPLE RINGS (Layer C - 18 rings)
    // ============================================
    const rippleSegments = 64; // Segments per ring (full circle)
    const thickness = 0.2;
    
    for (let ring = 0; ring < 18; ring++) {
      const ringData = this.rippleRings[ring];
      
      for (let i = 0; i <= rippleSegments; i++) {
        for (let j = 0; j <= 4; j++) { // Thickness segments
          const u = i / rippleSegments; // Angle: 0 to 1 (0 to 2π)
          const v = j / 4.0; // Thickness: 0 to 1
          
          const angle = u * Math.PI * 2.0; // 0 to 2π
          const radius = ringData.baseRadius;
          const thicknessOffset = (v - 0.5) * thickness;
          
          const x = Math.cos(angle) * (radius + thicknessOffset);
          const z = Math.sin(angle) * (radius + thicknessOffset);
          const y = 0.0; // Will be displaced in shader
          
          positions.push(x, y, z);
          uvs.push(u, v);
          
          waveSheetIndices.push(-1);
          crossWaveIndices.push(-1);
          rippleIndices.push(ring);
          auraStreamIndices.push(-1);
          particleIndices.push(-1);
        }
      }
    }
    
    // ============================================
    // AURA STREAMS (Layer D - 60-100 vertical lines)
    // ============================================
    const streamWidth = 0.05; // Thin vertical stream width
    
    for (let i = 0; i < this.numAuraStreams; i++) {
      const stream = this.auraStreams[i];
      const x = stream.baseX;
      const y = 0.0; // Will be positioned in shader
      const z = 0.0; // Will be positioned in shader
      
      // Create thin vertical quad (4 points for a rectangle)
      positions.push(
        x - streamWidth, y - 4.0, z, // Bottom-left
        x + streamWidth, y - 4.0, z, // Bottom-right
        x - streamWidth, y + 4.0, z, // Top-left
        x + streamWidth, y + 4.0, z  // Top-right
      );
      
      // UVs
      uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
      
      // Indices
      waveSheetIndices.push(-1, -1, -1, -1);
      crossWaveIndices.push(-1, -1, -1, -1);
      rippleIndices.push(-1, -1, -1, -1);
      auraStreamIndices.push(i, i, i, i);
      particleIndices.push(-1, -1, -1, -1);
    }
    
    // ============================================
    // PARTICLES (Layer E)
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
      waveSheetIndices.push(-1, -1, -1, -1);
      crossWaveIndices.push(-1, -1, -1, -1);
      rippleIndices.push(-1, -1, -1, -1);
      auraStreamIndices.push(-1, -1, -1, -1);
      particleIndices.push(i, i, i, i);
    }
    
    // Set attributes
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setAttribute('waveSheetIndex', new THREE.Float32BufferAttribute(waveSheetIndices, 1));
    geometry.setAttribute('crossWaveIndex', new THREE.Float32BufferAttribute(crossWaveIndices, 1));
    geometry.setAttribute('rippleIndex', new THREE.Float32BufferAttribute(rippleIndices, 1));
    geometry.setAttribute('auraStreamIndex', new THREE.Float32BufferAttribute(auraStreamIndices, 1));
    geometry.setAttribute('particleIndex', new THREE.Float32BufferAttribute(particleIndices, 1));
    
    // Create indices
    const indices: number[] = [];
    let vertexIndex = 0;
    
    // Base wave sheet (quads)
    for (let i = 0; i < waveSegments; i++) {
      for (let j = 0; j < waveSegments; j++) {
        const a = vertexIndex + i * (waveSegments + 1) + j;
        const b = a + 1;
        const c = a + (waveSegments + 1);
        const d = c + 1;
        
        indices.push(a, b, c);
        indices.push(b, d, c);
      }
    }
    vertexIndex += (waveSegments + 1) * (waveSegments + 1);
    
    // Cross-wave sheet (quads)
    for (let i = 0; i < crossSegments; i++) {
      for (let j = 0; j < crossSegments; j++) {
        const a = vertexIndex + i * (crossSegments + 1) + j;
        const b = a + 1;
        const c = a + (crossSegments + 1);
        const d = c + 1;
        
        indices.push(a, b, c);
        indices.push(b, d, c);
      }
    }
    vertexIndex += (crossSegments + 1) * (crossSegments + 1);
    
    // Ripple rings (quads) - 18 rings
    for (let ring = 0; ring < 18; ring++) {
      for (let i = 0; i < rippleSegments; i++) {
        for (let j = 0; j < 4; j++) {
          const a = vertexIndex + i * 5 + j;
          const b = a + 1;
          const c = a + 5;
          const d = c + 1;
          
          indices.push(a, b, c);
          indices.push(b, d, c);
        }
      }
      vertexIndex += (rippleSegments + 1) * 5;
    }
    
    // Aura streams (quads)
    for (let i = 0; i < this.numAuraStreams; i++) {
      const base = vertexIndex;
      indices.push(
        base, base + 1, base + 2,
        base + 1, base + 3, base + 2
      );
      vertexIndex += 4;
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
   * Update with celestial wave state
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

