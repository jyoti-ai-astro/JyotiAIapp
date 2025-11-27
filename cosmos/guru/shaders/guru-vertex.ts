/**
 * Guru Vertex Shader
 * 
 * Phase 2 — Section 11: PAGE-LEVEL WORLD COMPOSITION ENGINE v1.0
 * Phase 2 — Section 12: PERFORMANCE, FALLBACKS & MOBILE STRATEGY v1.0
 * Guru Avatar Energy System (E15)
 * 
 * Breath-driven scale, scroll-driven elevation, audio-driven oscillation, parallax wobble
 */

export const guruVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;
attribute vec3 normal;

uniform float uTime;
uniform float uBreathProgress;
uniform float uBreathStrength;
uniform float uScroll;
uniform vec2 uMouse;
uniform float uIntensity;
uniform float uParallaxStrength;
uniform float uTurbulence;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying float vDistance;
varying float vBreathPhase;

// Noise functions
float hash(float n) {
  return fract(sin(n) * 43758.5453123);
}

float noise(float x) {
  float i = floor(x);
  float f = fract(x);
  return mix(hash(i), hash(i + 1.0), smoothstep(0.0, 1.0, f));
}

float fbm(float p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 3; i++) {
    value += amplitude * noise(p);
    p *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vUv = uv;
  vNormal = normal;
  vec3 pos = position;
  
  // ============================================
  // BREATH-DRIVEN SCALE
  // ============================================
  float breathScale = 1.0 + uBreathStrength * 0.1;
  pos *= breathScale;
  
  // ============================================
  // SCROLL-DRIVEN ELEVATION
  // ============================================
  pos.y += uScroll * 1.5;
  
  // ============================================
  // AUDIO-DRIVEN MICRO-OSCILLATION
  // ============================================
  float oscillation = sin(uTime * 3.0) * uTurbulence * 0.05;
  pos += normal * oscillation;
  
  // ============================================
  // PARALLAX WOBBLE
  // ============================================
  float wobbleX = sin(uTime * 0.3 + pos.x * 0.1) * uMouse.x * 0.02;
  float wobbleY = cos(uTime * 0.3 + pos.y * 0.1) * uMouse.y * 0.02;
  pos.xy += vec2(wobbleX, wobbleY) * uParallaxStrength;
  
  // ============================================
  // TURBULENCE DISTORTION
  // ============================================
  float turbulence = fbm(pos.xy * 0.5 + uTime * 0.2) * uTurbulence * 0.1;
  pos.xy += vec2(turbulence);
  
  vPosition = pos;
  vDistance = length(pos);
  vBreathPhase = uBreathProgress;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

