/**
 * Karmic Thread Vertex Shader
 * 
 * Phase 2 — Section 25: COSMIC KARMIC THREAD ENGINE
 * Karmic Thread Engine (E29)
 * 
 * Build spline for each thread, scroll vertical drift, breath width modulation, bass vibration, mid turbulence, rotationSync
 */

export const karmicThreadVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;
attribute float rootThreadIndex;
attribute float parallelThreadIndex;
attribute float glyphIndex;
attribute float threadT; // Position along thread (0-1)

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
varying float vRootThreadIndex;
varying float vParallelThreadIndex;
varying float vGlyphIndex;
varying float vThreadT;
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

// Phi (golden ratio)
#define PHI 1.618033988749895

// Spline for root thread
vec3 rootThreadSpline(float t) {
  // Vertical thread extending behind Guru
  float x = 0.0; // Centered
  float y = -0.5 + t * 1.5; // Extends vertically
  float z = -2.0; // Behind Guru
  
  // Scroll → subtle sway: uScroll * 0.1
  float scrollSway = sin(t * 3.14159) * uScroll * 0.1;
  x += scrollSway;
  
  // Apply rotationSync from Projection (E17) for mandala-alignment
  float cosR = cos(uRotationSync);
  float sinR = sin(uRotationSync);
  vec2 rotatedXY = vec2(
    x * cosR - z * sinR,
    x * sinR + z * cosR
  );
  x = rotatedXY.x;
  z = rotatedXY.y;
  
  return vec3(x, y, z);
}

// Spline for parallel threads
vec3 parallelThreadSpline(float t, float threadId) {
  // Base position from root thread
  vec3 rootPos = rootThreadSpline(t);
  
  // Diverge from root thread along phi offsets: xOffset = sin(t*φ) * 0.15
  float phiOffset = sin(t * PHI) * 0.15;
  float xOffset = phiOffset * (threadId - 0.5) * 2.0; // Spread threads
  
  rootPos.x += xOffset;
  
  return rootPos;
}

void main() {
  vUv = uv;
  vRootThreadIndex = rootThreadIndex;
  vParallelThreadIndex = parallelThreadIndex;
  vGlyphIndex = glyphIndex;
  vThreadT = threadT;
  
  vec3 pos = position;
  
  // ============================================
  // LAYER A: ROOT KARMIC THREAD
  // ============================================
  if (rootThreadIndex >= 0.0) {
    // Spline-based curve
    vec3 splinePos = rootThreadSpline(threadT);
    
    // Scroll → vertical drift
    splinePos.y += uScroll * 0.3;
    
    // Breath → width modulation (handled in fragment for thickness)
    // Bass → periodic vibration: sin(time*2.5 + t*20.0) * uBass * 0.02
    float bassVibration = sin(uTime * 2.5 + threadT * 20.0) * uBass * 0.02;
    splinePos.x += bassVibration;
    
    // Mid → turbulence offsets: fbm(uv*8 + time*0.4) * uMid * 0.02
    float midTurbulence = fbm(uv * 8.0 + uTime * 0.4) * uMid * 0.02;
    splinePos.xy += vec2(midTurbulence);
    
    pos = splinePos;
    
    // Thread width (thin)
    float threadWidth = 0.01;
    pos.x += (uv.x - 0.5) * threadWidth;
  }
  
  // ============================================
  // LAYER B: PARALLEL DESTINY THREADS
  // ============================================
  if (parallelThreadIndex >= 0.0) {
    // Spline-based curve with phi offsets
    vec3 splinePos = parallelThreadSpline(threadT, parallelThreadIndex);
    
    // Scroll → vertical drift
    splinePos.y += uScroll * 0.3;
    
    // Mid → turbulence wiggle: fbm(uv*8 + time*0.4) * uMid * 0.02
    float midWiggle = fbm(uv * 8.0 + uTime * 0.4) * uMid * 0.02;
    splinePos.xy += vec2(midWiggle);
    
    pos = splinePos;
    
    // Thread width (thinner than root)
    float threadWidth = 0.008;
    pos.x += (uv.x - 0.5) * threadWidth;
  }
  
  // ============================================
  // LAYER C: KARMIC KNOT GLYPHS
  // ============================================
  if (glyphIndex >= 0.0) {
    // Glyphs attach at specific t positions along root
    float glyphT = glyphIndex / 10.0; // 0 to 1
    vec3 rootPos = rootThreadSpline(glyphT);
    
    // Float gently outward and inward: sin(time + glyphIndex) * 0.05
    float floatOffset = sin(uTime + glyphIndex) * 0.05;
    rootPos.x += floatOffset;
    
    // Scroll → vertical drift
    rootPos.y += uScroll * 0.3;
    
    pos = rootPos;
    
    // Glyph size
    float glyphSize = 0.08;
    pos *= glyphSize;
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

