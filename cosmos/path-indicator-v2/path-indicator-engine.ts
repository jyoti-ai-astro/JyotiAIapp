/**
 * Path Indicator v2 Engine
 * 
 * Phase 2 — Section 53: PATH INDICATOR ENGINE v2
 * Path Indicator Engine v2 (E57)
 * 
 * Generate all 4 layers: multi-track path lines, path markers/nodes, energy pulses, path fog
 */

import * as THREE from 'three';
import { pathIndicatorVertexShader } from './shaders/path-indicator-vertex';
import { pathIndicatorFragmentShader } from './shaders/path-indicator-fragment';

export interface PathIndicatorEngineConfig {
  intensity?: number;
  mouse?: { x: number; y: number };
  parallaxStrength?: number;
  numNodes?: number;
  numPulses?: number;
}

export interface SplinePoint {
  position: THREE.Vector3;
  t: number; // Normalized position along path (0-1)
}

export interface PathLineData {
  pathIndex: number;
  baseRadius: number; // 4.0 to 10.0
  splinePoints: SplinePoint[];
}

export interface NodeData {
  nodeIndex: number;
  pathIndex: number;
  t: number; // Position along path
  position: THREE.Vector3;
}

export interface PulseData {
  pulseIndex: number;
  pathIndex: number;
  baseT: number; // Base position along path
}

export class PathIndicatorEngine {
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private config: PathIndicatorEngineConfig;
  
  private pathLines: PathLineData[] = [];
  private nodes: NodeData[] = [];
  private pulses: PulseData[] = [];
  
  private numNodes: number;
  private numPulses: number;
  
  private breathPhase: number = 0;
  private breathStrength: number = 0;
  private blessingWaveProgress: number = 0;
  private scrollProgress: number = 0;
  private rotationSync: number = 0;
  private cameraFOV: number = 75.0;

