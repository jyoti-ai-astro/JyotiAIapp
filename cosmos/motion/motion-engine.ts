/**
 * Motion Engine
 * 
 * Phase 2 — Section 7: Page Transition & Scene Orchestration Engine
 * Phase 2 — Section 10: SCROLL INTERACTION ENGINE v1.0
 * Motion Orchestration Engine (E14)
 * 
 * Main motion engine entry point
 */

export * from './timeline';
export * from './easing';
export * from './frame-loop';
export * from './scroll-motion';
export * from './audio-motion';
export * from './motion-sync';
export * from './orchestrator';

// Re-export for convenience
import { motionOrchestrator } from './orchestrator';
import { frameLoop } from './frame-loop';

/**
 * Get motion orchestrator instance
 */
export function getMotionOrchestrator() {
  return motionOrchestrator;
}

/**
 * Get frame loop instance
 */
export function getFrameLoop() {
  return frameLoop;
}

