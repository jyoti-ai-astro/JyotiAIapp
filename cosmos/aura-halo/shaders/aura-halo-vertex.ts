/**
 * Aura Halo Vertex Shader
 * 
 * Phase 2 — Section 5: KUNDALINI ENERGY WAVE SYSTEM
 * Aura Halo Engine (E7)
 * 
 * Creates divine golden-blue halo with:
 * - Radial expansion waves
 * - Scroll-driven height lift
 * - Parallax wobble
 * - Audio-reactive distortion
 */

export const auraHaloVertexShader = `
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
uniform float uLayerType;  // 0: Base Halo, 1: Inner Pulse, 2: Divine Veil

varying vec2 vUv;
varying vec3 vPosition;
varying float vDistance;
varying float vRadialDistance;
varying float vWavePhase;

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
  vec3 pos = position;
  
  // ============================================
  // RADIAL DISTANCE (from center)
  // ============================================
  vec2 center = vec2(0.5, 0.5);
  vec2 toCenter = uv - center;
  vRadialDistance = length(toCenter);
  
  // ============================================
  // RADIAL EXPANSION WAVES
  // ============================================
  float waveSpeed = 1.5;
  float waveFrequency = 8.0;
  float wavePhase = vRadialDistance * waveFrequency - uTime * waveSpeed;
  vWavePhase = wavePhase;
  
  // Radial wave displacement
  float radialWave = sin(wavePhase) * 0.1;
  radialWave *= (1.0 + uBass * 0.3);  // Bass increases wave amplitude
  
  // Expand/contract based on wave
  pos.xy += normalize(toCenter) * radialWave;
  
  // ============================================
  // SCROLL-DRIVEN HEIGHT LIFT
  // ============================================
  pos.y += uScroll * 3.0;
  
  // ============================================
  // PARALLAX WOBBLE
  // ============================================
  float wobbleX = sin(uTime * 0.5 + pos.x * 0.1) * uMouse.x * 0.05;
  float wobbleY = cos(uTime * 0.5 + pos.y * 0.1) * uMouse.y * 0.05;
  pos.xy += vec2(wobbleX, wobbleY) * uParallaxStrength;
  
  // ============================================
  // AUDIO-REACTIVE DISTORTION
  // ============================================
  // Mid frequencies add turbulence
  float turbulence = fbm(pos.xy * 0.2 + uTime * 0.1) * uMid * 0.2;
  pos.xy += vec2(turbulence);
  
  // High frequencies add shimmer distortion
  float shimmer = sin(uTime * 5.0 + pos.x * 2.0) * uHigh * 0.05;
  pos.xy += vec2(shimmer);
  
  // ============================================
  // LAYER-SPECIFIC ADJUSTMENTS
  // ============================================
  if (uLayerType < 0.5) {
    // Base Halo: Soft, large
    pos.z = -4.0;
  } else if (uLayerType < 1.5) {
    // Inner Pulse Ring: Closer, stronger
    pos.z = -3.8;
    // Stronger pulse effect
    pos.xy += normalize(toCenter) * sin(uTime * 3.0) * 0.15 * (1.0 + uBass * 0.5);
  } else {
    // Divine Aura Veil: Thin, shimmering
    pos.z = -3.6;
    // Subtle vertical wave
    pos.y += sin(pos.x * 2.0 + uTime * 1.5) * 0.1;
  }
  
  vPosition = pos;
  vDistance = length(pos);
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

