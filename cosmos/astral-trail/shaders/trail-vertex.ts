/**
 * Astral Trail Vertex Shader
 * 
 * Phase 2 — Section 28: ASTRAL TRAIL ENGINE
 * Astral Trail Engine (E32)
 * 
 * Particle system geometry, ribbon spline geometry, echo lines, scroll stretch, breath scaling, bass/mid distortion, rotationSync twist, cameraFOV parallax
 */

export const trailVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;
attribute float particleIndex;
attribute float ribbonIndex;
attribute float echoLineIndex;
attribute float trailT; // Position along trail (0-1)

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
varying float vParticleIndex;
varying float vRibbonIndex;
varying float vEchoLineIndex;
varying float vTrailT;
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

// Direction vector = scroll + mouse + globalMotion
vec2 computeTrailDirection() {
  // Scroll contribution
  float scrollX = sin(uScroll * 6.28318) * 0.3;
  float scrollY = uScroll * 0.5;
  
  // Mouse contribution
  float mouseX = uMouse.x * 0.2;
  float mouseY = uMouse.y * 0.2;
  
  // Combined direction
  vec2 direction = vec2(scrollX + mouseX, scrollY + mouseY);
  return normalize(direction);
}

void main() {
  vUv = uv;
  vParticleIndex = particleIndex;
  vRibbonIndex = ribbonIndex;
  vEchoLineIndex = echoLineIndex;
  vTrailT = trailT;
  
  vec3 pos = position;
  
  // ============================================
  // LAYER A: ASTRAL PARTICLES TRAIL
  // ============================================
  if (particleIndex >= 0.0) {
    // Particles drifting behind Guru's movement direction
    vec2 trailDirection = computeTrailDirection();
    
    // Position along trail
    float t = trailT;
    vec2 trailPos = trailDirection * t * 1.5; // Trail extends 1.5 units
    
    // Bass → outward energy burst: positionDistort += uBass*0.2
    float bassDistort = uBass * 0.2;
    vec2 perpendicular = vec2(-trailDirection.y, trailDirection.x);
    trailPos += perpendicular * bassDistort * (t - 0.5) * 2.0;
    
    // Breath → size pulse: size*(1.0 + uBreathStrength*0.15)
    float breathPulse = 1.0 + uBreathStrength * 0.15;
    
    // High → shimmer flicker on particle edges (noise-based offset)
    float shimmerOffset = fbm(vec2(particleIndex, uTime)) * uHigh * 0.05;
    trailPos += shimmerOffset;
    
    pos = vec3(trailPos.x, trailPos.y, pos.z);
    
    // Particle size
    float particleSize = 0.03 * breathPulse;
    pos *= particleSize;
  }
  
  // ============================================
  // LAYER B: ASTRAL RIBBON STREAM
  // ============================================
  if (ribbonIndex >= 0.0) {
    // Fluid ribbon that follows Guru path direction
    vec2 trailDirection = computeTrailDirection();
    
    // Position along ribbon spline
    float t = trailT;
    vec2 ribbonPos = trailDirection * t * 2.0; // Ribbon extends 2.0 units
    
    // Scroll → stretching: length*(1.0 + uScroll*0.3)
    float scrollStretch = 1.0 + uScroll * 0.3;
    ribbonPos *= scrollStretch;
    
    // RotationSync from Projection (E17) applies slight twisting
    float twistAngle = uRotationSync * 0.2 * t;
    float cosT = cos(twistAngle);
    float sinT = sin(twistAngle);
    ribbonPos = vec2(
      ribbonPos.x * cosT - ribbonPos.y * sinT,
      ribbonPos.x * sinT + ribbonPos.y * cosT
    );
    
    // Mid → turbulence wobble: fbm(uv*5 + time*0.2)*uMid*0.1
    float midWobble = fbm(uv * 5.0 + uTime * 0.2) * uMid * 0.1;
    ribbonPos += vec2(midWobble);
    
    pos = vec3(ribbonPos.x, ribbonPos.y, pos.z);
    
    // Ribbon width
    float ribbonWidth = 0.02;
    pos.x += (uv.x - 0.5) * ribbonWidth;
  }
  
  // ============================================
  // LAYER C: QUANTUM ECHO LINES
  // ============================================
  if (echoLineIndex >= 0.0) {
    // Faint lines that show past motion trajectory
    vec2 trailDirection = computeTrailDirection();
    
    // Position along echo line
    float t = trailT;
    vec2 echoPos = trailDirection * t * 1.2; // Echo lines extend 1.2 units
    
    // Bass → line jitter vibration
    float bassJitter = sin(uTime * 4.0 + t * 10.0) * uBass * 0.05;
    vec2 perpendicular = vec2(-trailDirection.y, trailDirection.x);
    echoPos += perpendicular * bassJitter;
    
    // CameraFOV → depth divergence
    float fovFactor = uCameraFOV / 75.0;
    float depthDivergence = (fovFactor - 1.0) * 0.1 * t;
    pos.z += depthDivergence;
    
    pos = vec3(echoPos.x, echoPos.y, pos.z);
    
    // Line width
    float lineWidth = 0.01;
    pos.x += (uv.x - 0.5) * lineWidth;
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

