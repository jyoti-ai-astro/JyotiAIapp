/**
 * Path Indicator Vertex Shader
 * 
 * Phase 2 — Section 20: DIVINE PATH INDICATOR ENGINE
 * Path Indicator Engine (E24)
 * 
 * Position each bead along a curved spline (phi-based spiral or bezier), scroll-driven lift, breath pulsing, audio distortion, parallax wobble
 */

export const pathVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;
attribute float beadIndex;

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
uniform float uPathRotation; // Mandala-alignment from Projection (E17)

varying vec2 vUv;
varying vec3 vPosition;
varying float vBeadIndex;
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

// Phi-based spiral spline (golden ratio)
vec3 phiSpiralSpline(float t) {
  // t: 0.0 to 1.0 (normalized along path)
  // Phi = 1.618033988749895
  float phi = 1.618033988749895;
  
  // Spiral parameters
  float spiralRadius = 0.8;
  float spiralTurns = 1.5;
  float spiralHeight = -0.5;
  
  // Angle based on phi
  float angle = t * spiralTurns * 6.28318; // 2π * turns
  float radius = t * spiralRadius;
  
  // X-Z plane spiral (horizontal)
  float x = cos(angle) * radius;
  float z = sin(angle) * radius;
  
  // Y position (vertical lift with scroll)
  float y = spiralHeight + t * 0.3;
  
  return vec3(x, y, z);
}

// Bezier curve alternative (smooth curved path)
vec3 bezierSpline(float t) {
  // Control points for smooth curve
  vec3 p0 = vec3(-0.6, -0.5, 0.0);
  vec3 p1 = vec3(-0.2, -0.3, -0.3);
  vec3 p2 = vec3(0.2, -0.1, -0.5);
  vec3 p3 = vec3(0.6, 0.1, -0.7);
  
  // Cubic Bezier
  float t2 = t * t;
  float t3 = t2 * t;
  float mt = 1.0 - t;
  float mt2 = mt * mt;
  float mt3 = mt2 * mt;
  
  return mt3 * p0 + 3.0 * mt2 * t * p1 + 3.0 * mt * t2 * p2 + t3 * p3;
}

void main() {
  vUv = uv;
  vBeadIndex = beadIndex;
  
  // Get base position from attribute
  vec3 basePos = position;
  
  // ============================================
  // SPLINE PATH POSITIONING
  // ============================================
  // Normalize beadIndex to 0-1 (assuming 20 beads)
  float t = beadIndex / 20.0;
  
  // Use phi-based spiral for elegant path
  vec3 splinePos = phiSpiralSpline(t);
  
  // Apply mandala-alignment rotation (from Projection E17)
  float cosR = cos(uPathRotation);
  float sinR = sin(uPathRotation);
  vec2 rotatedXY = vec2(
    splinePos.x * cosR - splinePos.z * sinR,
    splinePos.x * sinR + splinePos.z * cosR
  );
  splinePos.xz = rotatedXY;
  
  // Combine base position with spline
  vec3 pos = basePos + splinePos;
  
  // ============================================
  // SCROLL-DRIVEN LIFT (Slow upward drift)
  // ============================================
  pos.y += uScroll * 0.3;
  
  // ============================================
  // BREATH → BEAD PULSING SCALE
  // ============================================
  float breathPulse = 1.0 + uBreathStrength * 0.15;
  pos *= breathPulse;
  
  // ============================================
  // BASS/MID DISTORTION FOR DYNAMIC MOTION
  // ============================================
  // Bass distortion (slow, large)
  float bassDistortion = sin(uTime * 0.5 + t * 5.0) * uBass * 0.05;
  
  // Mid distortion (medium speed)
  float midDistortion = fbm(pos.xy * 0.5 + uTime * 0.3) * uMid * 0.03;
  
  // Combine distortions
  pos += vec3(bassDistortion, 0.0, midDistortion);
  
  // ============================================
  // PARALLAX WOBBLE BASED ON MOUSE MOVEMENT
  // ============================================
  float wobbleX = sin(uTime * 0.2 + t * 3.0) * uMouse.x * 0.01;
  float wobbleY = cos(uTime * 0.2 + t * 3.0) * uMouse.y * 0.01;
  pos.xy += vec2(wobbleX, wobbleY) * uParallaxStrength;
  
  vPosition = pos;
  vDistance = length(pos);
  vRadialDistance = length(pos.xz);
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

