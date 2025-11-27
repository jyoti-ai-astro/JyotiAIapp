/**
 * Astral Bloom Vertex Shader
 * 
 * Phase 2 — Section 39: ASTRAL BLOOM ENGINE
 * Astral Bloom Engine (E43)
 * 
 * Radial disc, shockwave ring, dust particles, breath swelling, scroll expansion, bass ripple, high shimmer, cameraFOV
 */

export const bloomVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;
attribute float discIndex;
attribute float ringIndex;
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
varying float vDiscIndex;
varying float vRingIndex;
varying float vParticleIndex;
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
  vDiscIndex = discIndex;
  vRingIndex = ringIndex;
  vParticleIndex = particleIndex;
  
  vec3 pos = position;
  
  vec2 center = vec2(0.5, 0.5);
  vec2 toCenter = uv - center;
  float dist = length(toCenter);
  float angle = atan(toCenter.y, toCenter.x);
  
  // ============================================
  // LAYER A: RADIAL BLOOM BURST
  // ============================================
  if (discIndex >= 0.0) {
    // Expanding radial disc with multi-octave bloom
    // Base radius: 0.3 → expands to 2.0
    float baseRadius = 0.3;
    float maxRadius = 2.0;
    
    // Scroll → expansion progression
    float scrollExpansion = uScroll * 0.5;
    float bloomRadius = baseRadius + (maxRadius - baseRadius) * scrollExpansion;
    
    // Breath → bloom intensity pulse (handled in fragment)
    // But also affects radius
    float breathPulse = 1.0 + uBreathStrength * 0.1;
    bloomRadius *= breathPulse;
    
    // Bass → shockwave ripple jitter: sin(time*5 + dist*30)*uBass*0.03
    float bassRipple = sin(uTime * 5.0 + dist * 30.0) * uBass * 0.03;
    angle += bassRipple;
    
    // High → sparkle bloom halo (handled in fragment)
    
    // Triggered by scroll thresholds + blessingWave
    float trigger = max(uScroll, uBlessingWaveProgress);
    bloomRadius *= 1.0 + trigger * 0.3;
    
    // Convert back to cartesian
    float x = cos(angle) * dist * bloomRadius;
    float y = sin(angle) * dist * bloomRadius;
    
    pos = vec3(x, y, pos.z);
  }
  
  // ============================================
  // LAYER B: SHOCKWAVE RING
  // ============================================
  if (ringIndex >= 0.0) {
    // Expanding thin ring emitted with each bloom trigger
    // Thickness: 0.02
    float ringThickness = 0.02;
    
    // Breath → ring width pulse
    float breathWidth = 1.0 + uBreathStrength * 0.1;
    ringThickness *= breathWidth;
    
    // Radius loops with mod()
    float trigger = max(uScroll, uBlessingWaveProgress);
    float ringRadius = 0.3 + trigger * 1.5;
    ringRadius = mod(ringRadius, 2.0); // Loop rings
    
    // Bass → ring vibration
    float bassVibration = sin(uTime * 4.0 + angle * 8.0) * uBass * 0.02;
    ringRadius += bassVibration * 0.05;
    
    // High → shimmering edges (handled in fragment)
    
    // Convert back to cartesian
    float x = cos(angle) * dist * ringRadius;
    float y = sin(angle) * dist * ringRadius;
    
    pos = vec3(x, y, pos.z);
  }
  
  // ============================================
  // LAYER C: BLOOM DUST PARTICLES
  // ============================================
  if (particleIndex >= 0.0) {
    // 100-160 particles (mobile: 60)
    // Radial outward velocity
    float particleAngle = (particleIndex / 160.0) * 6.28318; // 160 particles max
    
    // Breath → acceleration
    float breathAccel = 1.0 + uBreathStrength * 0.2;
    
    // Scroll → outward drag
    float scrollDrag = uScroll * 0.4;
    
    // Particle radius: 0.01-0.02
    float particleRadius = 0.015;
    
    // Radial outward position
    float trigger = max(uScroll, uBlessingWaveProgress);
    float particleDistance = 0.3 + trigger * 1.5 * breathAccel + scrollDrag;
    particleDistance = mod(particleDistance, 2.0); // Loop particles
    
    // Bass → flicker
    float bassFlicker = sin(uTime * 6.0 + particleIndex * 2.0) * uBass * 0.02;
    particleDistance += bassFlicker * 0.1;
    
    // High → sparkle noise (handled in fragment)
    
    // Position particle
    float x = cos(particleAngle) * particleDistance;
    float y = sin(particleAngle) * particleDistance;
    
    pos = vec3(x, y, pos.z);
    
    // Particle size
    pos *= particleRadius;
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

