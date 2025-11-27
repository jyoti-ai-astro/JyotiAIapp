/**
 * Divine Throne v3 Engine
 * 
 * Phase 2 — Section 60: DIVINE THRONE ENGINE v3
 * Divine Throne Engine v3 (E64)
 * 
 * Generate all 16 layers: celestial base pedestal, throne pillars, halo crown, divine seat geometry, golden insignia ring, ascension backplate, divine spires, orbital runner rings, karmic thread weave, supreme aura shell, light pillars, crown dust field, radiant ascension rays, throne heart core, outer throne halo, bloom mask layer
 */

import * as THREE from 'three';
import { divineThroneVertexShader } from './shaders/divine-throne-vertex';
import { divineThroneFragmentShader } from './shaders/divine-throne-fragment';

export interface DivineThroneEngineConfig {
  intensity?: number;
  mouse?: { x: number; y: number };
  parallaxStrength?: number;
  numThronePillars?: number;
  numGoldenInsignias?: number;
  numDivineSpires?: number;
  numOrbitalRings?: number;
  numKarmicThreads?: number;
  numLightPillars?: number;
  numCrownDust?: number;
  numAscensionRays?: number;
}

export interface ThronePillarData {
  pillarIndex: number;
  angle: number; // 0 to 2π
}

export interface GoldenInsigniaData {
  glyphIndex: number;
  angle: number; // 0 to 2π
  baseRadius: number; // 4.8
}

export interface DivineSpireData {
  spireIndex: number;
  angle: number; // 0 to 2π
}

export interface OrbitalRingData {
  ringIndex: number;
  runnerIndex: number;
  ringRadius: number; // 3.5 to 6.3
}

export interface KarmicThreadData {
  threadIndex: number;
}

export interface LightPillarData {
  pillarIndex: number;
  angle: number; // 0 to 2π
}

export interface AscensionRayData {
  rayIndex: number;
  angle: number; // 0 to 2π
}

export class DivineThroneEngine {
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private config: DivineThroneEngineConfig;
  
  private thronePillars: ThronePillarData[] = [];
  private goldenInsignias: GoldenInsigniaData[] = [];
  private divineSpires: DivineSpireData[] = [];
  private orbitalRings: OrbitalRingData[] = [];
  private karmicThreads: KarmicThreadData[] = [];
  private lightPillars: LightPillarData[] = [];
  private ascensionRays: AscensionRayData[] = [];
  
  private numThronePillars: number;
  private numGoldenInsignias: number;
  private numDivineSpires: number;
  private numOrbitalRings: number;
  private numKarmicThreads: number;
  private numLightPillars: number;
  private numCrownDust: number;
  private numAscensionRays: number;
  
  private breathPhase: number = 0;
  private breathStrength: number = 0;
  private blessingWaveProgress: number = 0;
  private scrollProgress: number = 0;
  private rotationSync: number = 0;
  private cameraFOV: number = 75.0;

