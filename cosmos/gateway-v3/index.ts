/**
 * GATEWAY ENGINE v3 (E60)
 * 
 * Phase 2 — Section 56: GATEWAY ENGINE v3
 * 
 * Complete Gateway v3 system exports
 */

// Main component
export { GatewayV3 } from './gateway';
export type { GatewayV3Props } from './gateway';

// Engine
export { GatewayEngine } from './gateway-engine';
export type { GatewayEngineConfig, OuterRingData, GlyphData, SpiralThreadData, RayData } from './gateway-engine';

// Hooks
export { useGatewayMotion } from './hooks/use-gateway-motion';
export type { GatewayMotionState } from './hooks/use-gateway-motion';

export { useGatewayUniforms } from './hooks/use-gateway-uniforms';
export type { GatewayUniforms } from './hooks/use-gateway-uniforms';

// Shaders
export { gatewayVertexShader } from './shaders/gateway-vertex';
export { gatewayFragmentShader } from './shaders/gateway-fragment';

