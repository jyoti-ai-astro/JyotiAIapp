/**
 * Guru Gesture Handler
 * 
 * Phase 2 — Section 16: COSMIC INTERACTION SYSTEM
 * Cosmic Interaction System (E20)
 * 
 * Guru-specific gesture handling
 */

import { InteractionIntent, InteractionEvent } from '../events/interaction-events';

export interface GuruGestureState {
  isHovered: boolean;
  hoverStartTime: number;
  hoverDuration: number;
  clickCount: number;
  lastClickTime: number;
}

export class GuruGestures {
  private state: GuruGestureState = {
    isHovered: false,
    hoverStartTime: 0,
    hoverDuration: 0,
    clickCount: 0,
    lastClickTime: 0,
  };
  
  private doubleClickThreshold: number = 300; // ms

  /**
   * Guru hover → eye-open animation
   */
  processGuruHover(intent: InteractionIntent): InteractionEvent | null {
    if (intent.target !== 'guru') {
      if (this.state.isHovered) {
        // Exit hover
        this.state.isHovered = false;
        return {
          type: 'guru-hover-exit',
          timestamp: Date.now(),
          position: intent.position,
        };
      }
      return null;
    }
    
    if (!this.state.isHovered) {
      // Enter hover
      this.state.isHovered = true;
      this.state.hoverStartTime = Date.now();
      return {
        type: 'guru-hover',
        timestamp: Date.now(),
        position: intent.position,
        screenPosition: intent.screenPosition,
      };
    }
    
    // Update hover duration
    this.state.hoverDuration = Date.now() - this.state.hoverStartTime;
    return null;
  }

  /**
   * Guru click → blessing wave trigger
   */
  processGuruClick(intent: InteractionIntent): InteractionEvent[] {
    const now = Date.now();
    const timeSinceLastClick = now - this.state.lastClickTime;
    
    if (timeSinceLastClick < this.doubleClickThreshold) {
      this.state.clickCount++;
    } else {
      this.state.clickCount = 1;
    }
    
    this.state.lastClickTime = now;
    
    const events: InteractionEvent[] = [
      {
        type: 'guru-click',
        timestamp: now,
        position: intent.position,
        screenPosition: intent.screenPosition,
        data: {
          clickCount: this.state.clickCount,
        },
      },
    ];
    
    // Always trigger blessing wave on guru click
    events.push({
      type: 'blessing-wave-trigger',
      timestamp: now,
      position: intent.position,
      data: {
        source: 'guru-click',
        clickCount: this.state.clickCount,
      },
    });
    
    return events;
  }

  /**
   * Guru click → camera focus (E18)
   */
  getCameraFocusIntent(intent: InteractionIntent): {
    shouldFocus: boolean;
    target?: { x: number; y: number; z: number };
  } {
    if (intent.target === 'guru' && intent.type === 'click') {
      return {
        shouldFocus: true,
        target: { x: 0, y: 0, z: -1.7 }, // Guru position
      };
    }
    
    return { shouldFocus: false };
  }

  /**
   * Guru click → pulse indicator highlight
   */
  getPulseIndicatorIntent(intent: InteractionIntent): {
    shouldHighlight: boolean;
    intensity: number;
  } {
    if (intent.target === 'guru' && intent.type === 'click') {
      return {
        shouldHighlight: true,
        intensity: 1.0,
      };
    }
    
    return { shouldHighlight: false, intensity: 0.0 };
  }

  /**
   * Get current guru state
   */
  getState(): GuruGestureState {
    return { ...this.state };
  }
}

