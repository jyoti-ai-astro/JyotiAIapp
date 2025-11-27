/**
 * TIMELINE STREAM ENGINE (E27)
 * 
 * Phase 2 — Section 23: COSMIC TIMELINE STREAM ENGINE
 * 
 * Complete Timeline Stream system exports
 */

// Main component
export { TimelineStream } from './timeline-stream';
export type { TimelineStreamProps } from './timeline-stream';

// Engine
export { TimelineStreamEngine } from './timeline-stream-engine';
export type { TimelineStreamEngineConfig, ParticleData, RibbonData, LineData } from './timeline-stream-engine';

// Hooks
export { useTimelineMotion } from './hooks/use-timeline-motion';
export type { TimelineMotionState } from './hooks/use-timeline-motion';

export { useTimelineUniforms } from './hooks/use-timeline-uniforms';
export type { TimelineUniforms } from './hooks/use-timeline-uniforms';

// Shaders
export { timelineVertexShader } from './shaders/timeline-vertex';
export { timelineFragmentShader } from './shaders/timeline-fragment';

