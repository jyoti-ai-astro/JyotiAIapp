/**
 * Chakra Ring Vertex Shader
 * 
 * Phase 2 — Section 5: KUNDALINI ENERGY WAVE SYSTEM
 * Chakra Glow Rings Engine (E6)
 * 
 * Creates ring geometry with:
 * - Pulse animation
 * - Bass-driven expansion
 * - Parallax motion
 * - Scroll-reactive intensity
 */

export const chakraVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;

uniform float uTime;
uniform float uBass;
uniform float uMid;
uniform float uHigh;
uniform float uScroll;
uniform vec2 uMouse;
uniform float uIntensity;
uniform float uChakraPulse;
uniform float uParallaxStrength;
uniform float uRingRadius;
uniform float uRingY;

varying vec2 vUv;
varying vec3 vPosition;
varying float vDistance;
varying float vPulse;

void main() {
  vUv = uv;
  vec3 pos = position;
  
  // ============================================
  // RING POSITION (Vertical alignment)
  // ============================================
  pos.y = uRingY;
  
  // ============================================
  // PULSE ANIMATION
  // ============================================
  float pulse = sin(uTime * 2.0 + uChakraPulse * 3.14159) * 0.5 + 0.5;
  vPulse = pulse;
  
  // ============================================
  // BASS-DRIVEN EXPANSION
  // ============================================
  float expansion = 1.0 + uBass * 0.3;
  float radius = uRingRadius * expansion;
  
  // Apply pulse to radius
  radius *= (1.0 + pulse * 0.1);
  
  // ============================================
  // RING SHAPE (Torus/ring geometry)
  // ============================================
  // Convert UV to ring coordinates
  float angle = uv.x * 3.14159 * 2.0;
  float ringWidth = 0.3;  // Ring thickness
  
  // Create ring from plane geometry
  float innerRadius = radius - ringWidth * 0.5;
  float outerRadius = radius + ringWidth * 0.5;
  float currentRadius = mix(innerRadius, outerRadius, uv.y);
  
  pos.x = cos(angle) * currentRadius;
  pos.z = sin(angle) * currentRadius;
  
  // ============================================
  // PARALLAX MOTION
  // ============================================
  pos.xy += uMouse.xy * 0.05 * uParallaxStrength;
  
  // ============================================
  // SCROLL-REACTIVE INTENSITY (affects position)
  // ============================================
  pos.y += uScroll * 2.0;
  
  // ============================================
  // MID FREQUENCY TURBULENCE
  // ============================================
  float turbulence = sin(uTime * 3.0 + angle * 2.0) * uMid * 0.1;
  pos.x += turbulence;
  pos.z += turbulence;
  
  vPosition = pos;
  vDistance = length(pos);
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

