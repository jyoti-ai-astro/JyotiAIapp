/**
 * Energy Ribbon Vertex Shader
 * 
 * Phase 2 — Section 5 Extension: ENERGY RIBBON ENGINE (E5)
 * 
 * Creates dual serpentine paths with:
 * - Sinusoidal x-displacement
 * - Noise-based y-rotation (twist)
 * - Scroll-driven upward drift
 * - Bass-reactive thickness
 */

export const ribbonVertexShader = `
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
uniform float uParallaxStrength;

varying float vNoise;
varying float vPos;
varying vec2 vUv;

// FBM Noise
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
  vec3 pos = position;
  vUv = uv;
  
  float t = uTime * 0.4;
  
  // ============================================
  // SERPENTINE X MOTION (Sinusoidal displacement)
  // ============================================
  float snake = sin(pos.y * 2.0 + t * 2.5) * 0.25;
  
  // uHigh increases serpentine frequency
  snake += sin(pos.y * 2.0 * (1.0 + uHigh * 0.3) + t * 2.5) * 0.1;
  
  // ============================================
  // NOISE TWIST (Y-rotation)
  // ============================================
  float twist = fbm(pos.y * 0.5 + t) * 0.15;
  
  // uMid increases turbulence
  twist *= (1.0 + uMid * 0.4);
  
  // ============================================
  // SCROLL LIFT (Upward drift)
  // ============================================
  pos.y += uScroll * 5.0;
  
  // ============================================
  // BASS THICKNESS EFFECT
  // ============================================
  float thickness = 1.0 + uBass * 0.5;
  pos.x += (snake + twist) * thickness;
  
  // ============================================
  // PARALLAX FROM MOUSE
  // ============================================
  pos.xy += uMouse.xy * 0.05 * uParallaxStrength;
  
  // ============================================
  // PASSING VARYINGS
  // ============================================
  vNoise = twist;
  vPos = pos.y;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

