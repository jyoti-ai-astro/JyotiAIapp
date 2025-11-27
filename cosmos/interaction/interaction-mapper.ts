/**
 * Interaction Mapper
 * 
 * Phase 2 — Section 16: COSMIC INTERACTION SYSTEM
 * Cosmic Interaction System (E20)
 * 
 * Maps raw input (mouse/touch/scroll) → semantic events
 */

import { InteractionIntent } from './events/interaction-events';
import { ScrollGestures } from './gestures/scroll-gestures';
import { MouseGestures } from './gestures/mouse-gestures';
import { TouchGestures } from './gestures/touch-gestures';
import * as THREE from 'three';

export interface RawInput {
  type: 'mouse' | 'touch' | 'scroll' | 'wheel';
  x?: number;
  y?: number;
  deltaX?: number;
  deltaY?: number;
  deltaZ?: number;
  button?: number;
  touches?: TouchList;
  scrollProgress?: number;
  timestamp: number;
}

export class InteractionMapper {
  private scrollGestures: ScrollGestures;
  private mouseGestures: MouseGestures;
  private touchGestures: TouchGestures;
  private screenWidth: number = 1920;
  private screenHeight: number = 1080;
  private lastUpdateTime: number = Date.now();

  constructor() {
    this.scrollGestures = new ScrollGestures();
    this.mouseGestures = new MouseGestures();
    this.touchGestures = new TouchGestures();
  }

  /**
   * Set screen dimensions
   */
  setScreenSize(width: number, height: number): void {
    this.screenWidth = width;
    this.screenHeight = height;
  }

  /**
   * Set camera and scene for raycasting
   */
  setCameraAndScene(camera: THREE.Camera, scene: THREE.Scene): void {
    this.mouseGestures.setCameraAndScene(camera, scene);
    this.touchGestures.setCameraAndScene(camera, scene);
  }

  /**
   * Map raw input to semantic events
   */
  mapInput(input: RawInput): InteractionIntent | null {
    const deltaTime = (input.timestamp - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = input.timestamp;
    
    switch (input.type) {
      case 'mouse':
        if (input.x !== undefined && input.y !== undefined) {
          return this.mouseGestures.processMouse(
            input.x,
            input.y,
            this.screenWidth,
            this.screenHeight,
            input.button === 0 // Left click
          );
        }
        break;
        
      case 'touch':
        if (input.touches) {
          if (input.touches.length === 0) {
            return this.touchGestures.processTouchEnd(
              input.touches,
              this.screenWidth,
              this.screenHeight
            );
          } else if (input.touches.length === 1) {
            const touch = input.touches[0];
            // Determine if this is start, move, or end based on touch state
            // For simplicity, we'll use move for active touches
            return this.touchGestures.processTouchMove(
              input.touches,
              this.screenWidth,
              this.screenHeight
            );
          }
        }
        break;
        
      case 'scroll':
      case 'wheel':
        if (input.scrollProgress !== undefined) {
          return this.scrollGestures.processScroll(
            input.scrollProgress,
            deltaTime,
            { x: input.x || 0, y: input.y || 0 }
          );
        }
        break;
    }
    
    return null;
  }

  /**
   * Get scroll zones
   */
  getScrollZones(scrollProgress: number) {
    return this.scrollGestures.computeScrollZones(scrollProgress);
  }

  /**
   * Get current scroll zone
   */
  getCurrentScrollZone(scrollProgress: number): number {
    return this.scrollGestures.getCurrentZone(scrollProgress);
  }
}

