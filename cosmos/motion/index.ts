/**
 * MOTION ORCHESTRATION ENGINE (E14)
 * 
 * Phase 2 — Section 7: Page Transition & Scene Orchestration Engine
 * Phase 2 — Section 10: SCROLL INTERACTION ENGINE v1.0
 * 
 * Complete motion orchestration system exports
 */

// Main engine
export * from './motion-engine';

// Timeline
export { Timeline } from './timeline';
export type { TimelineConfig, TimelineMode, Keyframe } from './timeline';

// Easing
export * from './easing';
export type { EasingFunction } from './easing';

// Frame loop
export { frameLoop } from './frame-loop';
export type { FrameData, FrameCallback } from './frame-loop';

// Scroll motion
export { ScrollMotion } from './scroll-motion';
export type { ScrollMotionData } from './scroll-motion';

// Audio motion
export { AudioMotion } from './audio-motion';
export type { AudioMotionData } from './audio-motion';

// Motion sync
export { MotionSync } from './motion-sync';
export type { MotionState } from './motion-sync';

// Orchestrator
export { motionOrchestrator } from './orchestrator';
export type { EngineUpdateFunction, RegisteredEngine } from './orchestrator';

