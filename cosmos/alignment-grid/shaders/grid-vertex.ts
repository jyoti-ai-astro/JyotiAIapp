/**
 * Alignment Grid Vertex Shader
 * 
 * Phase 2 — Section 22: COSMIC ALIGNMENT GRID ENGINE
 * Alignment Grid Engine (E26)
 * 
 * Large plane subdivided grid with scroll-driven tilt, breath-warp, audio displacement, grid rotation, perspective warp
 */

export const gridVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;

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
uniform float uGridRotation;
uniform float uCameraFOV;

varying vec2 vUv;
varying vec3 vPosition;
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
  vec3 pos = position;
  
  // Radial distance from center
  vRadialDistance = length(pos.xz);
  
  // ============================================
  // SCROLL-DRIVEN TILT
  // ============================================
  // uScroll * 0.5
  float tiltAngle = uScroll * 0.5;
  float cosTilt = cos(tiltAngle);
  float sinTilt = sin(tiltAngle);
  pos.xz = vec2(
    pos.x * cosTilt - pos.z * sinTilt,
    pos.x * sinTilt + pos.z * cosTilt
  );
  
  // ============================================
  // BREATH-WARP
  // ============================================
  // 1.0 + uBreathStrength * 0.05
  float breathWarp = 1.0 + uBreathStrength * 0.05;
  pos *= breathWarp;
  
  // ============================================
  // AUDIO DISPLACEMENT
  // ============================================
  // Bass → scale wobble
  float bassWobble = sin(uTime * 0.5 + pos.x * 0.1) * uBass * 0.02;
  pos *= (1.0 + bassWobble);
  
  // Mid → uv jitter
  float midJitter = fbm(pos.xy * 0.3 + uTime * 0.2) * uMid * 0.01;
  pos.xy += vec2(midJitter);
  
  // High → shimmer noise
  float highShimmer = fbm(pos.xy * 2.0 + uTime * 0.5) * uHigh * 0.005;
  pos.z += highShimmer;
  
  // ============================================
  // GRID ROTATION (from Projection E17)
  // ============================================
  float cosR = cos(uGridRotation);
  float sinR = sin(uGridRotation);
  pos.xz = vec2(
    pos.x * cosR - pos.z * sinR,
    pos.x * sinR + pos.z * cosR
  );
  
  // ============================================
  // PERSPECTIVE WARP (tied to camera FOV)
  // ============================================
  // FOV-based perspective distortion
  float fovFactor = uCameraFOV / 75.0; // Normalize to 75° default
  float perspectiveWarp = 1.0 + (fovFactor - 1.0) * 0.1;
  pos.z *= perspectiveWarp;
  
  // ============================================
  // PARALLAX WOBBLE
  // ============================================
  float wobbleX = sin(uTime * 0.2) * uMouse.x * 0.01;
  float wobbleY = cos(uTime * 0.2) * uMouse.y * 0.01;
  pos.xy += vec2(wobbleX, wobbleY) * uParallaxStrength;
  
  vPosition = pos;
  vDistance = length(pos);
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

