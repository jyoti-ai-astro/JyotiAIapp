/**
 * Interaction Engine
 * 
 * Phase 2 — Section 16: COSMIC INTERACTION SYSTEM
 * Cosmic Interaction System (E20)
 * 
 * Central interaction bus
 */

import { InteractionEvent, InteractionIntent, InteractionState, InteractionCallback } from './events/interaction-events';
import { InteractionMapper } from './interaction-mapper';
import { GuruGestures } from './gestures/guru-gestures';
import { ScrollGestures } from './gestures/scroll-gestures';
import { motionOrchestrator } from '../motion/orchestrator';

export class InteractionEngine {
  private mapper: InteractionMapper;
  private guruGestures: GuruGestures;
  private scrollGestures: ScrollGestures;
  private callbacks: Map<InteractionEvent['type'], Set<InteractionCallback>> = new Map();
  private state: InteractionState = {
    isGuruHovered: false,
    isChakraHovered: false,
    isProjectionHovered: false,
    hasBlessingIntent: false,
    currentScrollZone: 0,
    cursorState: 'normal',
    lastInteractionTime: 0,
    interactionVelocity: { x: 0, y: 0 },
  };
  private previousIntent: InteractionIntent | null = null;

  constructor() {
    this.mapper = new InteractionMapper();
    this.guruGestures = new GuruGestures();
    this.scrollGestures = new ScrollGestures();
  }

  /**
   * Register callback for interaction event
   */
  on(eventType: InteractionEvent['type'], callback: InteractionCallback): () => void {
    if (!this.callbacks.has(eventType)) {
      this.callbacks.set(eventType, new Set());
    }
    this.callbacks.get(eventType)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.callbacks.get(eventType)?.delete(callback);
    };
  }

  /**
   * Emit interaction event
   */
  private emit(event: InteractionEvent): void {
    const callbacks = this.callbacks.get(event.type);
    if (callbacks) {
      callbacks.forEach(callback => callback(event));
    }
  }

  /**
   * Process interaction intent
   */
  processIntent(intent: InteractionIntent): void {
    this.state.lastInteractionTime = Date.now();
    
    // Update cursor state
    if (intent.target === 'guru') {
      this.state.cursorState = 'hover-guru';
    } else if (intent.target === 'chakra') {
      this.state.cursorState = 'hover-chakra';
    } else if (intent.target === 'projection') {
      this.state.cursorState = 'hover-projection';
    } else {
      this.state.cursorState = 'normal';
    }
    
    // Process guru gestures
    if (intent.target === 'guru') {
      if (intent.type === 'hover') {
        const hoverEvent = this.guruGestures.processGuruHover(intent);
        if (hoverEvent) {
          this.emit(hoverEvent);
          this.state.isGuruHovered = hoverEvent.type === 'guru-hover';
        }
      } else if (intent.type === 'click') {
        const clickEvents = this.guruGestures.processGuruClick(intent);
        clickEvents.forEach(event => {
          this.emit(event);
          if (event.type === 'blessing-wave-trigger') {
            this.state.hasBlessingIntent = true;
          }
        });
      }
    } else {
      // Exit guru hover
      if (this.state.isGuruHovered) {
        this.emit({
          type: 'guru-hover-exit',
          timestamp: Date.now(),
          position: intent.position,
        });
        this.state.isGuruHovered = false;
      }
    }
    
    // Process chakra interactions
    if (intent.target === 'chakra') {
      if (intent.type === 'hover') {
        if (!this.state.isChakraHovered) {
          this.emit({
            type: 'chakra-hover',
            timestamp: Date.now(),
            position: intent.position,
            data: intent.metadata?.chakraRing,
          });
          this.state.isChakraHovered = true;
        }
      } else if (intent.type === 'click') {
        this.emit({
          type: 'chakra-click',
          timestamp: Date.now(),
          position: intent.position,
          data: intent.metadata?.chakraRing,
        });
      }
    } else {
      if (this.state.isChakraHovered) {
        this.emit({
          type: 'chakra-hover-exit',
          timestamp: Date.now(),
        });
        this.state.isChakraHovered = false;
      }
    }
    
    // Process projection interactions
    if (intent.target === 'projection') {
      if (intent.type === 'hover') {
        if (!this.state.isProjectionHovered) {
          this.emit({
            type: 'projection-hover',
            timestamp: Date.now(),
            position: intent.position,
          });
          this.state.isProjectionHovered = true;
        }
      } else if (intent.type === 'click') {
        this.emit({
          type: 'projection-click',
          timestamp: Date.now(),
          position: intent.position,
        });
      }
    } else {
      if (this.state.isProjectionHovered) {
        this.emit({
          type: 'projection-hover-exit',
          timestamp: Date.now(),
        });
        this.state.isProjectionHovered = false;
      }
    }
    
    // Process pulse indicator
    if (intent.target === 'pulse' && intent.type === 'click') {
      this.emit({
        type: 'pulse-indicator-click',
        timestamp: Date.now(),
        position: intent.position,
      });
    }
    
    // Process scroll zones
    if (intent.type === 'scroll' && intent.metadata) {
      const currentZone = intent.metadata.currentZone as number;
      const previousZone = intent.metadata.previousZone as number;
      const zoneEntered = intent.metadata.zoneEntered as number | null;
      const zoneExited = intent.metadata.zoneExited as number | null;
      
      if (zoneEntered !== null) {
        this.emit({
          type: 'scroll-depth-zone-enter',
          timestamp: Date.now(),
          data: { zone: zoneEntered },
        });
      }
      
      if (zoneExited !== null) {
        this.emit({
          type: 'scroll-depth-zone-exit',
          timestamp: Date.now(),
          data: { zone: zoneExited },
        });
      }
      
      this.state.currentScrollZone = currentZone;
    }
    
    // Update interaction velocity
    if (this.previousIntent) {
      const deltaTime = (Date.now() - this.previousIntent.metadata?.timestamp || 0) / 1000;
      if (deltaTime > 0) {
        this.state.interactionVelocity = {
          x: (intent.position.x - this.previousIntent.position.x) / deltaTime,
          y: (intent.position.y - this.previousIntent.position.y) / deltaTime,
        };
      }
    }
    
    this.previousIntent = intent;
    
    // Inject interaction state into Motion Orchestrator
    motionOrchestrator.setInteractionState({
      isGuruHovered: this.state.isGuruHovered,
      isChakraHovered: this.state.isChakraHovered,
      isProjectionHovered: this.state.isProjectionHovered,
      hasBlessingIntent: this.state.hasBlessingIntent,
    });
  }

  /**
   * Frame-based update system
   */
  update(deltaTime: number): void {
    // Reset blessing intent after frame
    if (this.state.hasBlessingIntent) {
      this.state.hasBlessingIntent = false;
    }
  }

  /**
   * Get interaction mapper
   */
  getMapper(): InteractionMapper {
    return this.mapper;
  }

  /**
   * Get current interaction state
   */
  getState(): InteractionState {
    return { ...this.state };
  }

  /**
   * Trigger blessing wave manually
   */
  triggerBlessingWave(): void {
    this.emit({
      type: 'blessing-wave-trigger',
      timestamp: Date.now(),
    });
    this.state.hasBlessingIntent = true;
  }
}

