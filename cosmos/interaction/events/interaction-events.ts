/**
 * Interaction Events
 * 
 * Phase 2 — Section 16: COSMIC INTERACTION SYSTEM
 * Cosmic Interaction System (E20)
 * 
 * Event types and interfaces for interaction system
 */

import * as THREE from 'three';

export type InteractionEventType =
  | 'guru-hover'
  | 'guru-hover-exit'
  | 'guru-click'
  | 'blessing-wave-trigger'
  | 'scroll-depth-zone-enter'
  | 'scroll-depth-zone-exit'
  | 'chakra-hover'
  | 'chakra-hover-exit'
  | 'chakra-click'
  | 'pulse-indicator-click'
  | 'projection-hover'
  | 'projection-hover-exit'
  | 'projection-click';

export interface InteractionEvent {
  type: InteractionEventType;
  timestamp: number;
  position?: { x: number; y: number };
  target?: string;
  data?: any;
}

export interface InteractionIntent {
  type: 'hover' | 'click' | 'scroll' | 'touch';
  target: 'guru' | 'chakra' | 'projection' | 'pulse' | 'none';
  position: { x: number; y: number };
  screenPosition: { x: number; y: number };
  worldPosition?: THREE.Vector3;
  intensity: number;
  metadata?: Record<string, any>;
}

export interface InteractionState {
  isGuruHovered: boolean;
  isChakraHovered: boolean;
  isProjectionHovered: boolean;
  hasBlessingIntent: boolean;
  currentScrollZone: number;
  cursorState: 'normal' | 'hover-guru' | 'hover-chakra' | 'hover-projection';
  lastInteractionTime: number;
  interactionVelocity: { x: number; y: number };
}

export type InteractionCallback = (event: InteractionEvent) => void;

