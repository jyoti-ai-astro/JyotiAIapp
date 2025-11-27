/**
 * QUANTUM HALO ENGINE (E52)
 * 
 * Phase 2 — Section 48: QUANTUM HALO ENGINE
 * 
 * Complete Quantum Halo system exports
 */

// Main component
export { QuantumHalo } from './quantum-halo';
export type { QuantumHaloProps } from './quantum-halo';

// Engine
export { QuantumHaloEngine } from './quantum-halo-engine';
export type { QuantumHaloEngineConfig, PrimaryRingData, EchoRingData, SparkData } from './quantum-halo-engine';

// Hooks
export { useQuantumHaloMotion } from './hooks/use-quantum-halo-motion';
export type { QuantumHaloMotionState } from './hooks/use-quantum-halo-motion';

export { useQuantumHaloUniforms } from './hooks/use-quantum-halo-uniforms';
export type { QuantumHaloUniforms } from './hooks/use-quantum-halo-uniforms';

// Shaders
export { quantumHaloVertexShader } from './shaders/quantum-halo-vertex';
export { quantumHaloFragmentShader } from './shaders/quantum-halo-fragment';

