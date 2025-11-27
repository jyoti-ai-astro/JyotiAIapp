/**
 * DYNAMIC AVATAR FACE ENGINE (E21)
 * 
 * Phase 2 — Section 17: DYNAMIC AVATAR FACE ENGINE
 * 
 * Complete Dynamic Avatar Face system exports
 */

// Main component
export { Face } from './face';
export type { FaceProps, FaceRef } from './face';

// Engine
export { FaceEngine } from './face-engine';
export type { FaceEngineConfig } from './face-engine';

// Expressions
export { FaceExpressions } from './face-expressions';
export type { ExpressionName, ExpressionParams, Expression } from './face-expressions';

// Hooks
export { useFaceSync } from './hooks/use-face-sync';
export type { FaceSyncState } from './hooks/use-face-sync';

export { useFaceUniforms } from './hooks/use-face-uniforms';
export type { FaceUniforms } from './hooks/use-face-uniforms';

// Shaders
export { faceVertexShader } from './shaders/face-vertex';
export { faceFragmentShader } from './shaders/face-fragment';

