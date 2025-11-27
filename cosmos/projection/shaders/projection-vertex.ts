/**
 * Projection Vertex Shader
 * 
 * Phase 2 — Section 14: QUALITY ASSURANCE + BROWSER COMPATIBILITY + STRESS TESTING
 * Sacred Geometry Projection Engine (E17)
 * 
 * Scroll elevation, parallax warp, turbulence, amplitude modulation
 */

export const projectionVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;

uniform float uTime;
uniform float uScroll;
uniform float uBass;
uniform float uMid;
uniform vec2 uMouse;
uniform float uIntensity;
uniform float uParallaxStrength;

varying vec2 vUv;
varying vec3 vPosition;
varying float vDistance;

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
  
  // ============================================
  // SCROLL ELEVATION
  // ============================================
  pos.z += uScroll * 1.0;
  
  // ============================================
  // PARALLAX WARP (Mouse)
  // ============================================
  float parallaxX = sin(uTime * 0.3 + pos.x * 0.1) * uMouse.x * 0.03;
  float parallaxY = cos(uTime * 0.3 + pos.y * 0.1) * uMouse.y * 0.03;
  pos.xy += vec2(parallaxX, parallaxY) * uParallaxStrength;
  
  // ============================================
  // TURBULENCE DISTORTION (Mid-driven)
  // ============================================
  float turbulence = fbm(pos.xy * 0.5 + uTime * 0.2) * uMid * 0.1;
  pos.xy += vec2(turbulence);
  
  // ============================================
  // AMPLITUDE MODULATION (Bass)
  // ============================================
  float amplitude = 1.0 + uBass * 0.2;
  pos *= amplitude;
  
  vPosition = pos;
  vDistance = length(pos);
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

