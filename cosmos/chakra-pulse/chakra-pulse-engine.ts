/**
 * Chakra Pulse Engine
 * 
 * Phase 2 — Section 35: CHAKRA PULSE ENGINE
 * Chakra Pulse Engine (E39)
 * 
 * Generate 7 chakra discs, pulse rings, spine beam, manage uniforms
 */

import * as THREE from 'three';
import { chakraVertexShader } from './shaders/chakra-vertex';
import { chakraFragmentShader } from './shaders/chakra-fragment';

export interface ChakraPulseEngineConfig {
  intensity?: number;
  mouse?: { x: number; y: number };
  parallaxStrength?: number;
}

export interface ChakraData {
  chakraIndex: number;
  yPosition: number;
  color: [number, number, number];
  radius: number;
}

export interface PulseRingData {
  ringIndex: number;
  chakraIndex: number;
  yPosition: number;
}

export interface SpineData {
  startY: number;
  endY: number;
  width: number;
}

export class ChakraPulseEngine {
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private config: ChakraPulseEngineConfig;
  
  private chakras: ChakraData[] = [];
  private pulseRings: PulseRingData[] = [];
  private spine: SpineData;
  
  private breathPhase: number = 0;
  private breathStrength: number = 0;
  private blessingWaveProgress: number = 0;
  private scrollProgress: number = 0;
  private rotationSync: number = 0;
  private cameraFOV: number = 75.0;

