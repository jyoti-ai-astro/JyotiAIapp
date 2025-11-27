/**
 * Soul Star Vertex Shader
 * 
 * Phase 2 — Section 31: SOUL STAR ENGINE
 * Soul Star Engine (E35)
 * 
 * Mandala star geometry, spike quads, star dust particles, breath pulse, bass vibration, scroll spike-length, mid flicker, high shimmer, rotationSync, cameraFOV
 */

export const starVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;
attribute float coreStarIndex;
attribute float spikeIndex;
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

varying vec2 vUv;
varying vec3 vPosition;
varying float vCoreStarIndex;
varying float vSpikeIndex;
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
  vCoreStarIndex = coreStarIndex;
  vSpikeIndex = spikeIndex;
  vParticleIndex = particleIndex;
  
  vec3 pos = position;
  
  vec2 center = vec2(0.5, 0.5);
  vec2 toCenter = uv - center;
  float dist = length(toCenter);
  float angle = atan(toCenter.y, toCenter.x);
  
  // ============================================
  // LAYER A: CORE SOUL STAR
  // ============================================
  if (coreStarIndex >= 0.0) {
    // Primary luminous star behind Guru, radius ~0.45
    // Shape: 8-point mandala star (desktop), 6-point (mobile)
    float starRadius = 0.45;
    
    // Breath → star pulse: scale * (1.0 + uBreathStrength * 0.12)
    float breathPulse = 1.0 + uBreathStrength * 0.12;
    starRadius *= breathPulse;
    
    // Bass → radial vibration: sin(time*4 + angle*10)*uBass*0.03
    float bassVibration = sin(uTime * 4.0 + angle * 10.0) * uBass * 0.03;
    angle += bassVibration;
    
    // Mid → distortion flicker: fbm(uv*4 + time*0.4)*uMid*0.1
    float midFlicker = fbm(uv * 4.0 + uTime * 0.4) * uMid * 0.1;
    angle += midFlicker * 0.1;
    
    // High → edge shimmer (already in fragment)
    
    // Convert back to cartesian
    float x = cos(angle) * dist * starRadius;
    float y = sin(angle) * dist * starRadius;
    
    pos = vec3(x, y, pos.z);
  }
  
  // ============================================
  // LAYER B: SECONDARY AURA SPIKES
  // ============================================
  if (spikeIndex >= 0.0) {
    // 12-18 soft spikes radiating outward (mobile: 8)
    float spikeAngle = (spikeIndex / 15.0) * 6.28318; // 15 spikes max
    
    // RotationSync → spike rotation: angle += uRotationSync * 0.5
    spikeAngle += uRotationSync * 0.5;
    
    // Scroll → spike length extension: length*(1.0 + uScroll*0.25)
    float scrollExtension = 1.0 + uScroll * 0.25;
    float spikeLength = 0.5 * scrollExtension;
    
    // Bass → jitter wobble: sin(time*6 + spikeIndex)*uBass*0.02
    float bassJitter = sin(uTime * 6.0 + spikeIndex) * uBass * 0.02;
    spikeAngle += bassJitter;
    
    // Position spike
    float x = cos(spikeAngle) * spikeLength;
    float y = sin(spikeAngle) * spikeLength;
    
    pos = vec3(x, y, pos.z);
    
    // Spike width
    float spikeWidth = 0.03;
    pos.x += (uv.x - 0.5) * spikeWidth;
  }
  
  // ============================================
  // LAYER C: STAR DUST HALO
  // ============================================
  if (particleIndex >= 0.0) {
    // 50-90 floating star particles orbiting around the Soul Star
    // Orbit angle = (particleIndex / totalParticles)*2π + time*0.2
    float totalParticles = 90.0; // Max particles
    float orbitAngle = (particleIndex / totalParticles) * 6.28318 + uTime * 0.2;
    
    // Orbit radius = 0.6 + sin(time + particleIndex)*0.05
    float orbitRadius = 0.6 + sin(uTime + particleIndex) * 0.05;
    
    // Breath → brightness pulse (handled in fragment)
    
    // High → shimmer flicker (handled in fragment)
    
    // Position particle
    float x = cos(orbitAngle) * orbitRadius;
    float y = sin(orbitAngle) * orbitRadius;
    
    pos = vec3(x, y, pos.z);
    
    // Particle size
    float particleSize = 0.02;
    pos *= particleSize;
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

