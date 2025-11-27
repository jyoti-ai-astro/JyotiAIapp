/**
 * Stellar Wind Engine
 * 
 * Phase 2 — Section 46: STELLAR WIND SHEAR ENGINE
 * Stellar Wind Engine (E50)
 * 
 * Generate wind sheets, cross-wind ribbons, wind dust streams, manage uniforms
 */

import * as THREE from 'three';
import { stellarWindVertexShader } from './shaders/stellar-wind-vertex';
import { stellarWindFragmentShader } from './shaders/stellar-wind-fragment';

export interface StellarWindEngineConfig {
  intensity?: number;
  mouse?: { x: number; y: number };
  parallaxStrength?: number;
  numParticles?: number;
}

export interface WindSheetData {
  width: number;
  height: number;
  segments: number;
  sheetIndex: number; // 0 or 1 for two sheets
}

export interface RibbonPlaneData {
  width: number;
  height: number;
  segments: number;
}

export interface DustParticleData {
  dustIndex: number;
  baseX: number;
  speed: number;
}

export class StellarWindEngine {
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private config: StellarWindEngineConfig;
  
  private windSheets: WindSheetData[] = [];
  private ribbonPlane: RibbonPlaneData;
  private dustParticles: DustParticleData[] = [];
  
  private numParticles: number;
  
  private breathPhase: number = 0;
  private breathStrength: number = 0;
  private blessingWaveProgress: number = 0;
  private scrollProgress: number = 0;
  private rotationSync: number = 0;
  private cameraFOV: number = 75.0;

  constructor(config: StellarWindEngineConfig = {}) {
    this.config = {
      intensity: config.intensity || 1.0,
      mouse: config.mouse || { x: 0, y: 0 },
      parallaxStrength: config.parallaxStrength || 1.0,
      numParticles: config.numParticles || 210,
    };
    
    this.numParticles = this.config.numParticles || 210;
    
    // Generate wind sheets
    this.generateWindSheets();
    
    // Generate ribbon plane
    this.generateRibbonPlane();
    
    // Generate dust particles
    this.generateDustParticles();
    
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
      vertexShader: stellarWindVertexShader,
      fragmentShader: stellarWindFragmentShader,
      transparent: true,
      blending: THREE.NormalBlending, // Base layer uses normal blending
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    
    // Create mesh
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  /**
   * Generate wind sheets (2 sheets)
   */
  private generateWindSheets(): void {
    this.windSheets = [];
    
    for (let i = 0; i < 2; i++) {
      this.windSheets.push({
        width: 26.0,
        height: 14.0,
        segments: 48, // 48×48 grid
        sheetIndex: i,
      });
    }
  }

  /**
   * Generate ribbon plane
   */
  private generateRibbonPlane(): void {
    this.ribbonPlane = {
      width: 26.0,
      height: 14.0,
      segments: 48,
    };
  }

  /**
   * Generate dust particles (160-260)
   */
  private generateDustParticles(): void {
    this.dustParticles = [];
    
    for (let i = 0; i < this.numParticles; i++) {
      const baseX = (i / this.numParticles) * 26.0 - 13.0; // -13 to 13 range
      const speed = 0.2 + (i / this.numParticles) * 0.15; // Varying speeds
      
      this.dustParticles.push({
        dustIndex: i,
        baseX,
        speed,
      });
    }
  }

  /**
   * Create geometry with wind sheets, ribbon plane, and dust particles
   */
  private createGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    
    const positions: number[] = [];
    const uvs: number[] = [];
    const windSheetIndices: number[] = [];
    const ribbonIndices: number[] = [];
    const dustIndices: number[] = [];
    
    // ============================================
    // WIND SHEETS (Layer A - 2 sheets)
    // ============================================
    const sheetWidth = 26.0;
    const sheetHeight = 14.0;
    const sheetSegments = 48;
    
    for (let sheet = 0; sheet < 2; sheet++) {
      const sheetOffset = sheet * 13.0; // Offset second sheet
      
      for (let i = 0; i <= sheetSegments; i++) {
        for (let j = 0; j <= sheetSegments; j++) {
          const u = i / sheetSegments;
          const v = j / sheetSegments;
          
          const x = (u - 0.5) * sheetWidth + sheetOffset;
          const z = (v - 0.5) * sheetHeight;
          const y = 0.0; // Will be displaced in shader
          
          positions.push(x, y, z);
          uvs.push(u, v);
          
          windSheetIndices.push(sheet); // 0 or 1
          ribbonIndices.push(-1);
          dustIndices.push(-1);
        }
      }
    }
    
    // ============================================
    // RIBBON PLANE (Layer B)
    // ============================================
    for (let i = 0; i <= sheetSegments; i++) {
      for (let j = 0; j <= sheetSegments; j++) {
        const u = i / sheetSegments;
        const v = j / sheetSegments;
        
        const x = (u - 0.5) * sheetWidth;
        const z = (v - 0.5) * sheetHeight;
        const y = 0.0; // Will be displaced in shader
        
        positions.push(x, y, z);
        uvs.push(u, v);
        
        windSheetIndices.push(-1);
        ribbonIndices.push(0); // Single ribbon plane
        dustIndices.push(-1);
      }
    }
    
    // ============================================
    // DUST PARTICLES (Layer C)
    // ============================================
    const dustRadius = 0.0125;
    
    for (let i = 0; i < this.numParticles; i++) {
      const dust = this.dustParticles[i];
      const x = dust.baseX;
      const y = 0.0; // Will be positioned in shader
      const z = 0.0; // Will be animated in shader
      
      // Create quad for each dust particle
      positions.push(
        x - dustRadius, y - dustRadius, z, // Bottom-left
        x + dustRadius, y - dustRadius, z, // Bottom-right
        x - dustRadius, y + dustRadius, z, // Top-left
        x + dustRadius, y + dustRadius, z  // Top-right
      );
      
      // UVs
      uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
      
      // Indices
      windSheetIndices.push(-1, -1, -1, -1);
      ribbonIndices.push(-1, -1, -1, -1);
      dustIndices.push(i, i, i, i);
    }
    
    // Set attributes
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setAttribute('windSheetIndex', new THREE.Float32BufferAttribute(windSheetIndices, 1));
    geometry.setAttribute('ribbonIndex', new THREE.Float32BufferAttribute(ribbonIndices, 1));
    geometry.setAttribute('dustIndex', new THREE.Float32BufferAttribute(dustIndices, 1));
    
    // Create indices
    const indices: number[] = [];
    let vertexIndex = 0;
    
    // Wind sheets (quads) - 2 sheets
    for (let sheet = 0; sheet < 2; sheet++) {
      for (let i = 0; i < sheetSegments; i++) {
        for (let j = 0; j < sheetSegments; j++) {
          const a = vertexIndex + i * (sheetSegments + 1) + j;
          const b = a + 1;
          const c = a + (sheetSegments + 1);
          const d = c + 1;
          
          indices.push(a, b, c);
          indices.push(b, d, c);
        }
      }
      vertexIndex += (sheetSegments + 1) * (sheetSegments + 1);
    }
    
    // Ribbon plane (quads)
    for (let i = 0; i < sheetSegments; i++) {
      for (let j = 0; j < sheetSegments; j++) {
        const a = vertexIndex + i * (sheetSegments + 1) + j;
        const b = a + 1;
        const c = a + (sheetSegments + 1);
        const d = c + 1;
        
        indices.push(a, b, c);
        indices.push(b, d, c);
      }
    }
    vertexIndex += (sheetSegments + 1) * (sheetSegments + 1);
    
    // Dust particles (quads)
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
   * Update with stellar wind state
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

