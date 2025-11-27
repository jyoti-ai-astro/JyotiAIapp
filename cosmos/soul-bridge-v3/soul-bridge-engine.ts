/**
 * Soul Bridge v3 Engine
 * 
 * Phase 2 — Section 58: SOUL BRIDGE ENGINE v3
 * Soul Bridge Engine v3 (E62)
 * 
 * Generate all 14 layers: astral base plane, twin spiral bridges, ascension ramps, soulLight nodes, central chakra beam, spiral runners, astral threads, soulWave rings, dimensional overlay, bridge glyphs, energy particles, light beams, soul pulse core, bloom mask layer
 */

import * as THREE from 'three';
import { soulBridgeVertexShader } from './shaders/soul-bridge-vertex';
import { soulBridgeFragmentShader } from './shaders/soul-bridge-fragment';

export interface SoulBridgeEngineConfig {
  intensity?: number;
  mouse?: { x: number; y: number };
  parallaxStrength?: number;
  numSoulLights?: number;
  numSpiralRunners?: number;
  numAstralThreads?: number;
  numSoulWaves?: number;
  numBridgeGlyphs?: number;
  numEnergyParticles?: number;
  numLightBeams?: number;
}

export interface TwinSpiralData {
  spiralIndex: number;
  rotationDirection: number; // 1.0 or -1.0
}

export interface SoulLightData {
  nodeIndex: number;
  spiralIndex: number;
  t: number; // Position along spiral
}

export interface SpiralRunnerData {
  runnerIndex: number;
  spiralIndex: number;
}

export interface AstralThreadData {
  threadIndex: number;
}

export interface SoulWaveData {
  waveIndex: number;
  baseRadius: number;
}

export interface BridgeGlyphData {
  glyphIndex: number;
  angle: number;
  baseRadius: number;
}

export class SoulBridgeEngine {
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private config: SoulBridgeEngineConfig;
  
  private twinSpirals: TwinSpiralData[] = [];
  private soulLights: SoulLightData[] = [];
  private spiralRunners: SpiralRunnerData[] = [];
  private astralThreads: AstralThreadData[] = [];
  private soulWaves: SoulWaveData[] = [];
  private bridgeGlyphs: BridgeGlyphData[] = [];
  
  private numSoulLights: number;
  private numSpiralRunners: number;
  private numAstralThreads: number;
  private numSoulWaves: number;
  private numBridgeGlyphs: number;
  private numEnergyParticles: number;
  private numLightBeams: number;
  
  private breathPhase: number = 0;
  private breathStrength: number = 0;
  private blessingWaveProgress: number = 0;
  private scrollProgress: number = 0;
  private rotationSync: number = 0;
  private cameraFOV: number = 75.0;

