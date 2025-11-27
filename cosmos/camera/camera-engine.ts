/**
 * Cosmic Camera Engine
 * 
 * Phase 2 — Section 10: SCROLL INTERACTION ENGINE v1.0
 * Phase 2 — Section 12: PERFORMANCE, FALLBACKS & MOBILE STRATEGY v1.0
 * Cosmic Camera System (E18)
 * 
 * Camera modes: Orbit, Scroll-Depth, Guru Focus, Blessing Wave Pulse, Audio Reactive, Projection Alignment
 */

import * as THREE from 'three';
import { motionOrchestrator, MotionState } from '../motion/orchestrator';

export type CameraMode = 
  | 'orbit'
  | 'scroll-depth'
  | 'guru-focus'
  | 'blessing-pulse'
  | 'audio-reactive'
  | 'projection-alignment';

export interface CameraState {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  fov: number;
  target: THREE.Vector3;
}

export interface CameraConfig {
  mode?: CameraMode;
  intensity?: number;
  scroll?: number;
  mouse?: { x: number; y: number };
  audioReactive?: {
    bass?: number;
    mid?: number;
    high?: number;
  };
  blessingWaveProgress?: number;
  isGuruHovered?: boolean;
  isBlessingWaveActive?: boolean;
}

export class CameraEngine {
  private currentMode: CameraMode = 'orbit';
  private config: CameraConfig;
  private state: CameraState;
  
  // Orbit mode state
  private orbitYaw: number = 0;
  private orbitPitch: number = 0;
  private orbitDamping: number = 0.95;
  
  // Scroll-depth state
  private scrollDepth: number = -4.0; // Default Z position
  private scrollVelocity: number = 0;
  private scrollDamping: number = 0.9;
  
  // Guru focus state
  private guruTarget: THREE.Vector3 = new THREE.Vector3(0, 0, -1.7);
  private guruFocusZ: number = -1.2;
  private guruFocusProgress: number = 0;
  private guruFocusDamping: number = 0.92;
  
  // Blessing wave pulse state
  private blessingFOVOffset: number = 0;
  private blessingFOVDamping: number = 0.9;
  
  // Audio reactive state
  private audioShake: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private audioRotationJitter: THREE.Euler = new THREE.Euler(0, 0, 0);
  private audioDamping: number = 0.85;
  
  // Projection alignment state
  private projectionPitch: number = -0.25;
  private projectionAlignmentProgress: number = 0;
  private projectionDamping: number = 0.9;
  
  // Base camera settings
  private baseFOV: number = 50;
  private basePosition: THREE.Vector3 = new THREE.Vector3(0, 0, -4);
  private baseTarget: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

  constructor(config: CameraConfig = {}) {
    this.config = {
      mode: config.mode || 'orbit',
      intensity: config.intensity || 1.0,
      scroll: config.scroll || 0,
      mouse: config.mouse || { x: 0, y: 0 },
      audioReactive: config.audioReactive || { bass: 0, mid: 0, high: 0 },
      blessingWaveProgress: config.blessingWaveProgress || 0,
      isGuruHovered: config.isGuruHovered || false,
      isBlessingWaveActive: config.isBlessingWaveActive || false,
    };
    
    this.currentMode = this.config.mode || 'orbit';
    
    this.state = {
      position: this.basePosition.clone(),
      rotation: new THREE.Euler(0, 0, 0),
      fov: this.baseFOV,
      target: this.baseTarget.clone(),
    };
  }

  /**
   * Update camera state based on current mode
   */
  update(deltaTime: number): CameraState {
    const motionState = motionOrchestrator.getMotionState();
    
    // Update config from motion state
    if (this.config.audioReactive) {
      this.config.audioReactive = {
        bass: motionState.bassMotion,
        mid: motionState.midMotion,
        high: motionState.highMotion,
      };
    }
    
    // Determine active mode (priority order)
    let activeMode: CameraMode = this.currentMode;
    
    if (this.config.isBlessingWaveActive && this.config.blessingWaveProgress && this.config.blessingWaveProgress > 0) {
      activeMode = 'blessing-pulse';
    } else if (this.config.isGuruHovered || this.config.isBlessingWaveActive) {
      activeMode = 'guru-focus';
    } else if (this.config.scroll !== undefined && this.config.scroll > 0) {
      activeMode = 'scroll-depth';
    } else {
      activeMode = this.currentMode;
    }
    
    // Apply mode-specific updates
    switch (activeMode) {
      case 'orbit':
        this.updateOrbitMode(deltaTime);
        break;
      case 'scroll-depth':
        this.updateScrollDepthMode(deltaTime);
        break;
      case 'guru-focus':
        this.updateGuruFocusMode(deltaTime);
        break;
      case 'blessing-pulse':
        this.updateBlessingPulseMode(deltaTime);
        break;
      case 'audio-reactive':
        this.updateAudioReactiveMode(deltaTime);
        break;
      case 'projection-alignment':
        this.updateProjectionAlignmentMode(deltaTime);
        break;
    }
    
    // Always apply audio reactive effects (additive)
    this.applyAudioReactive(deltaTime);
    
    // Apply projection alignment if enabled
    if (this.currentMode === 'projection-alignment') {
      this.applyProjectionAlignment(deltaTime);
    }
    
    return this.state;
  }