  constructor(config: ChakraPulseEngineConfig = {}) {
    this.config = {
      intensity: config.intensity || 1.0,
      mouse: config.mouse || { x: 0, y: 0 },
      parallaxStrength: config.parallaxStrength || 1.0,
    };
    
    // Generate 7 chakras
    this.generateChakras();
    
    // Generate pulse rings (one per chakra)
    this.generatePulseRings();
    
    // Generate spine beam
    this.generateSpine();
    
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
      vertexShader: chakraVertexShader,
      fragmentShader: chakraFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    
    // Create mesh
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  /**
   * Generate 7 chakras
   */
  private generateChakras(): void {
    const chakraPositions = [
      -0.9,  // root
      -0.55, // sacral
      -0.2,  // solar
      0.2,   // heart
      0.55,  // throat
      0.85,  // third-eye
      1.15,  // crown
    ];
    
    const chakraColors: [number, number, number][] = [
      [1.0, 0.2, 0.2],   // root: red
      [1.0, 0.6, 0.2],   // sacral: orange
      [1.0, 1.0, 0.2],   // solar: yellow
      [0.2, 1.0, 0.4],   // heart: green
      [0.2, 0.6, 1.0],   // throat: blue
      [0.4, 0.2, 1.0],   // third-eye: indigo
      [0.8, 0.2, 1.0],   // crown: violet
    ];
    
    for (let i = 0; i < 7; i++) {
      this.chakras.push({
        chakraIndex: i,
        yPosition: chakraPositions[i],
        color: chakraColors[i],
        radius: 0.11,
      });
    }
  }

  /**
   * Generate pulse rings (one per chakra)
   */
  private generatePulseRings(): void {
    for (let i = 0; i < 7; i++) {
      const chakra = this.chakras[i];
      this.pulseRings.push({
        ringIndex: i,
        chakraIndex: i,
        yPosition: chakra.yPosition,
      });
    }
  }

  /**
   * Generate spine beam
   */
  private generateSpine(): void {
    this.spine = {
      startY: -0.9, // root
      endY: 1.15,   // crown
      width: 0.03,
    };
  }

  /**
   * Create geometry with chakras, pulse rings, and spine
   */
  private createGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    
    const positions: number[] = [];
    const uvs: number[] = [];
    const chakraIndices: number[] = [];
    const pulseRingIndices: number[] = [];
    const spineIndices: number[] = [];
    
    // ============================================
    // CHAKRA DISCS (Layer A)
    // ============================================
    const chakraRadius = 0.11;
    const chakraSegments = 32;
    
    for (let i = 0; i < 7; i++) {
      const chakra = this.chakras[i];
      
      for (let j = 0; j < chakraSegments; j++) {
        const t = j / chakraSegments;
        const angle = t * Math.PI * 2;
        const radius = chakraRadius;
        
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius + chakra.yPosition;
        const z = -3.9;
        
        // Create quad for chakra segment
        const segmentSize = 0.01;
        positions.push(
          x - segmentSize, y - segmentSize, z, // Bottom-left
          x + segmentSize, y - segmentSize, z, // Bottom-right
          x - segmentSize, y + segmentSize, z, // Top-left
          x + segmentSize, y + segmentSize, z  // Top-right
        );
        
        // UVs
        uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
        
        // Indices
        chakraIndices.push(i, i, i, i);
        pulseRingIndices.push(-1, -1, -1, -1);
        spineIndices.push(-1, -1, -1, -1);
      }
    }
    
    // ============================================
    // PULSE RINGS (Layer B)
    // ============================================
    const ringThickness = 0.015;
    const ringSegments = 48;
    
    for (let i = 0; i < 7; i++) {
      const ring = this.pulseRings[i];
      
      for (let j = 0; j < ringSegments; j++) {
        const t = j / ringSegments;
        const angle = t * Math.PI * 2;
        const radius = 0.11; // Starting radius
        
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius + ring.yPosition;
        const z = -3.9;
        
        // Create quad for ring segment
        positions.push(
          x - ringThickness, y - ringThickness, z, // Bottom-left
          x + ringThickness, y - ringThickness, z, // Bottom-right
          x - ringThickness, y + ringThickness, z, // Top-left
          x + ringThickness, y + ringThickness, z  // Top-right
        );
        
        // UVs
        uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
        
        // Indices
        chakraIndices.push(-1, -1, -1, -1);
        pulseRingIndices.push(i, i, i, i);
        spineIndices.push(-1, -1, -1, -1);
      }
    }
    
    // ============================================
    // SPINE BEAM (Layer C)
    // ============================================
    const spineWidth = 0.03;
    const spineSegments = 64; // Vertical segments
    
    for (let i = 0; i < spineSegments; i++) {
      const t = i / spineSegments;
      const spineY = this.spine.startY + (this.spine.endY - this.spine.startY) * t;
      
      // Create quad strip for spine
      positions.push(
        -spineWidth, spineY, -3.9, // Left
        spineWidth, spineY, -3.9,  // Right
        -spineWidth, spineY + (this.spine.endY - this.spine.startY) / spineSegments, -3.9, // Left next
        spineWidth, spineY + (this.spine.endY - this.spine.startY) / spineSegments, -3.9   // Right next
      );
      
      // UVs
      uvs.push(0, t, 1, t, 0, t + 1.0 / spineSegments, 1, t + 1.0 / spineSegments);
      
      // Indices
      chakraIndices.push(-1, -1, -1, -1);
      pulseRingIndices.push(-1, -1, -1, -1);
      spineIndices.push(0, 0, 0, 0); // Single spine
    }
    
    // Set attributes
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setAttribute('chakraIndex', new THREE.Float32BufferAttribute(chakraIndices, 1));
    geometry.setAttribute('pulseRingIndex', new THREE.Float32BufferAttribute(pulseRingIndices, 1));
    geometry.setAttribute('spineIndex', new THREE.Float32BufferAttribute(spineIndices, 1));
    
    // Create indices
    const indices: number[] = [];
    let vertexIndex = 0;
    
    // Chakra discs (quads)
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < chakraSegments; j++) {
        const base = vertexIndex;
        indices.push(
          base, base + 1, base + 2,
          base + 1, base + 3, base + 2
        );
        vertexIndex += 4;
      }
    }
    
    // Pulse rings (quads)
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < ringSegments; j++) {
        const base = vertexIndex;
        indices.push(
          base, base + 1, base + 2,
          base + 1, base + 3, base + 2
        );
        vertexIndex += 4;
      }
    }
    
    // Spine beam (quads)
    for (let i = 0; i < spineSegments; i++) {
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
   * Update with chakra pulse state
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