  constructor(config: SoulBridgeEngineConfig = {}) {
    this.config = {
      intensity: config.intensity || 1.0,
      mouse: config.mouse || { x: 0, y: 0 },
      parallaxStrength: config.parallaxStrength || 1.0,
      numSoulLights: config.numSoulLights || 90,
      numSpiralRunners: config.numSpiralRunners || 12,
      numAstralThreads: config.numAstralThreads || 24,
      numSoulWaves: config.numSoulWaves || 10,
      numBridgeGlyphs: config.numBridgeGlyphs || 64,
      numEnergyParticles: config.numEnergyParticles || 350,
      numLightBeams: config.numLightBeams || 12,
    };
    
    this.numSoulLights = this.config.numSoulLights || 90;
    this.numSpiralRunners = this.config.numSpiralRunners || 12;
    this.numAstralThreads = this.config.numAstralThreads || 24;
    this.numSoulWaves = this.config.numSoulWaves || 10;
    this.numBridgeGlyphs = this.config.numBridgeGlyphs || 64;
    this.numEnergyParticles = this.config.numEnergyParticles || 350;
    this.numLightBeams = this.config.numLightBeams || 12;
    
    // Generate twin spirals (2)
    this.generateTwinSpirals();
    
    // Generate soul lights (60–90)
    this.generateSoulLights();
    
    // Generate spiral runners (8–12)
    this.generateSpiralRunners();
    
    // Generate astral threads (12–24)
    this.generateAstralThreads();
    
    // Generate soul waves (6–10)
    this.generateSoulWaves();
    
    // Generate bridge glyphs (48–64)
    this.generateBridgeGlyphs();
    
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
      vertexShader: soulBridgeVertexShader,
      fragmentShader: soulBridgeFragmentShader,
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
  private logarithmicSpiral(t: number, spiralIndex: number, rotationDirection: number): THREE.Vector2 {
    const angle = t * Math.PI * 2.0 * 4.0 * rotationDirection; // 4 full rotations, counter-rotating
    const baseRadius = 0.5;
    const maxRadius = 6.0;
    const radius = baseRadius * Math.exp(t * Math.log(maxRadius / baseRadius));
    
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    
    return new THREE.Vector2(x, z);
  }

  /**
   * Generate twin spirals (2)
   */
  private generateTwinSpirals(): void {
    this.twinSpirals = [];
    
    for (let i = 0; i < 2; i++) {
      const rotationDirection = i < 1 ? 1.0 : -1.0; // Counter-rotating
      this.twinSpirals.push({
        spiralIndex: i,
        rotationDirection,
      });
    }
  }

  /**
   * Generate soul lights (60–90)
   */
  private generateSoulLights(): void {
    this.soulLights = [];
    
    for (let i = 0; i < this.numSoulLights; i++) {
      const spiralIndex = i % 2;
      const t = i / this.numSoulLights;
      this.soulLights.push({
        nodeIndex: i,
        spiralIndex,
        t,
      });
    }
  }

  /**
   * Generate spiral runners (8–12)
   */
  private generateSpiralRunners(): void {
    this.spiralRunners = [];
    
    for (let i = 0; i < this.numSpiralRunners; i++) {
      const spiralIndex = i % 2;
      this.spiralRunners.push({
        runnerIndex: i,
        spiralIndex,
      });
    }
  }

  /**
   * Generate astral threads (12–24)
   */
  private generateAstralThreads(): void {
    this.astralThreads = [];
    
    for (let i = 0; i < this.numAstralThreads; i++) {
      this.astralThreads.push({
        threadIndex: i,
      });
    }
  }

  /**
   * Generate soul waves (6–10)
   */
  private generateSoulWaves(): void {
    this.soulWaves = [];
    
    for (let i = 0; i < this.numSoulWaves; i++) {
      const baseRadius = 1.0 + (i / this.numSoulWaves) * 5.0; // 1.0 to 6.0
      this.soulWaves.push({
        waveIndex: i,
        baseRadius,
      });
    }
  }

  /**
   * Generate bridge glyphs (48–64)
   */
  private generateBridgeGlyphs(): void {
    this.bridgeGlyphs = [];
    
    for (let i = 0; i < this.numBridgeGlyphs; i++) {
      const angle = (i / this.numBridgeGlyphs) * Math.PI * 2.0;
      const baseRadius = 5.0;
      this.bridgeGlyphs.push({
        glyphIndex: i,
        angle,
        baseRadius,
      });
    }
  }

  /**
   * Create geometry with all 14 layers
   * Note: This is a simplified version - full implementation would include all 14 layers
   */
  private createGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    
    // Simplified geometry creation - full implementation would generate all 14 layers
    // Similar pattern to Gateway v3 but with 14 layers instead of 9
    const planeWidth = 12.0;
    const planeHeight = 12.0;
    const segmentsX = 64;
    const segmentsY = 64;
    
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    
    for (let i = 0; i <= segmentsX; i++) {
      for (let j = 0; j <= segmentsY; j++) {
        const u = i / segmentsX;
        const v = j / segmentsY;
        const x = (u - 0.5) * planeWidth;
        const z = (v - 0.5) * planeHeight;
        const y = 0.0;
        
        positions.push(x, y, z - 18.0);
        uvs.push(u, v);
      }
    }
    
    for (let i = 0; i < segmentsX; i++) {
      for (let j = 0; j < segmentsY; j++) {
        const a = i * (segmentsY + 1) + j;
        const b = a + 1;
        const c = a + (segmentsY + 1);
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
   * Update with soul bridge state
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