  /**
   * A. Orbit Mode
   */
  private updateOrbitMode(deltaTime: number): void {
    // Slow orbit: yaw += 0.02, pitch += 0.01 (scaled by time)
    this.orbitYaw += 0.02 * deltaTime;
    this.orbitPitch += 0.01 * deltaTime;
    
    // Parallax influence from mouse
    const mouseInfluence = 0.3;
    this.orbitYaw += (this.config.mouse?.x || 0) * mouseInfluence * deltaTime;
    this.orbitPitch += (this.config.mouse?.y || 0) * mouseInfluence * deltaTime;
    
    // Smooth damping
    this.orbitYaw *= this.orbitDamping;
    this.orbitPitch *= this.orbitDamping;
    
    // Apply rotation
    this.state.rotation.y = this.orbitYaw;
    this.state.rotation.x = this.orbitPitch;
    
    // Orbit around target
    const radius = 4.0;
    this.state.position.x = Math.sin(this.orbitYaw) * radius;
    this.state.position.z = Math.cos(this.orbitYaw) * radius;
    this.state.position.y = Math.sin(this.orbitPitch) * radius * 0.5;
  }

  /**
   * B. Scroll-Depth Mode
   */
  private updateScrollDepthMode(deltaTime: number): void {
    // scrollProgress moves camera Z between -6.0 → -2.0
    const targetZ = -6.0 + (this.config.scroll || 0) * 4.0; // -6.0 to -2.0
    
    // Smooth interpolated dolly with spring easing
    const springStrength = 5.0;
    const springDamping = 0.8;
    const diff = targetZ - this.scrollDepth;
    this.scrollVelocity += diff * springStrength * deltaTime;
    this.scrollVelocity *= springDamping;
    this.scrollDepth += this.scrollVelocity * deltaTime;
    
    // scrollVelocity adds momentum
    const motionState = motionOrchestrator.getMotionState();
    if (motionState.scrollVelocity) {
      this.scrollVelocity += motionState.scrollVelocity * 0.1;
    }
    
    // Apply position
    this.state.position.z = this.scrollDepth;
    this.state.position.x = 0;
    this.state.position.y = 0;
  }

  /**
   * C. Guru Focus Mode
   */
  private updateGuruFocusMode(deltaTime: number): void {
    // CameraTarget = Guru position ([0,0,-1.7])
    const target = this.guruTarget.clone();
    
    // Camera moves inward: Z = -1.2
    const targetZ = this.guruFocusZ;
    
    // Smooth transition
    const targetProgress = 1.0;
    this.guruFocusProgress += (targetProgress - this.guruFocusProgress) * (1.0 - this.guruFocusDamping);
    
    // Interpolate position
    const baseZ = -4.0;
    const currentZ = baseZ + (targetZ - baseZ) * this.guruFocusProgress;
    this.state.position.z = currentZ;
    
    // Look at guru target
    this.state.target.copy(target);
    
    // BassMotion adds micro-pulse zoom (0.98 → 1.02)
    const bass = this.config.audioReactive?.bass || 0;
    const pulseScale = 0.98 + bass * 0.04; // 0.98 to 1.02
    this.state.position.multiplyScalar(pulseScale / this.state.position.length());
  }