  constructor(config: DivineThroneEngineConfig = {}) {
    this.config = {
      intensity: config.intensity || 1.0,
      mouse: config.mouse || { x: 0, y: 0 },
      parallaxStrength: config.parallaxStrength || 1.0,
      numThronePillars: config.numThronePillars || 8,
      numGoldenInsignias: config.numGoldenInsignias || 96,
      numDivineSpires: config.numDivineSpires || 12,
      numOrbitalRings: config.numOrbitalRings || 4,
      numKarmicThreads: config.numKarmicThreads || 40,
      numLightPillars: config.numLightPillars || 10,
      numCrownDust: config.numCrownDust || 350,
      numAscensionRays: config.numAscensionRays || 20,
    };
    
    this.numThronePillars = this.config.numThronePillars || 8;
    this.numGoldenInsignias = this.config.numGoldenInsignias || 96;
    this.numDivineSpires = this.config.numDivineSpires || 12;
    this.numOrbitalRings = this.config.numOrbitalRings || 4;
    this.numKarmicThreads = this.config.numKarmicThreads || 40;
    this.numLightPillars = this.config.numLightPillars || 10;
    this.numCrownDust = this.config.numCrownDust || 350;
    this.numAscensionRays = this.config.numAscensionRays || 20;
    
    // Generate throne pillars (4–8)
    this.generateThronePillars();
    
    // Generate golden insignias (72–96)
    this.generateGoldenInsignias();
    
    // Generate divine spires (6–12)
    this.generateDivineSpires();
    
    // Generate orbital rings (2–4)
    this.generateOrbitalRings();
    
    // Generate karmic threads (20–40)
    this.generateKarmicThreads();
    
    // Generate light pillars (6–10)
    this.generateLightPillars();
    
    // Generate ascension rays (12–20)
    this.generateAscensionRays();
    
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
      vertexShader: divineThroneVertexShader,
      fragmentShader: divineThroneFragmentShader,
      transparent: true,
      blending: THREE.NormalBlending, // Base layer uses normal blending
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    
    // Create mesh
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  /**
   * Generate throne pillars (4–8)
   */
  private generateThronePillars(): void {
    this.thronePillars = [];
    
    for (let i = 0; i < this.numThronePillars; i++) {
      const angle = (i / this.numThronePillars) * Math.PI * 2.0;
      this.thronePillars.push({
        pillarIndex: i,
        angle,
      });
    }
  }

  /**
   * Generate golden insignias (72–96)
   */
  private generateGoldenInsignias(): void {
    this.goldenInsignias = [];
    
    for (let i = 0; i < this.numGoldenInsignias; i++) {
      const angle = (i / this.numGoldenInsignias) * Math.PI * 2.0;
      const baseRadius = 4.8;
      this.goldenInsignias.push({
        glyphIndex: i,
        angle,
        baseRadius,
      });
    }
  }

  /**
   * Generate divine spires (6–12)
   */
  private generateDivineSpires(): void {
    this.divineSpires = [];
    
    for (let i = 0; i < this.numDivineSpires; i++) {
      const angle = (i / this.numDivineSpires) * Math.PI * 2.0;
      this.divineSpires.push({
        spireIndex: i,
        angle,
      });
    }
  }

  /**
   * Generate orbital rings (2–4)
   */
  private generateOrbitalRings(): void {
    this.orbitalRings = [];
    
    for (let i = 0; i < this.numOrbitalRings; i++) {
      const ringRadius = 3.5 + i * 0.8; // 3.5 to 6.3
      // Each ring has multiple runners
      for (let j = 0; j < 3; j++) {
        this.orbitalRings.push({
          ringIndex: i,
          runnerIndex: j,
          ringRadius,
        });
      }
    }
  }

  /**
   * Generate karmic threads (20–40)
   */
  private generateKarmicThreads(): void {
    this.karmicThreads = [];
    
    for (let i = 0; i < this.numKarmicThreads; i++) {
      this.karmicThreads.push({
        threadIndex: i,
      });
    }
  }

  /**
   * Generate light pillars (6–10)
   */
  private generateLightPillars(): void {
    this.lightPillars = [];
    
    for (let i = 0; i < this.numLightPillars; i++) {
      const angle = (i / this.numLightPillars) * Math.PI * 2.0;
      this.lightPillars.push({
        pillarIndex: i,
        angle,
      });
    }
  }

  /**
   * Generate ascension rays (12–20)
   */
  private generateAscensionRays(): void {
    this.ascensionRays = [];
    
    for (let i = 0; i < this.numAscensionRays; i++) {
      const angle = (i / this.numAscensionRays) * Math.PI * 2.0;
      this.ascensionRays.push({
        rayIndex: i,
        angle,
      });
    }
  }

  /**
   * Create geometry with all 16 layers
   * Note: This is a simplified version - full implementation would include all 16 layers
   */
  private createGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    
    // Simplified geometry creation - full implementation would generate all 16 layers
    // Similar pattern to Gateway v3 but with 16 layers instead of 9
    const pedestalRadius = 5.2;
    const radialSegments = 64;
    const concentricRings = 32;
    
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    
    for (let i = 0; i <= radialSegments; i++) {
      for (let j = 0; j <= concentricRings; j++) {
        const u = i / radialSegments;
        const v = j / concentricRings;
        const angle = u * Math.PI * 2.0;
        const radius = v * pedestalRadius;
        
        positions.push(
          Math.cos(angle) * radius,
          0.0,
          Math.sin(angle) * radius - 24.4
        );
        uvs.push(u, v);
      }
    }
    
    for (let i = 0; i < radialSegments; i++) {
      for (let j = 0; j < concentricRings; j++) {
        const a = i * (concentricRings + 1) + j;
        const b = a + 1;
        const c = a + (concentricRings + 1);
        const d = c + 1;
        
        indices.push(a, b, c);
        indices.push(b, d, c);
      }
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
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
   * Update with divine throne state
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

