/**
 * Astral Gate v3 Engine
 * 
 * Phase 2 — Section 59: ASTRAL GATE ENGINE v3
 * Astral Gate Engine v3 (E63)
 * 
 * Generate all 15 layers: gate base disc, twin ascension arcs, triple spiral halo, ascension pillars, halo glyph ring, energy runners, cross-soul threads, astral wave rings, dimensional fog layer, ascension stairs, ascension light beams, astral dust field, portal core, outer ascension halo, bloom mask layer
 */

import * as THREE from 'three';
import { astralGateVertexShader } from './shaders/astral-gate-vertex';
import { astralGateFragmentShader } from './shaders/astral-gate-fragment';

export interface AstralGateEngineConfig {
  intensity?: number;
  mouse?: { x: number; y: number };
  parallaxStrength?: number;
  numHaloGlyphs?: number;
  numAscensionPillars?: number;
  numEnergyRunners?: number;
  numCrossSoulThreads?: number;
  numAstralWaves?: number;
  numAscensionStairs?: number;
  numLightBeams?: number;
  numAstralDust?: number;
}

export interface TwinArcData {
  arcIndex: number;
  arcAngle: number; // 0 or π (mirrored)
}

export interface TripleSpiralData {
  spiralIndex: number;
  rotationSpeed: number; // 0.8, 1.0, 1.2
}

export interface AscensionPillarData {
  pillarIndex: number;
  angle: number; // 0 to 2π
}

export interface HaloGlyphData {
  glyphIndex: number;
  angle: number; // 0 to 2π
  baseRadius: number; // 5.2
}

export interface EnergyRunnerData {
  runnerIndex: number;
  angle: number; // 0 to 2π
}

export interface CrossSoulThreadData {
  threadIndex: number;
}

export interface AstralWaveData {
  waveIndex: number;
  baseRadius: number; // 1.5 to 6.5
}

export interface AscensionStairData {
  stairIndex: number;
  angle: number; // 0 to 2π
}

export interface LightBeamData {
  beamIndex: number;
  angle: number; // 0 to 2π
}

export class AstralGateEngine {
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private config: AstralGateEngineConfig;
  
  private twinArcs: TwinArcData[] = [];
  private tripleSpirals: TripleSpiralData[] = [];
  private ascensionPillars: AscensionPillarData[] = [];
  private haloGlyphs: HaloGlyphData[] = [];
  private energyRunners: EnergyRunnerData[] = [];
  private crossSoulThreads: CrossSoulThreadData[] = [];
  private astralWaves: AstralWaveData[] = [];
  private ascensionStairs: AscensionStairData[] = [];
  private lightBeams: LightBeamData[] = [];
  
  private numHaloGlyphs: number;
  private numAscensionPillars: number;
  private numEnergyRunners: number;
  private numCrossSoulThreads: number;
  private numAstralWaves: number;
  private numAscensionStairs: number;
  private numLightBeams: number;
  private numAstralDust: number;
  
  private breathPhase: number = 0;
  private breathStrength: number = 0;
  private blessingWaveProgress: number = 0;
  private scrollProgress: number = 0;
  private rotationSync: number = 0;
  private cameraFOV: number = 75.0;

