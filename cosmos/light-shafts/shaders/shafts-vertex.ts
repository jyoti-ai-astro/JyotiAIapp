/**
 * Light Shafts Vertex Shader
 * 
 * Phase 2 — Section 5: KUNDALINI ENERGY WAVE SYSTEM
 * Celestial Light Shafts Engine (E11)
 * 
 * Creates light shafts with:
 * - Type A: Solar God-Rays (broad, slow-moving)
 * - Type B: Divine Light Beams (long, thin from top)
 * - Type C: Cross-Directional Aura Shafts (X-shaped)
 * - Sinusoidal wobble
 * - Bass expansion for beam width
 * - Mid turbulence for volumetric density
 * - Scroll-driven vertical drift
 */

export const shaftsVertexShader = `
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
uniform float uShaftType;  // 0: Solar God-Rays, 1: Divine Beams, 2: Cross-Directional

varying vec2 vUv;
varying vec3 vPosition;
varying float vDistance;
varying float vBeamCoord;
varying float vVolumetricDensity;

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
  // TYPE A: SOLAR GOD-RAYS (Broad, Slow-Moving)
  // ============================================
  if (uShaftType < 0.5) {
    // Broad shafts from center
    float angle = atan(pos.y, pos.x);
    float dist = length(pos.xy);
    
    // Beam coordinate (along shaft)
    vBeamCoord = dist;
    
    // Sinusoidal wobble (slow)
    float wobble = sin(uTime * 0.3 + angle * 2.0) * 0.1;
    pos.xy += normalize(pos.xy) * wobble;
    
    // Bass expansion for beam width
    float beamWidth = 1.0 + uBass * 0.3;
    pos.xy *= beamWidth;
    
    // Mid turbulence for volumetric density
    float turbulence = fbm(pos.xy * 0.5 + uTime * 0.2) * uMid * 0.2;
    vVolumetricDensity = turbulence;
    pos.xy += vec2(turbulence);
    
    // Scroll-driven vertical drift
    pos.y += uScroll * 1.5;
    
    pos.z = -1.0;
  }
  
  // ============================================
  // TYPE B: DIVINE LIGHT BEAMS (Long, Thin from Top)
  // ============================================
  else if (uShaftType < 1.5) {
    // Long, thin beams from top
    float beamAngle = pos.x * 0.5;  // Beam direction
    float beamDist = pos.y;  // Distance from top
    
    // Beam coordinate (along beam)
    vBeamCoord = beamDist;
    
    // Sinusoidal wobble (slow)
    float wobble = sin(uTime * 0.4 + beamAngle * 3.0) * 0.08;
    pos.x += wobble;
    
    // Bass expansion for beam width
    float beamWidth = 1.0 + uBass * 0.2;
    pos.x *= beamWidth;
    
    // Mid turbulence for volumetric density
    float turbulence = fbm(vec2(beamAngle, beamDist) * 0.6 + uTime * 0.25) * uMid * 0.15;
    vVolumetricDensity = turbulence;
    pos.x += turbulence;
    
    // Scroll-driven vertical drift
    pos.y += uScroll * 2.0;
    
    pos.z = -0.8;
  }
  
  // ============================================
  // TYPE C: CROSS-DIRECTIONAL AURA SHAFTS (X-shaped)
  // ============================================
  else {
    // X-shaped beams
    float angle = atan(pos.y, pos.x);
    float dist = length(pos.xy);
    
    // Beam coordinate (along shaft)
    vBeamCoord = dist;
    
    // X-pattern (4 directions)
    float xAngle = mod(angle + 3.14159 * 0.25, 3.14159 * 0.5) - 3.14159 * 0.25;
    float xDist = dist;
    
    // Sinusoidal wobble (slow)
    float wobble = sin(uTime * 0.35 + xAngle * 4.0) * 0.12;
    pos.xy += normalize(pos.xy) * wobble;
    
    // Bass expansion for beam width
    float beamWidth = 1.0 + uBass * 0.25;
    pos.xy *= beamWidth;
    
    // Mid turbulence for volumetric density
    float turbulence = fbm(pos.xy * 0.4 + uTime * 0.22) * uMid * 0.18;
    vVolumetricDensity = turbulence;
    pos.xy += vec2(turbulence);
    
    // Scroll-driven vertical drift
    pos.y += uScroll * 1.8;
    
    pos.z = -0.6;
  }
  
  // ============================================
  // PARALLAX MOTION DRIVEN BY MOUSE
  // ============================================
  float parallaxX = sin(uTime * 0.2 + pos.x * 0.1) * uMouse.x * 0.05;
  float parallaxY = cos(uTime * 0.2 + pos.y * 0.1) * uMouse.y * 0.05;
  pos.xy += vec2(parallaxX, parallaxY) * uParallaxStrength;
  
  vPosition = pos;
  vDistance = length(pos);
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

