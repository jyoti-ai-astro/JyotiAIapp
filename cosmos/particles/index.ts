/**
 * COSMOS PARTICLES - Particle System Components
 * 
 * Phase 2 — Section 4: PARTICLE UNIVERSE ENGINE
 * 
 * Complete particle system exports:
 * - Base particle system utilities
 * - 4-layer particle architecture
 * - Unified ParticleUniverse component
 */

// Base system
export * from './particle-system';

// Individual layers
export * from './starfield-layer';
export * from './energy-particles';
export * from './dust-particles';
export * from './orbital-particles';

// Unified engine
export * from './particle-universe';

// Legacy (kept for compatibility)
export * from './star-particles';
