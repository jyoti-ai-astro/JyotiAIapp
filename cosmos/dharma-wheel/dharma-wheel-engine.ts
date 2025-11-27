/**
 * Dharma Wheel Engine
 * 
 * Phase 2 — Section 24: DHARMA WHEEL ENGINE
 * Dharma Wheel Engine (E28)
 * 
 * Generate 12-spoke wheel geometry, 3 flame rings, jewel quad, manage uniforms
 */

import * as THREE from 'three';
import { dharmaWheelVertexShader } from './shaders/dharma-wheel-vertex';
import { dharmaWheelFragmentShader } from './shaders/dharma-wheel-fragment';

export interface DharmaWheelEngineConfig {
  intensity?: number;
  mouse?: { x: number; y: number };
  parallaxStrength?: number;
  numSpokes?: number;
}

export interface WheelData {
  spokeIndex: number;
}

export interface FlameRingData {
  ringIndex: number;
}

export interface JewelData {
  position: THREE.Vector3;
}

export class DharmaWheelEngine {
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private config: DharmaWheelEngineConfig;
  
  private wheelSpokes: WheelData[] = [];
  private flameRings: FlameRingData[] = [];
  private jewel: JewelData;
  
  private numSpokes: number;
  
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
      numSpokes: config.numSpokes || 12,
    };
    
    this.numSpokes = this.config.numSpokes || 12;
    
    // Generate 12-spoke wheel
    this.generateWheel();
    
    // Generate 3 flame rings
    this.generateFlameRings();
    
    // Generate jewel
    this.generateJewel();
    
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
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    
    // Create mesh
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  /**
   * Generate 12-spoke wheel
   */
  private generateWheel(): void {
    this.wheelSpokes = [];
    
    for (let i = 0; i < this.numSpokes; i++) {
      this.wheelSpokes.push({
        spokeIndex: i,
      });
    }
  }

  /**
   * Generate 3 flame rings
   */
  private generateFlameRings(): void {
    this.flameRings = [];
    
    for (let i = 0; i < 3; i++) {
      this.flameRings.push({
        ringIndex: i,
      });
    }
  }

  /**
   * Generate jewel
   */
  private generateJewel(): void {
    this.jewel = {
      position: new THREE.Vector3(0, 0, 0),
    };
  }

  /**
   * Create geometry with wheel, flame rings, and jewel
   */
  private createGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    
    const positions: number[] = [];
    const uvs: number[] = [];
    const wheelIndices: number[] = [];
    const flameRingIndices: number[] = [];
    const jewelIndices: number[] = [];
    
    // ============================================
    // WHEEL (Layer A)
    // ============================================
    const wheelRadius = 0.5;
    const wheelSegments = 64; // High subdivision for smooth wheel
    
    for (let i = 0; i < wheelSegments; i++) {
      const t = i / wheelSegments;
      const angle = t * Math.PI * 2;
      const radius = wheelRadius;
      
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = 0;
      
      // Create quad for wheel segment
      const segmentSize = 0.02;
      positions.push(
        x - segmentSize, y - segmentSize, z, // Bottom-left
        x + segmentSize, y - segmentSize, z, // Bottom-right
        x - segmentSize, y + segmentSize, z, // Top-left
        x + segmentSize, y + segmentSize, z  // Top-right
      );
      
      // UVs
      uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
      
      // Determine which spoke this segment belongs to
      const spokeIndex = Math.floor((angle / (Math.PI * 2)) * this.numSpokes) % this.numSpokes;
      wheelIndices.push(spokeIndex, spokeIndex, spokeIndex, spokeIndex);
      flameRingIndices.push(-1, -1, -1, -1);
      jewelIndices.push(-1, -1, -1, -1);
    }
    
    // ============================================
    // FLAME RINGS (Layer B)
    // ============================================
    const flameRingSegments = 32;
    
    for (let ringIdx = 0; ringIdx < 3; ringIdx++) {
      const ringRadius = 0.25 - ringIdx * 0.05; // 0.25, 0.20, 0.15
      
      for (let i = 0; i < flameRingSegments; i++) {
        const t = i / flameRingSegments;
        const angle = t * Math.PI * 2;
        const radius = ringRadius;
        
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const z = 0;
        
        // Create quad for flame ring segment
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
        wheelIndices.push(-1, -1, -1, -1);
        flameRingIndices.push(ringIdx, ringIdx, ringIdx, ringIdx);
        jewelIndices.push(-1, -1, -1, -1);
      }
    }
    
    // ============================================
    // JEWEL (Layer C)
    // ============================================
    const jewelSize = 0.15;
    const x = 0;
    const y = 0;
    const z = 0;
    
    // Create quad for jewel
    positions.push(
      x - jewelSize, y - jewelSize, z, // Bottom-left
      x + jewelSize, y - jewelSize, z, // Bottom-right
      x - jewelSize, y + jewelSize, z, // Top-left
      x + jewelSize, y + jewelSize, z  // Top-right
    );
    
    // UVs
    uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
    
    // Indices
    wheelIndices.push(-1, -1, -1, -1);
    flameRingIndices.push(-1, -1, -1, -1);
    jewelIndices.push(0, 0, 0, 0);
    
    // Set attributes
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setAttribute('wheelIndex', new THREE.Float32BufferAttribute(wheelIndices, 1));
    geometry.setAttribute('flameRingIndex', new THREE.Float32BufferAttribute(flameRingIndices, 1));
    geometry.setAttribute('jewelIndex', new THREE.Float32BufferAttribute(jewelIndices, 1));
    
    // Create indices for quads
    const indices: number[] = [];
    let vertexIndex = 0;
    
    // Wheel
    for (let i = 0; i < wheelSegments; i++) {
      const base = vertexIndex;
      indices.push(
        base, base + 1, base + 2,
        base + 1, base + 3, base + 2
      );
      vertexIndex += 4;
    }
    
    // Flame rings
    for (let ringIdx = 0; ringIdx < 3; ringIdx++) {
      for (let i = 0; i < flameRingSegments; i++) {
        const base = vertexIndex;
        indices.push(
          base, base + 1, base + 2,
          base + 1, base + 3, base + 2
        );
        vertexIndex += 4;
      }
    }
    
    // Jewel
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