  constructor(config: PathIndicatorEngineConfig = {}) {
    this.config = {
      intensity: config.intensity || 1.0,
      mouse: config.mouse || { x: 0, y: 0 },
      parallaxStrength: config.parallaxStrength || 1.0,
      numNodes: config.numNodes || 30,
      numPulses: config.numPulses || 5,
    };
    
    this.numNodes = this.config.numNodes || 30;
    this.numPulses = this.config.numPulses || 5;
    
    // Generate path lines (3-5)
    this.generatePathLines();
    
    // Generate nodes (20-40)
    this.generateNodes();
    
    // Generate pulses (3-7)
    this.generatePulses();
    
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
      vertexShader: pathIndicatorVertexShader,
      fragmentShader: pathIndicatorFragmentShader,
      transparent: true,
      blending: THREE.NormalBlending, // Base layer uses normal blending
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    
    // Create mesh
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  /**
   * Generate spline position (phi-based spiral)
   */
  private phiSpiralSpline(t: number, pathIndex: number): THREE.Vector3 {
    // 3-5 spline-based paths, radius 4 → 10 units
    const baseRadius = 4.0 + (pathIndex / 4.0) * 6.0; // 4.0 to 10.0
    const angle = t * Math.PI * 2.0 * 2.0; // 2 full rotations
    
    // Spiral path
    const radius = baseRadius + t * 2.0;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = Math.sin(t * Math.PI * 2.0 * 3.0) * 0.5; // Vertical variation
    
    return new THREE.Vector3(x, y, z);
  }

  /**
   * Generate path lines (3-5)
   */
  private generatePathLines(): void {
    this.pathLines = [];
    
    for (let i = 0; i < 5; i++) {
      const baseRadius = 4.0 + (i / 4.0) * 6.0; // 4.0 to 10.0
      const splinePoints: SplinePoint[] = [];
      
      // Generate spline points
      const numSegments = 64; // Segments per path
      for (let j = 0; j <= numSegments; j++) {
        const t = j / numSegments; // 0 to 1
        const position = this.phiSpiralSpline(t, i);
        splinePoints.push({
          position,
          t,
        });
      }
      
      this.pathLines.push({
        pathIndex: i,
        baseRadius,
        splinePoints,
      });
    }
  }

  /**
   * Generate nodes (20-40)
   */
  private generateNodes(): void {
    this.nodes = [];
    
    for (let i = 0; i < this.numNodes; i++) {
      const pathIndex = i % 5; // Distribute across 5 paths
      const t = (i / this.numNodes) * 0.8 + 0.1; // 0.1 to 0.9 (avoid edges)
      const position = this.phiSpiralSpline(t, pathIndex);
      
      this.nodes.push({
        nodeIndex: i,
        pathIndex,
        t,
        position,
      });
    }
  }

  /**
   * Generate pulses (3-7)
   */
  private generatePulses(): void {
    this.pulses = [];
    
    for (let i = 0; i < this.numPulses; i++) {
      const pathIndex = i % 5; // Distribute across 5 paths
      const baseT = (i / this.numPulses) * 0.7 + 0.15; // 0.15 to 0.85
      
      this.pulses.push({
        pulseIndex: i,
        pathIndex,
        baseT,
      });
    }
  }

  /**
   * Create geometry with all 4 layers
   */
  private createGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    
    const positions: number[] = [];
    const uvs: number[] = [];
    const pathLineIndices: number[] = [];
    const nodeIndices: number[] = [];
    const pulseIndices: number[] = [];
    const fogIndices: number[] = [];
    const pathProgresses: number[] = [];
    const pathSegments: number[] = [];
    
    // ============================================
    // PATH LINES (Layer A - 5 paths)
    // ============================================
    const pathWidth = 0.08; // Thin path width
    const pathSegmentsPerPath = 64;
    
    for (let path = 0; path < 5; path++) {
      const pathData = this.pathLines[path];
      
      for (let i = 0; i < pathSegmentsPerPath; i++) {
        const t = i / pathSegmentsPerPath; // 0 to 1
        const tNext = (i + 1) / pathSegmentsPerPath;
        
        const pos1 = pathData.splinePoints[i].position;
        const pos2 = pathData.splinePoints[Math.min(i + 1, pathSegmentsPerPath)].position;
        
        // Create quad for path segment
        const tangent = new THREE.Vector3().subVectors(pos2, pos1).normalize();
        const normal = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();
        
        // 4 vertices for quad
        const offset1 = normal.clone().multiplyScalar(-pathWidth * 0.5);
        const offset2 = normal.clone().multiplyScalar(pathWidth * 0.5);
        
        positions.push(
          pos1.x + offset1.x, pos1.y + offset1.y, pos1.z + offset1.z, // Bottom-left
          pos1.x + offset2.x, pos1.y + offset2.y, pos1.z + offset2.z, // Bottom-right
          pos2.x + offset1.x, pos2.y + offset1.y, pos2.z + offset1.z, // Top-left
          pos2.x + offset2.x, pos2.y + offset2.y, pos2.z + offset2.z  // Top-right
        );
        
        // UVs
        uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
        
        // Indices
        pathLineIndices.push(path, path, path, path);
        nodeIndices.push(-1, -1, -1, -1);
        pulseIndices.push(-1, -1, -1, -1);
        fogIndices.push(-1, -1, -1, -1);
        pathProgresses.push(t, t, tNext, tNext);
        pathSegments.push(i, i, i, i);
      }
    }
    
    // ============================================
    // NODES (Layer B - 20-40 nodes)
    // ============================================
    const nodeSize = 0.15;
    
    for (let i = 0; i < this.numNodes; i++) {
      const node = this.nodes[i];
      const x = node.position.x;
      const y = node.position.y;
      const z = node.position.z;
      
      // Create quad for each node
      positions.push(
        x - nodeSize, y - nodeSize, z, // Bottom-left
        x + nodeSize, y - nodeSize, z, // Bottom-right
        x - nodeSize, y + nodeSize, z, // Top-left
        x + nodeSize, y + nodeSize, z  // Top-right
      );
      
      // UVs
      uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
      
      // Indices
      pathLineIndices.push(-1, -1, -1, -1);
      nodeIndices.push(i, i, i, i);
      pulseIndices.push(-1, -1, -1, -1);
      fogIndices.push(-1, -1, -1, -1);
      pathProgresses.push(node.t, node.t, node.t, node.t);
      pathSegments.push(0, 0, 0, 0);
    }
    
    // ============================================
    // PULSES (Layer C - 3-7 pulses)
    // ============================================
    const pulseSize = 0.3;
    
    for (let i = 0; i < this.numPulses; i++) {
      const pulse = this.pulses[i];
      const position = this.phiSpiralSpline(pulse.baseT, pulse.pathIndex);
      const x = position.x;
      const y = position.y;
      const z = position.z;
      
      // Create quad for each pulse
      positions.push(
        x - pulseSize, y - pulseSize, z, // Bottom-left
        x + pulseSize, y - pulseSize, z, // Bottom-right
        x - pulseSize, y + pulseSize, z, // Top-left
        x + pulseSize, y + pulseSize, z  // Top-right
      );
      
      // UVs
      uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
      
      // Indices
      pathLineIndices.push(-1, -1, -1, -1);
      nodeIndices.push(-1, -1, -1, -1);
      pulseIndices.push(i, i, i, i);
      fogIndices.push(-1, -1, -1, -1);
      pathProgresses.push(pulse.baseT, pulse.baseT, pulse.baseT, pulse.baseT);
      pathSegments.push(0, 0, 0, 0);
    }
    
    // ============================================
    // FOG (Layer D - Path Fog/Atmospheric Mist)
    // ============================================
    const fogWidth = 20.0;
    const fogHeight = 20.0;
    const fogSegmentsX = 32;
    const fogSegmentsY = 32;
    
    for (let i = 0; i <= fogSegmentsX; i++) {
      for (let j = 0; j <= fogSegmentsY; j++) {
        const u = i / fogSegmentsX;
        const v = j / fogSegmentsY;
        
        const x = (u - 0.5) * fogWidth;
        const z = (v - 0.5) * fogHeight;
        const y = 0.0; // Will be displaced in shader
        
        positions.push(x, y, z - 10.0);
        uvs.push(u, v);
        
        pathLineIndices.push(-1);
        nodeIndices.push(-1);
        pulseIndices.push(-1);
        fogIndices.push(0); // Single fog layer
        pathProgresses.push(0);
        pathSegments.push(0);
      }
    }
    
    // Set attributes
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setAttribute('pathLineIndex', new THREE.Float32BufferAttribute(pathLineIndices, 1));
    geometry.setAttribute('nodeIndex', new THREE.Float32BufferAttribute(nodeIndices, 1));
    geometry.setAttribute('pulseIndex', new THREE.Float32BufferAttribute(pulseIndices, 1));
    geometry.setAttribute('fogIndex', new THREE.Float32BufferAttribute(fogIndices, 1));
    geometry.setAttribute('pathProgress', new THREE.Float32BufferAttribute(pathProgresses, 1));
    geometry.setAttribute('pathSegment', new THREE.Float32BufferAttribute(pathSegments, 1));
    
    // Create indices
    const indices: number[] = [];
    let vertexIndex = 0;
    
    // Path lines (quads) - 5 paths
    for (let path = 0; path < 5; path++) {
      for (let i = 0; i < pathSegmentsPerPath; i++) {
        const base = vertexIndex;
        indices.push(
          base, base + 1, base + 2,
          base + 1, base + 3, base + 2
        );
        vertexIndex += 4;
      }
    }
    
    // Nodes (quads)
    for (let i = 0; i < this.numNodes; i++) {
      const base = vertexIndex;
      indices.push(
        base, base + 1, base + 2,
        base + 1, base + 3, base + 2
      );
      vertexIndex += 4;
    }
    
    // Pulses (quads)
    for (let i = 0; i < this.numPulses; i++) {
      const base = vertexIndex;
      indices.push(
        base, base + 1, base + 2,
        base + 1, base + 3, base + 2
      );
      vertexIndex += 4;
    }
    
    // Fog (quads)
    for (let i = 0; i < fogSegmentsX; i++) {
      for (let j = 0; j < fogSegmentsY; j++) {
        const a = vertexIndex + i * (fogSegmentsY + 1) + j;
        const b = a + 1;
        const c = a + (fogSegmentsY + 1);
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
   * Update with path indicator state
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

