/**
 * Aurora Veil Vertex Shader
 * 
 * Phase 2 — Section 44: AURORA VEIL ENGINE
 * Aurora Veil Engine (E48)
 * 
 * Primary aurora curtains, reverse aurora veils, aurora dust particles, breath pulse, scroll drift, bass flicker, high shimmer, cameraFOV
 */

export const auroraVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;
attribute float primaryIndex;
attribute float reverseIndex;
attribute float dustIndex;

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
varying float vPrimaryIndex;
varying float vReverseIndex;
varying float vDustIndex;
varying float vDistance;
varying float vRadialDistance;
varying float vAuroraHeight;
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
// PRIMARY AURORA WAVE FUNCTION
// ============================================
float primaryAuroraWave(vec2 xz, float time) {
  // Vertical wave displacement:
  // wave1 = sin(x * 0.4 + time * 0.7) * 0.3
  // wave2 = sin(y * 0.6 + time * 0.4) * 0.2
  // wave3 = fbm(uv * 4.0 + time * 0.2) * 0.15
  // combined = wave1 + wave2 + wave3
  float wave1 = sin(xz.x * 0.4 + time * 0.7) * 0.3;
  float wave2 = sin(xz.y * 0.6 + time * 0.4) * 0.2;
  float wave3 = fbm(xz * 4.0 + time * 0.2) * 0.15;
  
  return wave1 + wave2 + wave3;
}

// ============================================
// REVERSE AURORA WAVE FUNCTION
// ============================================
float reverseAuroraWave(vec2 xz, float time) {
  // Motion:
  // reverseWave = sin(y * 0.5 + time * 0.9) * 0.25
  // turbulence = fbm(uv * 5.0 + time * 0.3) * 0.1
  float reverseWave = sin(xz.y * 0.5 + time * 0.9) * 0.25;
  float turbulence = fbm(xz * 5.0 + time * 0.3) * 0.1;
  
  return reverseWave + turbulence;
}

void main() {
  vUv = uv;
  vPrimaryIndex = primaryIndex;
  vReverseIndex = reverseIndex;
  vDustIndex = dustIndex;
  
  vec3 pos = position;
  
  // ============================================
  // LAYER A: PRIMARY AURORA CURTAINS
  // ============================================
  if (primaryIndex >= 0.0) {
    // Two massive vertical curtains:
    // width: 14 units, height: 12 units, grid: 48×48
    float curtainWidth = 14.0;
    float curtainHeight = 12.0;
    
    vec2 xz = vec2((uv.x - 0.5) * curtainWidth, (uv.y - 0.5) * curtainHeight);
    
    // Sample primary waves
    float baseWave = primaryAuroraWave(xz, uTime);
    
    // Breath → amplitude boost (0.3 → 0.45)
    float breathAmplitude = 1.0 + uBreathStrength * 0.5;
    baseWave *= breathAmplitude;
    
    // Scroll → lateral drift (x shift)
    float scrollDrift = uScroll * 0.3;
    xz.x += scrollDrift;
    
    // Bass → curtain flicker ripple: sin(time*4+pos.y*1.2)*bass*0.05
    float bassFlicker = sin(uTime * 4.0 + xz.y * 1.2) * uBass * 0.05;
    xz.x += bassFlicker;
    
    // High → shimmer streaks (handled in fragment)
    
    // Position with wave displacement
    pos = vec3(xz.x, baseWave, xz.y - 6.2);
    
    vAuroraHeight = baseWave;
    vGradientProgress = (baseWave + 0.5) / 1.0; // Normalize to 0-1
  }
  
  // ============================================
  // LAYER B: REVERSE AURORA VEILS
  // ============================================
  if (reverseIndex >= 0.0) {
    // Two back-facing auroras behind Layer A
    float curtainWidth = 14.0;
    float curtainHeight = 12.0;
    
    vec2 xz = vec2((uv.x - 0.5) * curtainWidth, (uv.y - 0.5) * curtainHeight);
    
    // Sample reverse wave
    float baseReverseWave = reverseAuroraWave(xz, uTime);
    
    // RotationSync → gentle horizontal swing
    float rotationSwing = sin(uRotationSync * 0.5 + uTime * 0.3) * 0.1;
    xz.x += rotationSwing;
    
    // Breath → turbulence boost
    float breathBoost = 1.0 + uBreathStrength * 0.2;
    baseReverseWave *= breathBoost;
    
    // Bass → ribbon pulse (handled in fragment)
    
    // High → edge sparkle (handled in fragment)
    
    // Position with reverse wave displacement
    pos = vec3(xz.x, baseReverseWave, xz.y - 6.2);
    
    vAuroraHeight = baseReverseWave;
  }
  
  // ============================================
  // LAYER C: AURORA DUST PARTICLES
  // ============================================
  if (dustIndex >= 0.0) {
    // 120-200 floating aurora dust points (mobile: 80)
    // Drift upward:
    // y = mod(time * 0.15 + indexOffset + scroll * 0.3, 10.0) - 5.0
    float indexOffset = dustIndex * 0.05;
    float scrollDrift = uScroll * 0.3;
    float upwardY = mod(uTime * 0.15 + indexOffset + scrollDrift, 10.0) - 5.0;
    
    // Breath → vertical amplitude
    float breathAmplitude = 1.0 + uBreathStrength * 0.15;
    upwardY *= breathAmplitude;
    
    // X/Z mild sinusoidal orbit:
    // x = baseX + sin(time * speed + index * 0.5) * 0.5
    // z = baseZ + cos(time * speed + index * 0.6) * 0.5
    float speed = 0.2 + (dustIndex / 200.0) * 0.1; // Varying speeds
    float baseX = (dustIndex / 200.0) * 14.0 - 7.0; // Spread across X
    float baseZ = -6.2;
    
    float orbitX = sin(uTime * speed + dustIndex * 0.5) * 0.5;
    float orbitZ = cos(uTime * speed + dustIndex * 0.6) * 0.5;
    
    float x = baseX + orbitX;
    float z = baseZ + orbitZ;
    
    // Bass → flicker jitter
    float bassJitter = sin(uTime * 3.0 + dustIndex * 2.0) * uBass * 0.01;
    x += bassJitter;
    z += bassJitter * 0.5;
    
    // High → sparkle noise (handled in fragment)
    
    // Radius: 0.01-0.015
    float dustRadius = 0.0125;
    
    pos = vec3(x, upwardY, z);
    pos *= dustRadius; // Scale particle size
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

