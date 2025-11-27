/**
 * Astral Veil Vertex Shader
 * 
 * Phase 2 — Section 29: ASTRAL VEIL ENGINE
 * Astral Veil Engine (E33)
 * 
 * Front veil plane, rear veil plane, mist particles, breath scaling, scroll drift, bass/mid distortion, high shimmer, rotationSync twist, cameraFOV parallax
 */

export const veilVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;
attribute float frontVeilIndex;
attribute float rearVeilIndex;
attribute float mistParticleIndex;

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
varying float vFrontVeilIndex;
varying float vRearVeilIndex;
varying float vMistParticleIndex;
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
  vFrontVeilIndex = frontVeilIndex;
  vRearVeilIndex = rearVeilIndex;
  vMistParticleIndex = mistParticleIndex;
  
  vec3 pos = position;
  
  // ============================================
  // LAYER A: FRONT ETHER VEIL
  // ============================================
  if (frontVeilIndex >= 0.0) {
    // Semi-transparent floating sheet-like veil moving in front of the Guru
    // Built from a plane geometry 48-64 segments
    
    // Breath → expansion & contraction: scale*(1.0 + uBreathStrength*0.15)
    float breathScale = 1.0 + uBreathStrength * 0.15;
    pos *= breathScale;
    
    // Scroll → drift upward: pos.y += uScroll*0.4
    pos.y += uScroll * 0.4;
    
    // Bass → wave vibration: sin(time*3 + uv.x*8)*uBass*0.1
    float bassWave = sin(uTime * 3.0 + uv.x * 8.0) * uBass * 0.1;
    pos.y += bassWave;
    
    // High → shimmer streaks: fbm(uv*8 + time*0.5)*uHigh*0.3
    float highShimmer = fbm(uv * 8.0 + uTime * 0.5) * uHigh * 0.3;
    pos.xy += vec2(highShimmer * 0.05);
  }
  
  // ============================================
  // LAYER B: MID RISING MIST
  // ============================================
  if (mistParticleIndex >= 0.0) {
    // Ethereal mist particles rising around the Guru
    // 100-180 particles (mobile: 80)
    
    // Vertical upward drift: pos.y += time*0.1 + uScroll*0.2
    pos.y += uTime * 0.1 + uScroll * 0.2;
    
    // Breath → particle size pulse
    float breathPulse = 1.0 + uBreathStrength * 0.1;
    pos *= breathPulse;
    
    // Mid → turbulence float: fbm(uv*6 + time*0.3)*uMid*0.2
    float midTurbulence = fbm(uv * 6.0 + uTime * 0.3) * uMid * 0.2;
    pos.xy += vec2(midTurbulence * 0.1);
    
    // Particle size
    float particleSize = 0.04;
    pos *= particleSize;
  }
  
  // ============================================
  // LAYER C: REAR SILK VEIL
  // ============================================
  if (rearVeilIndex >= 0.0) {
    // Thin veil sheet behind the Guru, softly waving
    // 32-48 segment plane
    
    // Scroll → depth pull: pos.z -= uScroll*0.3
    pos.z -= uScroll * 0.3;
    
    // RotationSync → slight twist: angle += uRotationSync*0.1
    float twistAngle = uRotationSync * 0.1;
    float cosT = cos(twistAngle);
    float sinT = sin(twistAngle);
    pos.xy = vec2(
      pos.x * cosT - pos.y * sinT,
      pos.x * sinT + pos.y * cosT
    );
    
    // Breath → ripple amplitude modulation
    float breathRipple = sin(uv.x * 10.0 + uTime * 2.0) * uBreathStrength * 0.05;
    pos.y += breathRipple;
    
    // High → shimmer flicker along edges
    float edgeShimmer = 0.0;
    if (uv.x < 0.1 || uv.x > 0.9 || uv.y < 0.1 || uv.y > 0.9) {
      float shimmer = fbm(uv * 12.0 + uTime * 0.5);
      shimmer = smoothstep(0.7, 1.0, shimmer);
      edgeShimmer = shimmer * uHigh * 0.1;
    }
    pos.xy += vec2(edgeShimmer * 0.02);
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

