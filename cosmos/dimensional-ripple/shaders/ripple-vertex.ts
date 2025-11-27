/**
 * Dimensional Ripple Vertex Shader
 * 
 * Phase 2 — Section 43: DIMENSIONAL RIPPLE ENGINE
 * Dimensional Ripple Engine (E47)
 * 
 * Spacetime ripple plane, radial warp vortex, drift particles, breath pulse, scroll propagation, bass shockwave, high shimmer, cameraFOV
 */

export const rippleVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;
attribute float rippleIndex;
attribute float warpIndex;
attribute float particleIndex;

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
uniform float uBlessingWaveProgress;

varying vec2 vUv;
varying vec3 vPosition;
varying float vRippleIndex;
varying float vWarpIndex;
varying float vParticleIndex;
varying float vDistance;
varying float vRadialDistance;
varying float vRippleHeight;
varying float vGradientProgress;

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

// ============================================
// SPACETIME RIPPLE FUNCTION
// ============================================
float spacetimeRipple(vec2 xz, float time, float scroll) {
  // Compute dist from center
  float dist = length(xz);
  
  // Distortion equation:
  // ripple = sin(dist * 2.5 - uTime * 0.7) * 0.08
  //        + fbm(uv * 3.0 + uTime * 0.4) * 0.06
  float ripple1 = sin(dist * 2.5 - time * 0.7) * 0.08;
  float ripple2 = fbm(xz * 3.0 + time * 0.4) * 0.06;
  
  // Scroll → ripple propagation outward
  float scrollPropagation = scroll * 0.3;
  ripple1 += scrollPropagation * 0.05;
  
  return ripple1 + ripple2;
}

// ============================================
// RADIAL WARP FUNCTION
// ============================================
float radialWarp(vec2 xz, float time, float rotationSync) {
  // Compute dist from center
  float dist = length(xz);
  
  // Centered radial displacement:
  // warp = sin(dist * 4.0 + uTime * 0.8 + uRotationSync * 0.6) * 0.05
  float warp = sin(dist * 4.0 + time * 0.8 + rotationSync * 0.6) * 0.05;
  
  // Mid → turbulence (fbm * uMid * 0.05)
  float midTurbulence = fbm(xz * 2.0 + time * 0.3) * uMid * 0.05;
  warp += midTurbulence;
  
  return warp;
}

void main() {
  vUv = uv;
  vRippleIndex = rippleIndex;
  vWarpIndex = warpIndex;
  vParticleIndex = particleIndex;
  
  vec3 pos = position;
  
  // ============================================
  // LAYER A: SPACETIME RIPPLE PLANE
  // ============================================
  if (rippleIndex >= 0.0) {
    // Large plane: 22 × 14 units
    float planeWidth = 22.0;
    float planeHeight = 14.0;
    
    vec2 xz = vec2((uv.x - 0.5) * planeWidth, (uv.y - 0.5) * planeHeight);
    
    // Compute dist from center
    float dist = length(xz);
    
    // Evaluate ripple
    float baseRipple = spacetimeRipple(xz, uTime, uScroll);
    
    // Breath → ripple amplitude: 1 + uBreathStrength * 0.25
    float breathAmplitude = 1.0 + uBreathStrength * 0.25;
    baseRipple *= breathAmplitude;
    
    // Bass → shockwave jitter: sin(uTime * 5 + dist * 6) * uBass * 0.02
    float bassJitter = sin(uTime * 5.0 + dist * 6.0) * uBass * 0.02;
    baseRipple += bassJitter;
    
    // High → micro shimmer (handled in fragment)
    
    // Position with ripple displacement
    pos = vec3(xz.x, baseRipple, xz.y - 6.8);
    
    vRippleHeight = baseRipple;
    vGradientProgress = (baseRipple + 0.15) / 0.3; // Normalize to 0-1
  }
  
  // ============================================
  // LAYER B: RADIAL WARP VORTEX
  // ============================================
  if (warpIndex >= 0.0) {
    // Centered radial displacement
    float planeWidth = 22.0;
    float planeHeight = 14.0;
    
    vec2 xz = vec2((uv.x - 0.5) * planeWidth, (uv.y - 0.5) * planeHeight);
    
    // Evaluate warp
    float baseWarp = radialWarp(xz, uTime, uRotationSync);
    
    // Scroll → outward expansion
    float scrollExpansion = uScroll * 0.2;
    baseWarp += scrollExpansion * 0.03;
    
    // High → shimmering rings (handled in fragment)
    
    // Position with warp displacement
    pos = vec3(xz.x, baseWarp, xz.y - 6.8);
    
    vRippleHeight = baseWarp;
  }
  
  // ============================================
  // LAYER C: DRIFT PARTICLES
  // ============================================
  if (particleIndex >= 0.0) {
    // 100-180 drifting points (mobile: 70)
    // Drift on circular paths:
    // angle = uTime * speed + indexOffset
    
    // Breath → drift radius modulation
    float breathRadius = 1.0 + uBreathStrength * 0.2;
    
    // Angle-based orbiting motion
    float speed = 0.3 + (particleIndex / 180.0) * 0.2; // Varying speeds
    float indexOffset = particleIndex * 0.1;
    float angle = uTime * speed + indexOffset;
    
    // Radius boosted by breath
    float baseRadius = 3.0 + (particleIndex / 180.0) * 5.0; // Varying radii
    float radius = baseRadius * breathRadius;
    
    // Bass → flicker jitter
    float bassFlicker = sin(uTime * 4.0 + particleIndex * 2.0) * uBass * 0.02;
    radius += bassFlicker * 0.3;
    angle += bassFlicker * 0.1;
    
    // High → sparkle noise (handled in fragment)
    
    // Position particle on circular path
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = sin(uTime * 0.5 + particleIndex * 0.05) * 0.1; // Slight vertical drift
    
    // Loop positions
    x = mod(x + 11.0, 22.0) - 11.0; // -11 to 11 range
    z = mod(z + 7.0, 14.0) - 7.0; // -7 to 7 range
    
    // Radius: 0.01-0.015
    float particleRadius = 0.0125;
    
    pos = vec3(x, y - 6.8, z);
    pos *= particleRadius; // Scale particle size
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