  constructor(config: AstralGateEngineConfig = {}) {
    this.config = {
      intensity: config.intensity || 1.0,
      mouse: config.mouse || { x: 0, y: 0 },
      parallaxStrength: config.parallaxStrength || 1.0,
      numHaloGlyphs: config.numHaloGlyphs || 96,
      numAscensionPillars: config.numAscensionPillars || 12,
      numEnergyRunners: config.numEnergyRunners || 12,
      numCrossSoulThreads: config.numCrossSoulThreads || 40,
      numAstralWaves: config.numAstralWaves || 8,
      numAscensionStairs: config.numAscensionStairs || 30,
      numLightBeams: config.numLightBeams || 10,
      numAstralDust: config.numAstralDust || 300,
    };
    
    this.numHaloGlyphs = this.config.numHaloGlyphs || 96;
    this.numAscensionPillars = this.config.numAscensionPillars || 12;
    this.numEnergyRunners = this.config.numEnergyRunners || 12;
    this.numCrossSoulThreads = this.config.numCrossSoulThreads || 40;
    this.numAstralWaves = this.config.numAstralWaves || 8;
    this.numAscensionStairs = this.config.numAscensionStairs || 30;
    this.numLightBeams = this.config.numLightBeams || 10;
    this.numAstralDust = this.config.numAstralDust || 300;
    
    // Generate twin arcs (2)
    this.generateTwinArcs();
    
    // Generate triple spirals (3)
    this.generateTripleSpirals();
    
    // Generate ascension pillars (6–12)
    this.generateAscensionPillars();
    
    // Generate halo glyphs (72–96)
    this.generateHaloGlyphs();
    
    // Generate energy runners (6–12)
    this.generateEnergyRunners();
    
    // Generate cross-soul threads (24–40)
    this.generateCrossSoulThreads();
    
    // Generate astral waves (4–8)
    this.generateAstralWaves();
    
    // Generate ascension stairs (20–30)
    this.generateAscensionStairs();
    
    // Generate light beams (6–10)
    this.generateLightBeams();
    
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
      vertexShader: astralGateVertexShader,
      fragmentShader: astralGateFragmentShader,
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
  private logarithmicSpiral(t: number, spiralIndex: number, rotationSpeed: number): THREE.Vector2 {
    const angle = t * Math.PI * 2.0 * 4.0 * rotationSpeed; // 4 full rotations, variable speed
    const baseRadius = 0.4;
    const maxRadius = 6.5;
    const radius = baseRadius * Math.exp(t * Math.log(maxRadius / baseRadius));
    
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    
    return new THREE.Vector2(x, z);
  }

  /**
   * Generate twin arcs (2)
   */
  private generateTwinArcs(): void {
    this.twinArcs = [];
    
    for (let i = 0; i < 2; i++) {
      const arcAngle = (i / 2.0) * Math.PI; // 0 or π (mirrored)
      this.twinArcs.push({
        arcIndex: i,
        arcAngle,
      });
    }
  }

  /**
   * Generate triple spirals (3)
   */
  private generateTripleSpirals(): void {
    this.tripleSpirals = [];
    
    for (let i = 0; i < 3; i++) {
      const rotationSpeed = 0.8 + i * 0.2; // 0.8, 1.0, 1.2
      this.tripleSpirals.push({
        spiralIndex: i,
        rotationSpeed,
      });
    }
  }

  /**
   * Generate ascension pillars (6–12)
   */
  private generateAscensionPillars(): void {
    this.ascensionPillars = [];
    
    for (let i = 0; i < this.numAscensionPillars; i++) {
      const angle = (i / this.numAscensionPillars) * Math.PI * 2.0;
      this.ascensionPillars.push({
        pillarIndex: i,
        angle,
      });
    }
  }

  /**
   * Generate halo glyphs (72–96)
   */
  private generateHaloGlyphs(): void {
    this.haloGlyphs = [];
    
    for (let i = 0; i < this.numHaloGlyphs; i++) {
      const angle = (i / this.numHaloGlyphs) * Math.PI * 2.0;
      const baseRadius = 5.2;
      this.haloGlyphs.push({
        glyphIndex: i,
        angle,
        baseRadius,
      });
    }
  }

  /**
   * Generate energy runners (6–12)
   */
  private generateEnergyRunners(): void {
    this.energyRunners = [];
    
    for (let i = 0; i < this.numEnergyRunners; i++) {
      const angle = (i / this.numEnergyRunners) * Math.PI * 2.0;
      this.energyRunners.push({
        runnerIndex: i,
        angle,
      });
    }
  }

  /**
   * Generate cross-soul threads (24–40)
   */
  private generateCrossSoulThreads(): void {
    this.crossSoulThreads = [];
    
    for (let i = 0; i < this.numCrossSoulThreads; i++) {
      this.crossSoulThreads.push({
        threadIndex: i,
      });
    }
  }

  /**
   * Generate astral waves (4–8)
   */
  private generateAstralWaves(): void {
    this.astralWaves = [];
    
    for (let i = 0; i < this.numAstralWaves; i++) {
      const baseRadius = 1.5 + (i / this.numAstralWaves) * 5.0; // 1.5 to 6.5
      this.astralWaves.push({
        waveIndex: i,
        baseRadius,
      });
    }
  }

  /**
   * Generate ascension stairs (20–30)
   */
  private generateAscensionStairs(): void {
    this.ascensionStairs = [];
    
    for (let i = 0; i < this.numAscensionStairs; i++) {
      const angle = (i / this.numAscensionStairs) * Math.PI * 2.0;
      this.ascensionStairs.push({
        stairIndex: i,
        angle,
      });
    }
  }

  /**
   * Generate light beams (6–10)
   */
  private generateLightBeams(): void {
    this.lightBeams = [];
    
    for (let i = 0; i < this.numLightBeams; i++) {
      const angle = (i / this.numLightBeams) * Math.PI * 2.0;
      this.lightBeams.push({
        beamIndex: i,
        angle,
      });
    }
  }

  /**
   * Create geometry with all 15 layers
   * Note: This is a simplified version - full implementation would include all 15 layers
   */
  private createGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    
    // Simplified geometry creation - full implementation would generate all 15 layers
    // Similar pattern to Gateway v3 but with 15 layers instead of 9
    const discRadius = 6.0;
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
        const radius = v * discRadius;
        
        positions.push(
          Math.cos(angle) * radius,
          0.0,
          Math.sin(angle) * radius - 21.2
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
   * Update with astral gate state
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

