/**
 * Prana Field Vertex Shader
 * 
 * Phase 2 — Section 18: PRANA FIELD ENGINE
 * Prana Field Engine (E22)
 * 
 * Breath-driven scale, scroll-driven elevation, audio-driven displacement, parallax wobble, fbm distortion
 */

export const pranaVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;

uniform float uTime;
uniform float uBreathPhase;
uniform float uBreathStrength;
uniform float uScroll;
uniform float uBass;
uniform float uMid;
uniform float uHigh;
uniform vec2 uMouse;
uniform float uIntensity;
uniform float uParallaxStrength;

varying vec2 vUv;
varying vec3 vPosition;
varying float vDistance;
varying float vRadialDistance;

// Noise functions
float hash(float n) {
  return fract(sin(n) * 43758.5453123);
}

float hash2(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(float x) {
  float i = floor(x);
  float f = fract(x);
  return mix(hash(i), hash(i + 1.0), smoothstep(0.0, 1.0, f));
}

float noise2(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash2(i);
  float b = hash2(i + vec2(1.0, 0.0));
  float c = hash2(i + vec2(0.0, 1.0));
  float d = hash2(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 3; i++) {
    value += amplitude * noise2(p);
    p *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vUv = uv;
  vec3 pos = position;
  
  // Radial distance from center
  vec2 center = vec2(0.5, 0.5);
  vec2 toCenter = uv - center;
  vRadialDistance = length(toCenter);
  
  // ============================================
  // BREATH-DRIVEN SCALE
  // ============================================
  // 1.0 + uBreathStrength * 0.2
  float breathScale = 1.0 + uBreathStrength * 0.2;
  pos *= breathScale;
  
  // ============================================
  // SCROLL-DRIVEN ELEVATION
  // ============================================
  // pos.y += uScroll * 1.0
  pos.y += uScroll * 1.0;
  
  // ============================================
  // AUDIO-DRIVEN DISPLACEMENT
  // ============================================
  // sin(uv * 10 + time * 2) * uBass * 0.05
  float audioDisplacement = sin(dot(uv, vec2(10.0)) + uTime * 2.0) * uBass * 0.05;
  pos.z += audioDisplacement;
  
  // ============================================
  // PARALLAX WOBBLE FROM MOUSE
  // ============================================
  float wobbleX = sin(uTime * 0.3 + pos.x * 0.1) * uMouse.x * 0.02;
  float wobbleY = cos(uTime * 0.3 + pos.y * 0.1) * uMouse.y * 0.02;
  pos.xy += vec2(wobbleX, wobbleY) * uParallaxStrength;
  
  // ============================================
  // FBM-BASED DISTORTION FOR PRANIC TURBULENCE
  // ============================================
  float turbulence = fbm(pos.xy * 0.5 + uTime * 0.2) * uMid * 0.1;
  pos.xy += vec2(turbulence);
  
  vPosition = pos;
  vDistance = length(pos);
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

