/**
 * Fate Ripple Vertex Shader
 * 
 * Phase 2 — Section 30: FATE RIPPLE ENGINE
 * Fate Ripple Engine (E34)
 * 
 * Ripple rings, shockwave discs, fragment quads, breath scaling, scroll-based radius, bass wobble, mid turbulence, cameraFOV parallax, rotationSync twist
 */

export const rippleVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;
attribute float rippleRingIndex;
attribute float shockwaveIndex;
attribute float fragmentIndex;

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
varying float vRippleRingIndex;
varying float vShockwaveIndex;
varying float vFragmentIndex;
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
  vRippleRingIndex = rippleRingIndex;
  vShockwaveIndex = shockwaveIndex;
  vFragmentIndex = fragmentIndex;
  
  vec3 pos = position;
  
  vec2 center = vec2(0.5, 0.5);
  vec2 toCenter = uv - center;
  float dist = length(toCenter);
  float angle = atan(toCenter.y, toCenter.x);
  
  // ============================================
  // LAYER A: DESTINY RIPPLE RINGS
  // ============================================
  if (rippleRingIndex >= 0.0) {
    // 5-9 expanding rings centered behind the Guru
    float baseRadius = 0.2 + rippleRingIndex * 0.15; // Expanding rings
    
    // Radius expansion speed = (uScroll*0.4 + sin(uTime*0.5)*0.05)
    float expansionSpeed = uScroll * 0.4 + sin(uTime * 0.5) * 0.05;
    float ringRadius = baseRadius + expansionSpeed;
    
    // Breath → ring thickness pulse: thickness*(1.0 + uBreathStrength*0.15)
    float breathThickness = 1.0 + uBreathStrength * 0.15;
    
    // Bass → ripple wobble: sin(time*4 + ringIndex*10)*uBass*0.03
    float bassWobble = sin(uTime * 4.0 + rippleRingIndex * 10.0) * uBass * 0.03;
    angle += bassWobble;
    
    // RotationSync peripheral twist
    angle += uRotationSync * 0.1;
    
    // Convert back to cartesian
    float x = cos(angle) * dist * ringRadius;
    float y = sin(angle) * dist * ringRadius;
    
    pos = vec3(x, y, pos.z);
  }
  
  // ============================================
  // LAYER B: KARMIC SHOCKWAVE PULSES
  // ============================================
  if (shockwaveIndex >= 0.0) {
    // Circular shock pulses
    // Shockwave expansion: radius += time*0.8
    float shockwaveRadius = 0.1 + uTime * 0.8;
    
    // Mid → turbulence distortion on edges
    float midTurbulence = fbm(uv * 6.0 + uTime * 0.3) * uMid * 0.2;
    shockwaveRadius += midTurbulence * 0.05;
    
    // Convert to cartesian
    float x = cos(angle) * dist * shockwaveRadius;
    float y = sin(angle) * dist * shockwaveRadius;
    
    pos = vec3(x, y, pos.z);
  }
  
  // ============================================
  // LAYER C: PAST-LIFE ECHO FRAGMENTS
  // ============================================
  if (fragmentIndex >= 0.0) {
    // 20-40 floating fragments drifting outward
    // Fragment drift vector = (scroll + globalMotion)*0.2
    float driftX = sin(fragmentIndex * 0.5) * (uScroll + 0.5) * 0.2;
    float driftY = cos(fragmentIndex * 0.5) * (uScroll + 0.5) * 0.2;
    
    // Breath → fragment scale pulse
    float breathPulse = 1.0 + uBreathStrength * 0.1;
    
    // Bass → jitter vibration
    float bassJitter = sin(uTime * 3.0 + fragmentIndex) * uBass * 0.05;
    driftX += bassJitter;
    driftY += bassJitter;
    
    // Position fragment
    float x = driftX;
    float y = driftY;
    
    pos = vec3(x, y, pos.z);
    
    // Fragment size
    float fragmentSize = 0.05 * breathPulse;
    pos *= fragmentSize;
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

