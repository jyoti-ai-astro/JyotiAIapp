/**
 * Mouse Gesture Handler
 * 
 * Phase 2 — Section 16: COSMIC INTERACTION SYSTEM
 * Cosmic Interaction System (E20)
 * 
 * Raycasting, hover zones, screen-space detection
 */

import * as THREE from 'three';
import { InteractionIntent } from '../events/interaction-events';

export interface MouseGestureState {
  position: { x: number; y: number };
  screenPosition: { x: number; y: number };
  worldPosition?: THREE.Vector3;
  isHovering: boolean;
  hoverTarget: 'guru' | 'chakra' | 'projection' | 'pulse' | 'none';
}

export class MouseGestures {
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private camera?: THREE.Camera;
  private scene?: THREE.Scene;
  
  // Screen-space zones
  private guruZone: { x: number; y: number; radius: number } = {
    x: 0.5, // Center X
    y: 0.5, // Center Y
    radius: 0.15, // 15% of screen
  };
  
  private chakraPositions: Array<{ x: number; y: number; radius: number }> = [
    { x: 0.15, y: 0.8, radius: 0.05 },  // Crown
    { x: 0.25, y: 0.7, radius: 0.05 },  // Third Eye
    { x: 0.35, y: 0.6, radius: 0.05 }, // Throat
    { x: 0.45, y: 0.5, radius: 0.05 },  // Heart
    { x: 0.55, y: 0.4, radius: 0.05 },  // Solar Plexus
    { x: 0.65, y: 0.3, radius: 0.05 },  // Sacral
    { x: 0.75, y: 0.2, radius: 0.05 },  // Root
  ];
  
  private pulseIndicatorZone: { x: number; y: number; radius: number } = {
    x: 0.5,
    y: 0.5,
    radius: 0.1,
  };
  
  private projectionZone: { x: number; y: number; radius: number } = {
    x: 0.5,
    y: 0.3,
    radius: 0.2,
  };

  constructor() {
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
  }

  /**
   * Set camera and scene for raycasting
   */
  setCameraAndScene(camera: THREE.Camera, scene: THREE.Scene): void {
    this.camera = camera;
    this.scene = scene;
  }

  /**
   * Raycast against GuruEnergy
   */
  raycastGuru(
    screenX: number,
    screenY: number,
    width: number,
    height: number
  ): { hit: boolean; worldPosition?: THREE.Vector3 } {
    if (!this.camera || !this.scene) {
      return { hit: false };
    }
    
    // Convert screen coordinates to normalized device coordinates
    this.mouse.x = (screenX / width) * 2 - 1;
    this.mouse.y = -(screenY / height) * 2 + 1;
    
    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    // Find GuruEnergy mesh (assuming it has a specific name or can be found)
    const guruMesh = this.scene.getObjectByName('guru-energy');
    if (!guruMesh) {
      return { hit: false };
    }
    
    const intersects = this.raycaster.intersectObject(guruMesh);
    
    if (intersects.length > 0) {
      return {
        hit: true,
        worldPosition: intersects[0].point,
      };
    }
    
    return { hit: false };
  }

  /**
   * Detect hover zones (screen-space)
   */
  detectHoverZone(
    screenX: number,
    screenY: number,
    width: number,
    height: number
  ): 'guru' | 'chakra' | 'projection' | 'pulse' | 'none' {
    // Normalize to 0-1
    const normalizedX = screenX / width;
    const normalizedY = screenY / height;
    
    // Check guru zone
    const distToGuru = Math.sqrt(
      Math.pow(normalizedX - this.guruZone.x, 2) +
      Math.pow(normalizedY - this.guruZone.y, 2)
    );
    if (distToGuru < this.guruZone.radius) {
      return 'guru';
    }
    
    // Check chakra rings
    for (const chakra of this.chakraPositions) {
      const dist = Math.sqrt(
        Math.pow(normalizedX - chakra.x, 2) +
        Math.pow(normalizedY - chakra.y, 2)
      );
      if (dist < chakra.radius) {
        return 'chakra';
      }
    }
    
    // Check pulse indicator
    const distToPulse = Math.sqrt(
      Math.pow(normalizedX - this.pulseIndicatorZone.x, 2) +
      Math.pow(normalizedY - this.pulseIndicatorZone.y, 2)
    );
    if (distToPulse < this.pulseIndicatorZone.radius) {
      return 'pulse';
    }
    
    // Check projection zone
    const distToProjection = Math.sqrt(
      Math.pow(normalizedX - this.projectionZone.x, 2) +
      Math.pow(normalizedY - this.projectionZone.y, 2)
    );
    if (distToProjection < this.projectionZone.radius) {
      return 'projection';
    }
    
    return 'none';
  }

  /**
   * UI Raymarch ring detection using screen UV
   */
  detectChakraRing(
    screenX: number,
    screenY: number,
    width: number,
    height: number
  ): { index: number; distance: number } | null {
    const normalizedX = screenX / width;
    const normalizedY = screenY / height;
    
    for (let i = 0; i < this.chakraPositions.length; i++) {
      const chakra = this.chakraPositions[i];
      const dist = Math.sqrt(
        Math.pow(normalizedX - chakra.x, 2) +
        Math.pow(normalizedY - chakra.y, 2)
      );
      if (dist < chakra.radius) {
        return { index: i, distance: dist };
      }
    }
    
    return null;
  }

  /**
   * Detect pulse indicator click
   */
  detectPulseIndicator(
    screenX: number,
    screenY: number,
    width: number,
    height: number
  ): boolean {
    const normalizedX = screenX / width;
    const normalizedY = screenY / height;
    
    const dist = Math.sqrt(
      Math.pow(normalizedX - this.pulseIndicatorZone.x, 2) +
      Math.pow(normalizedY - this.pulseIndicatorZone.y, 2)
    );
    
    return dist < this.pulseIndicatorZone.radius;
  }

  /**
   * Process mouse input
   */
  processMouse(
    screenX: number,
    screenY: number,
    width: number,
    height: number,
    isClick: boolean = false
  ): InteractionIntent {
    const hoverTarget = this.detectHoverZone(screenX, screenY, width, height);
    
    // Try raycasting for 3D detection
    const raycastResult = this.raycastGuru(screenX, screenY, width, height);
    
    const screenPosition = {
      x: screenX / width,
      y: screenY / height,
    };
    
    return {
      type: isClick ? 'click' : 'hover',
      target: hoverTarget,
      position: { x: screenX, y: screenY },
      screenPosition,
      worldPosition: raycastResult.worldPosition,
      intensity: hoverTarget !== 'none' ? 1.0 : 0.0,
      metadata: {
        raycastHit: raycastResult.hit,
        chakraRing: this.detectChakraRing(screenX, screenY, width, height),
        pulseIndicator: this.detectPulseIndicator(screenX, screenY, width, height),
      },
    };
  }
}

