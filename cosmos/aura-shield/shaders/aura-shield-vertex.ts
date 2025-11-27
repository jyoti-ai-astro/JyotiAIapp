/**
 * Aura Shield Vertex Shader
 * 
 * Phase 2 — Section 19: AURA SHIELD ENGINE
 * Aura Shield Engine (E23)
 * 
 * Sphere-based geometry deformation, breath-driven expansion, audio-based micro-distortion, parallax wobble, scroll-driven vertical lift
 */

export const auraShieldVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;
attribute vec3 normal;

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
varying vec3 vNormal;
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
  vNormal = normal;
  vec3 pos = position;
  
  // Radial distance from center
  vRadialDistance = length(pos);
  
  // ============================================
  // BREATH-DRIVEN EXPANSION
  // ============================================
  // 1.0 + uBreathStrength * 0.15
  float breathScale = 1.0 + uBreathStrength * 0.15;
  pos *= breathScale;
  
  // ============================================
  // SCROLL-DRIVEN VERTICAL LIFT
  // ============================================
  pos.y += uScroll * 0.5;
  
  // ============================================
  // AUDIO-BASED MICRO-DISTORTION (sin + fbm)
  // ============================================
  // Sin-based distortion
  float sinDistortion = sin(dot(pos.xy, vec2(5.0)) + uTime * 2.0) * uBass * 0.03;
  
  // FBM-based distortion
  float fbmDistortion = fbm(pos.xy * 0.5 + uTime * 0.2) * uMid * 0.02;
  
  // Combine distortions
  pos += normal * (sinDistortion + fbmDistortion);
  
  // High-frequency shimmer
  float shimmerDistortion = fbm(pos.xy * 3.0 + uTime * 0.5) * uHigh * 0.01;
  pos += normal * shimmerDistortion;
  
  // ============================================
  // PARALLAX WOBBLE FROM MOUSE
  // ============================================
  float wobbleX = sin(uTime * 0.3 + pos.x * 0.1) * uMouse.x * 0.015;
  float wobbleY = cos(uTime * 0.3 + pos.y * 0.1) * uMouse.y * 0.015;
  pos.xy += vec2(wobbleX, wobbleY) * uParallaxStrength;
  
  vPosition = pos;
  vDistance = length(pos);
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