  /**
   * D. Blessing Wave Pulse Camera
   */
  private updateBlessingPulseMode(deltaTime: number): void {
    // When BlessingWave.waveProgress > 0:
    const waveProgress = this.config.blessingWaveProgress || 0;
    
    // Zoom-out pulse: FOV change (0.0 → +5 degrees)
    const targetFOVOffset = waveProgress * 5.0; // 0 to 5 degrees
    
    // Smooth transition
    this.blessingFOVOffset += (targetFOVOffset - this.blessingFOVOffset) * (1.0 - this.blessingFOVDamping);
    
    // FOV returns on wave fade
    this.state.fov = this.baseFOV + this.blessingFOVOffset;
    
    // Also add slight zoom-out position
    const zoomOut = waveProgress * 0.3;
    this.state.position.z += zoomOut;
  }

  /**
   * E. Audio Reactive Camera
   */
  private applyAudioReactive(deltaTime: number): void {
    const bass = this.config.audioReactive?.bass || 0;
    const mid = this.config.audioReactive?.mid || 0;
    const high = this.config.audioReactive?.high || 0;
    
    // BassMotion → camera shake (0 → 0.015)
    const shakeAmount = bass * 0.015;
    this.audioShake.x = (Math.random() - 0.5) * shakeAmount;
    this.audioShake.y = (Math.random() - 0.5) * shakeAmount;
    this.audioShake.z = (Math.random() - 0.5) * shakeAmount;
    this.audioShake.multiplyScalar(this.audioDamping);
    
    // MidMotion → rotation jitter (0 → 0.01)
    const jitterAmount = mid * 0.01;
    this.audioRotationJitter.x = (Math.random() - 0.5) * jitterAmount;
    this.audioRotationJitter.y = (Math.random() - 0.5) * jitterAmount;
    this.audioRotationJitter.z = (Math.random() - 0.5) * jitterAmount;
    this.audioRotationJitter.x *= this.audioDamping;
    this.audioRotationJitter.y *= this.audioDamping;
    this.audioRotationJitter.z *= this.audioDamping;
    
    // HighMotion → micro shimmer (subtle position offset)
    const shimmerAmount = high * 0.005;
    const shimmer = new THREE.Vector3(
      (Math.random() - 0.5) * shimmerAmount,
      (Math.random() - 0.5) * shimmerAmount,
      (Math.random() - 0.5) * shimmerAmount
    );
    
    // Apply audio reactive effects
    this.state.position.add(this.audioShake);
    this.state.position.add(shimmer);
    this.state.rotation.x += this.audioRotationJitter.x;
    this.state.rotation.y += this.audioRotationJitter.y;
    this.state.rotation.z += this.audioRotationJitter.z;
  }

  /**
   * F. Projection Alignment Mode
   */
  private updateProjectionAlignmentMode(deltaTime: number): void {
    // Align with Projection plane rotation
    // Camera looks slightly downward (pitch = -0.25)
    const targetPitch = this.projectionPitch;
    
    // Smooth transition
    this.projectionAlignmentProgress += (1.0 - this.projectionAlignmentProgress) * (1.0 - this.projectionDamping);
    
    // Apply pitch
    this.state.rotation.x = targetPitch * this.projectionAlignmentProgress;
  }

  private applyProjectionAlignment(deltaTime: number): void {
    // Additional alignment logic if needed
  }

  /**
   * Set camera mode
   */
  setMode(mode: CameraMode): void {
    this.currentMode = mode;
  }

  /**
   * Set camera target
   */
  setTarget(target: THREE.Vector3): void {
    this.state.target.copy(target);
  }

  /**
   * Set camera offset
   */
  setOffset(offset: THREE.Vector3): void {
    this.state.position.add(offset);
  }

  /**
   * Trigger camera shake
   */
  shake(intensity: number = 1.0): void {
    this.audioShake.set(
      (Math.random() - 0.5) * intensity * 0.02,
      (Math.random() - 0.5) * intensity * 0.02,
      (Math.random() - 0.5) * intensity * 0.02
    );
  }

  /**
   * Reset camera to default state
   */
  reset(): void {
    this.state.position.copy(this.basePosition);
    this.state.rotation.set(0, 0, 0);
    this.state.fov = this.baseFOV;
    this.state.target.copy(this.baseTarget);
    this.orbitYaw = 0;
    this.orbitPitch = 0;
    this.scrollDepth = -4.0;
    this.scrollVelocity = 0;
    this.guruFocusProgress = 0;
    this.blessingFOVOffset = 0;
    this.audioShake.set(0, 0, 0);
    this.audioRotationJitter.set(0, 0, 0);
    this.projectionAlignmentProgress = 0;
  }

  /**
   * Update config
   */
  updateConfig(config: Partial<CameraConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current state
   */
  getState(): CameraState {
    return this.state;
  }
}

