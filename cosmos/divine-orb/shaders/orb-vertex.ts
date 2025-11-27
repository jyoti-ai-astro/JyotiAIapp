/**
 * Divine Orb Vertex Shader
 * 
 * Phase 2 — Section 5: KUNDALINI ENERGY WAVE SYSTEM
 * Orb of Divine Consciousness Engine (E10)
 * 
 * Creates spherical orb with:
 * - Core Light Sphere
 * - Energy Swirl Layer
 * - Mandala Emission Layer
 * - Refraction Layer
 * - Divine Spark Layer
 * - Scroll-driven elevation
 * - Bass-driven radius expansion
 * - Mid-driven distortion turbulence
 * - Parallax distortion from mouse
 */

export const orbVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

uniform float uTime;
uniform float uBass;
uniform float uMid;
uniform float uHigh;
uniform float uScroll;
uniform vec2 uMouse;
uniform float uIntensity;
uniform float uParallaxStrength;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vWorldPosition;
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
  
  // ============================================
  // RADIAL DISTANCE (from sphere center)
  // ============================================
  vRadialDistance = length(pos);
  
  // ============================================
  // BASS-DRIVEN RADIUS EXPANSION
  // ============================================
  float baseRadius = 1.0;
  float expansion = 1.0 + uBass * 0.15;
  pos *= expansion;
  
  // ============================================
  // MID-DRIVEN DISTORTION TURBULENCE
  // ============================================
  vec3 distortion = vec3(
    fbm(pos.xy * 0.5 + uTime * 0.2),
    fbm(pos.yz * 0.5 + uTime * 0.2 + 100.0),
    fbm(pos.zx * 0.5 + uTime * 0.2 + 200.0)
  ) * uMid * 0.1;
  pos += distortion;
  
  // ============================================
  // ENERGY SWIRL LAYER (Sinusoidal Distortion Bands)
  // ============================================
  float swirlAngle = atan(pos.y, pos.x);
  float swirlDist = length(pos.xy);
  float swirl = sin(swirlDist * 3.0 - uTime * 1.5 + swirlAngle * 2.0) * 0.05;
  pos.xy += normalize(pos.xy) * swirl;
  
  // ============================================
  // PARALLAX DISTORTION FROM MOUSE
  // ============================================
  vec3 parallaxDistortion = vec3(
    sin(uTime * 0.3 + pos.x * 0.2) * uMouse.x * 0.02,
    cos(uTime * 0.3 + pos.y * 0.2) * uMouse.y * 0.02,
    sin(uTime * 0.3 + pos.z * 0.2) * (uMouse.x + uMouse.y) * 0.01
  ) * uParallaxStrength;
  pos += parallaxDistortion;
  
  // ============================================
  // SCROLL-DRIVEN ELEVATION (Orb Rises When Scrolling)
  // ============================================
  pos.y += uScroll * 2.0;
  
  vPosition = pos;
  vWorldPosition = (modelMatrix * vec4(pos, 1.0)).xyz;
  vDistance = length(vWorldPosition);
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

