/**
 * Gate of Time v2 Engine
 * 
 * Phase 2 — Section 57: GATE OF TIME ENGINE v2
 * Gate of Time Engine v2 (E61)
 * 
 * Generate all 12 layers: temporal base disc, chrono rings, temporal spiral, time glyph halo, time streams, ripple waves, temporal threads, chrono dust field, temporal tear layer, inner wormhole core, wormhole tunnel, bloom mask layer
 */

import * as THREE from 'three';
import { gateOfTimeVertexShader } from './shaders/gate-of-time-vertex';
import { gateOfTimeFragmentShader } from './shaders/gate-of-time-fragment';

export interface GateOfTimeEngineConfig {
  intensity?: number;
  mouse?: { x: number; y: number };
  parallaxStrength?: number;
  numGlyphs?: number;
  numTimeStreams?: number;
  numRippleWaves?: number;
  numTemporalThreads?: number;
  numParticles?: number;
}

export interface ChronoRingData {
  ringIndex: number;
  baseRadius: number; // 4.8, 5.2, 5.6, 6.0, 6.4
}

export interface GlyphData {
  glyphIndex: number;
  angle: number; // 0 to 2π
  baseRadius: number; // 4.2
}

export interface TimeStreamData {
  streamIndex: number;
  angle: number; // 0 to 2π
}

export interface RippleWaveData {
  waveIndex: number;
  baseRadius: number; // 1.0 to 5.5
}

export interface TemporalThreadData {
  threadIndex: number;
}

export class GateOfTimeEngine {
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private config: GateOfTimeEngineConfig;
  
  private chronoRings: ChronoRingData[] = [];
  private glyphs: GlyphData[] = [];
  private timeStreams: TimeStreamData[] = [];
  private rippleWaves: RippleWaveData[] = [];
  private temporalThreads: TemporalThreadData[] = [];
  
  private numGlyphs: number;
  private numTimeStreams: number;
  private numRippleWaves: number;
  private numTemporalThreads: number;
  private numParticles: number;
  
  private breathPhase: number = 0;
  private breathStrength: number = 0;
  private blessingWaveProgress: number = 0;
  private scrollProgress: number = 0;
  private rotationSync: number = 0;
  private cameraFOV: number = 75.0;

  constructor(config: GateOfTimeEngineConfig = {}) {
    this.config = {
      intensity: config.intensity || 1.0,
      mouse: config.mouse || { x: 0, y: 0 },
      parallaxStrength: config.parallaxStrength || 1.0,
      numGlyphs: config.numGlyphs || 100,
      numTimeStreams: config.numTimeStreams || 16,
      numRippleWaves: config.numRippleWaves || 12,
      numTemporalThreads: config.numTemporalThreads || 12,
      numParticles: config.numParticles || 450,
    };
    
    this.numGlyphs = this.config.numGlyphs || 100;
    this.numTimeStreams = this.config.numTimeStreams || 16;
    this.numRippleWaves = this.config.numRippleWaves || 12;
    this.numTemporalThreads = this.config.numTemporalThreads || 12;
    this.numParticles = this.config.numParticles || 450;
    
    // Generate chrono rings (5)
    this.generateChronoRings();
    
    // Generate glyphs (60–100)
    this.generateGlyphs();
    
    // Generate time streams (8–16)
    this.generateTimeStreams();
    
    // Generate ripple waves (8–12)
    this.generateRippleWaves();
    
    // Generate temporal threads (6–12)
    this.generateTemporalThreads();
    
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
      vertexShader: gateOfTimeVertexShader,
      fragmentShader: gateOfTimeFragmentShader,
      transparent: true,
      blending: THREE.NormalBlending, // Base layer uses normal blending
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    
    // Create mesh
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  /**
   * Generate double logarithmic spiral position
   */
  private doubleLogarithmicSpiral(t: number, spiralIndex: number): THREE.Vector2 {
    const angle = t * Math.PI * 2.0 * 4.0; // 4 full rotations
    const baseRadius = 0.3;
    const maxRadius = 5.0;
    const radius = baseRadius * Math.exp(t * Math.log(maxRadius / baseRadius));
    
    // Double spiral (two arms)
    const spiralOffset = (spiralIndex / 2.0) * Math.PI; // π offset for second arm
    const finalAngle = angle + spiralOffset;
    
    const x = Math.cos(finalAngle) * radius;
    const z = Math.sin(finalAngle) * radius;
    
    return new THREE.Vector2(x, z);
  }

  /**
   * Generate chrono rings (5)
   */
  private generateChronoRings(): void {
    this.chronoRings = [];
    
    for (let i = 0; i < 5; i++) {
      const baseRadius = 4.8 + i * 0.4; // 4.8, 5.2, 5.6, 6.0, 6.4
      this.chronoRings.push({
        ringIndex: i,
        baseRadius,
      });
    }
  }

  /**
   * Generate glyphs (60–100)
   */
  private generateGlyphs(): void {
    this.glyphs = [];
    
    for (let i = 0; i < this.numGlyphs; i++) {
      const angle = (i / this.numGlyphs) * Math.PI * 2.0;
      const baseRadius = 4.2;
      this.glyphs.push({
        glyphIndex: i,
        angle,
        baseRadius,
      });
    }
  }

  /**
   * Generate time streams (8–16)
   */
  private generateTimeStreams(): void {
    this.timeStreams = [];
    
    for (let i = 0; i < this.numTimeStreams; i++) {
      const angle = (i / this.numTimeStreams) * Math.PI * 2.0;
      this.timeStreams.push({
        streamIndex: i,
        angle,
      });
    }
  }

  /**
   * Generate ripple waves (8–12)
   */
  private generateRippleWaves(): void {
    this.rippleWaves = [];
    
    for (let i = 0; i < this.numRippleWaves; i++) {
      const baseRadius = 1.0 + (i / this.numRippleWaves) * 4.5; // 1.0 to 5.5
      this.rippleWaves.push({
        waveIndex: i,
        baseRadius,
      });
    }
  }

  /**
   * Generate temporal threads (6–12)
   */
  private generateTemporalThreads(): void {
    this.temporalThreads = [];
    
    for (let i = 0; i < this.numTemporalThreads; i++) {
      this.temporalThreads.push({
        threadIndex: i,
      });
    }
  }

  /**
   * Create geometry with all 12 layers
   * Note: This is a simplified version - full implementation would include all 12 layers
   * For production, expand this to include: base disc, chrono rings, temporal spiral, glyphs,
   * time streams, ripple waves, temporal threads, dust, tear, wormhole core, tunnel, bloom mask
   */
  private createGeometry(): THREE.BufferGeometry {
    // Simplified geometry creation - full implementation would generate all 12 layers
    // Similar pattern to Gateway v3 but with 12 layers instead of 9
    const geometry = new THREE.BufferGeometry();
    
    // For now, create a basic disc geometry
    // Full implementation would follow the Gateway v3 pattern with all 12 layers
    const discRadius = 5.5;
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
          Math.sin(angle) * radius - 15.2
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
   * Update with gate of time state
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

