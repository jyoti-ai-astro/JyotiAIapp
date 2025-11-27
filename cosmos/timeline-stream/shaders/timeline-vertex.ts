/**
 * Timeline Stream Vertex Shader
 * 
 * Phase 2 — Section 23: COSMIC TIMELINE STREAM ENGINE
 * Timeline Stream Engine (E27)
 * 
 * Particle positions, ribbon spline, future lines with timeIndex, noise displacement, breath scale, scroll progression
 */

export const timelineVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;
attribute float particleIndex;
attribute float ribbonIndex;
attribute float lineIndex;
attribute float timeIndex; // 0→1 representing ancient→recent past

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
varying float vParticleIndex;
varying float vRibbonIndex;
varying float vLineIndex;
varying float vTimeIndex;
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
  vParticleIndex = particleIndex;
  vRibbonIndex = ribbonIndex;
  vLineIndex = lineIndex;
  vTimeIndex = timeIndex;
  
  vec3 pos = position;
  
  // ============================================
  // LAYER A: PAST ECHO PARTICLES
  // ============================================
  if (particleIndex >= 0.0) {
    // Past particle drift using timeIndex
    // timeIndex 0 = ancient past (far behind), 1 = recent past (closer)
    float zOffset = -2.0 + timeIndex * 1.5; // Behind Guru (Z negative)
    
    // Noise displacement using FBM
    vec2 noiseCoord = vec2(particleIndex, uTime * 0.1);
    float noiseDisplacement = fbm(noiseCoord) * 0.3;
    
    // Scroll → drift speed
    float scrollDrift = uScroll * 0.5;
    zOffset += scrollDrift;
    
    // Bass → outward pulse
    float bassPulse = 1.0 + uBass * 0.2;
    float x = (particleIndex - 0.5) * 0.8 * bassPulse;
    float y = (particleIndex * 0.1 - 0.5) * 0.6;
    
    // Breath → subtle contraction/expansion
    float breathScale = 1.0 + uBreathStrength * 0.1;
    x *= breathScale;
    y *= breathScale;
    
    // High → shimmer noise
    float shimmerNoise = fbm(noiseCoord * 2.0 + uTime * 0.3) * uHigh * 0.1;
    x += shimmerNoise;
    y += shimmerNoise;
    
    pos = vec3(x, y, zOffset + noiseDisplacement);
  }
  
  // ============================================
  // LAYER B: PRESENT MOMENT RIBBON
  // ============================================
  if (ribbonIndex >= 0.0) {
    // Thin horizontal ribbon behind Guru's head
    float t = uv.x; // 0 to 1 along ribbon
    float ribbonY = 0.8; // Behind Guru's head
    
    // Curved spline affected by uRotationSync
    float rotationOffset = sin(t * 3.14159) * uRotationSync * 0.1;
    float x = (t - 0.5) * 1.5 + rotationOffset;
    
    // Breath phase (tight → loose)
    float breathTightness = 1.0 - uBreathStrength * 0.2; // Inhale tightens, exhale loosens
    x *= breathTightness;
    
    // Ribbon width (thin)
    float ribbonWidth = 0.01;
    float y = ribbonY + (uv.y - 0.5) * ribbonWidth;
    
    pos = vec3(x, y, -1.8);
  }
  
  // ============================================
  // LAYER C: FUTURE GLIMMER LINES
  // ============================================
  if (lineIndex >= 0.0) {
    // Faint vertical lines projecting forward (Z positive)
    float lineX = (lineIndex - 0.5) * 0.6;
    
    // FOV-based divergence from vanishing point
    float fovFactor = uCameraFOV / 75.0;
    float divergence = 0.2 * fovFactor;
    lineX *= (1.0 + divergence);
    
    // Scroll progress influences vertical offset
    float scrollOffset = uScroll * 0.4;
    float y = (uv.y - 0.5) * 1.0 + scrollOffset;
    
    // Z position (forward, Z positive)
    float z = 0.5 + lineIndex * 0.2;
    
    pos = vec3(lineX, y, z);
  }
  
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

