/**
 * COSMIC INTERACTION SYSTEM (E20)
 * 
 * Phase 2 — Section 16: COSMIC INTERACTION SYSTEM
 * 
 * Complete Cosmic Interaction system exports
 */

// Main engine
export { InteractionEngine } from './interaction-engine';
export { InteractionMapper } from './interaction-mapper';

// Gesture handlers
export { ScrollGestures } from './gestures/scroll-gestures';
export type { ScrollZone, ScrollGestureState } from './gestures/scroll-gestures';

export { MouseGestures } from './gestures/mouse-gestures';
export type { MouseGestureState } from './gestures/mouse-gestures';

export { TouchGestures } from './gestures/touch-gestures';
export type { TouchGestureState } from './gestures/touch-gestures';

export { GuruGestures } from './gestures/guru-gestures';
export type { GuruGestureState } from './gestures/guru-gestures';

// Events
export * from './events/interaction-events';

// Hooks
export { useInteraction } from './hooks/use-interaction';
export type { UseInteractionOptions } from './hooks/use-interaction';

