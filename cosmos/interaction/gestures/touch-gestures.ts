/**
 * Touch Gesture Handler
 * 
 * Phase 2 — Section 16: COSMIC INTERACTION SYSTEM
 * Cosmic Interaction System (E20)
 * 
 * Touch-based equivalents of mouse gestures
 */

import { InteractionIntent } from '../events/interaction-events';
import { MouseGestures } from './mouse-gestures';

export interface TouchGestureState {
  touches: Array<{ x: number; y: number; id: number }>;
  isTouching: boolean;
  touchStartTime: number;
  touchDuration: number;
  isHold: boolean;
  isDrag: boolean;
  dragDistance: number;
}

export class TouchGestures extends MouseGestures {
  private touchState: TouchGestureState = {
    touches: [],
    isTouching: false,
    touchStartTime: 0,
    touchDuration: 0,
    isHold: false,
    isDrag: false,
    dragDistance: 0,
  };
  
  private holdThreshold: number = 500; // ms
  private dragThreshold: number = 10; // pixels

  /**
   * Process touch start
   */
  processTouchStart(
    touches: TouchList,
    width: number,
    height: number
  ): InteractionIntent {
    const touch = touches[0];
    const screenX = touch.clientX;
    const screenY = touch.clientY;
    
    this.touchState = {
      touches: Array.from(touches).map(t => ({
        x: t.clientX,
        y: t.clientY,
        id: t.identifier,
      })),
      isTouching: true,
      touchStartTime: Date.now(),
      touchDuration: 0,
      isHold: false,
      isDrag: false,
      dragDistance: 0,
    };
    
    // Use mouse gesture detection for touch
    return this.processMouse(screenX, screenY, width, height, false);
  }

  /**
   * Process touch move
   */
  processTouchMove(
    touches: TouchList,
    width: number,
    height: number
  ): InteractionIntent {
    if (!this.touchState.isTouching) {
      return this.processTouchStart(touches, width, height);
    }
    
    const touch = touches[0];
    const screenX = touch.clientX;
    const screenY = touch.clientY;
    
    const firstTouch = this.touchState.touches[0];
    const dragDistance = Math.sqrt(
      Math.pow(screenX - firstTouch.x, 2) +
      Math.pow(screenY - firstTouch.y, 2)
    );
    
    this.touchState.dragDistance = dragDistance;
    this.touchState.isDrag = dragDistance > this.dragThreshold;
    
    // Use mouse gesture detection for touch
    return this.processMouse(screenX, screenY, width, height, false);
  }

  /**
   * Process touch end
   */
  processTouchEnd(
    touches: TouchList,
    width: number,
    height: number
  ): InteractionIntent | null {
    if (!this.touchState.isTouching) {
      return null;
    }
    
    const touchDuration = Date.now() - this.touchState.touchStartTime;
    const isHold = touchDuration > this.holdThreshold;
    const isClick = !this.touchState.isDrag && !isHold;
    
    if (touches.length > 0) {
      const touch = touches[0];
      const screenX = touch.clientX;
      const screenY = touch.clientY;
      
      this.touchState.isTouching = false;
      
      if (isClick) {
        // Process as click
        return this.processMouse(screenX, screenY, width, height, true);
      }
    }
    
    this.touchState.isTouching = false;
    return null;
  }

  /**
   * Process touch cancel
   */
  processTouchCancel(): void {
    this.touchState.isTouching = false;
  }
}

