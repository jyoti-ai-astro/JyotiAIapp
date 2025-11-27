/**
 * COSMIC CAMERA SYSTEM (E18)
 * 
 * Phase 2 — Section 10: SCROLL INTERACTION ENGINE v1.0
 * Phase 2 — Section 12: PERFORMANCE, FALLBACKS & MOBILE STRATEGY v1.0
 * 
 * Complete Cosmic Camera system exports
 */

// Main component
export { CameraController } from './camera-controller';
export type { CameraControllerProps, CameraControllerRef } from './camera-controller';

// Engine
export { CameraEngine } from './camera-engine';
export type { CameraMode, CameraState, CameraConfig } from './camera-engine';

// Hooks
export { useCameraMotion } from './hooks/use-camera-motion';
export { useCameraUniforms } from './hooks/use-camera-uniforms';
export type { CameraUniforms } from './hooks/use-camera-uniforms';

