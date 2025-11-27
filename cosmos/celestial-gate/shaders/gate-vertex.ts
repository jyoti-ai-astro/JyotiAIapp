/**
 * Celestial Gate Vertex Shader
 * 
 * Phase 2 — Section 32: CELESTIAL GATE ENGINE
 * Celestial Gate Engine (E36)
 * 
 * Halo ring geometry, sigil quads, core disc, breath pulse, scroll radius expansion, bass vibration, mid/high turbulence, rotationSync, cameraFOV
 */

export const gateVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;
attribute float haloIndex;
attribute float sigilIndex;
attribute float coreIndex;

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
uniform float uRotationSync; // From Projection (E17)
uniform float uCameraFOV;

varying vec2 vUv;
varying vec3 vPosition;
varying float vHaloIndex;
varying float vSigilIndex;
varying float vCoreIndex;
varying float vDistance;
varying float vRadialDistance;

// Noise functions
float hash(float n) {
  return fract(sin(n) * 43758.5453123);
}

float hash2(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
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
  vHaloIndex = haloIndex;
  vSigilIndex = sigilIndex;
  vCoreIndex = coreIndex;
  
  vec3 pos = position;
  
  vec2 center = vec2(0.5, 0.5);
  vec2 toCenter = uv - center;
  float dist = length(toCenter);
  float angle = atan(toCenter.y, toCenter.x);
  
  // ============================================
  // LAYER A: OUTER GATE HALO
  // ============================================
  if (haloIndex >= 0.0) {
    // Massive circular halo: 64-96 segments (mobile: 48)
    float haloRadius = 0.8;
    
    // Scroll → opening progress: radius*(1.0 + uScroll*0.3)
    float scrollExpansion = 1.0 + uScroll * 0.3;
    haloRadius *= scrollExpansion;
    
    // Breath → halo thickness pulse: (1.0 + uBreathStrength*0.1)
    float breathPulse = 1.0 + uBreathStrength * 0.1;
    
    // Bass → halo vibration: sin(time*3 + angle*8)*uBass*0.03
    float bassVibration = sin(uTime * 3.0 + angle * 8.0) * uBass * 0.03;
    angle += bassVibration;
    
    // High → electric shimmer bands (handled in fragment)
    
    // Convert back to cartesian
    float x = cos(angle) * dist * haloRadius;
    float y = sin(angle) * dist * haloRadius;
    
    pos = vec3(x, y, pos.z);
  }
  
  // ============================================
  // LAYER B: INNER GATE SIGILS
  // ============================================
  if (sigilIndex >= 0.0) {
    // 12-20 rotating sigils (mobile: 8), orbiting inside halo
    float sigilAngle = (sigilIndex / 20.0) * 6.28318; // 20 sigils max
    
    // RotationSync → sigil rotation: angle += uRotationSync*0.8
    sigilAngle += uRotationSync * 0.8;
    
    // Scroll → sigils move outward: radius*(1.0 + uScroll*0.2)
    float scrollOutward = 1.0 + uScroll * 0.2;
    float sigilRadius = 0.5 * scrollOutward;
    
    // Mid → turbulence wobble: fbm(uv*6 + time*0.3)*uMid*0.1
    float midWobble = fbm(uv * 6.0 + uTime * 0.3) * uMid * 0.1;
    sigilAngle += midWobble * 0.1;
    
    // Position sigil
    float x = cos(sigilAngle) * sigilRadius;
    float y = sin(sigilAngle) * sigilRadius;
    
    pos = vec3(x, y, pos.z);
    
    // Sigil size
    float sigilSize = 0.06;
    pos *= sigilSize;
  }
  
  // ============================================
  // LAYER C: CENTRAL GATE CORE
  // ============================================
  if (coreIndex >= 0.0) {
    // Pulsating circular core portal behind Guru, radius ~0.35
    float coreRadius = 0.35;
    
    // Breath → scale pulse: (1.0 + uBreathStrength*0.15)
    float breathPulse = 1.0 + uBreathStrength * 0.15;
    coreRadius *= breathPulse;
    
    // Bass → radial shock flicker: sin(time*5 + dist*30)*uBass*0.04
    float bassShock = sin(uTime * 5.0 + dist * 30.0) * uBass * 0.04;
    float shockRadius = coreRadius + bassShock * 0.05;
    
    // High → shimmering portal texture (handled in fragment)
    
    // Convert back to cartesian
    float x = cos(angle) * dist * shockRadius;
    float y = sin(angle) * dist * shockRadius;
    
    pos = vec3(x, y, pos.z);
  }
  
  // ============================================
  // CAMERA FOV → PARALLAX WARP INTENSITY
  // ============================================
  float fovFactor = uCameraFOV / 75.0;
  pos.xy *= 1.0 + (fovFactor - 1.0) * 0.05;
  
  // ============================================
  // PARALLAX WOBBLE
  // ============================================
  float wobbleX = sin(uTime * 0.2) * uMouse.x * 0.01;
  float wobbleY = cos(uTime * 0.2) * uMouse.y * 0.01;
  pos.xy += vec2(wobbleX, wobbleY) * uParallaxStrength;
  
  vPosition = pos;
  vDistance = length(pos);
  vRadialDistance = length(pos.xz);
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

