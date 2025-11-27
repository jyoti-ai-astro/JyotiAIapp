/**
 * Karma Wheel Vertex Shader
 * 
 * Phase 2 — Section 36: KARMA WHEEL ENGINE
 * Karma Wheel Engine (E40)
 * 
 * Outer ring, glyph quads, core disc, breath expansion, scroll rotation, bass wobble, mid jitter, rotationSync, cameraFOV
 */

export const karmaVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;
attribute float outerRingIndex;
attribute float glyphIndex;
attribute float coreIndex;

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
varying float vOuterRingIndex;
varying float vGlyphIndex;
varying float vCoreIndex;
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
  vOuterRingIndex = outerRingIndex;
  vGlyphIndex = glyphIndex;
  vCoreIndex = coreIndex;
  
  vec3 pos = position;
  
  vec2 center = vec2(0.5, 0.5);
  vec2 toCenter = uv - center;
  float dist = length(toCenter);
  float angle = atan(toCenter.y, toCenter.x);
  
  // ============================================
  // LAYER A: OUTER WHEEL OF INTENT
  // ============================================
  if (outerRingIndex >= 0.0) {
    // Large 32-48 segment ring (mobile: 28)
    float ringRadius = 0.9;
    
    // Breath → radius expansion: radius *= (1 + uBreathStrength * 0.12)
    float breathExpansion = 1.0 + uBreathStrength * 0.12;
    ringRadius *= breathExpansion;
    
    // Scroll → rotation speed: angle += uScroll * 2π * 0.15
    angle += uScroll * 6.28318 * 0.15;
    
    // Bass → harmonic wobble: sin(time*4 + segIndex*2)*uBass*0.03
    float segIndex = dist * 48.0; // Approximate segment index
    float bassWobble = sin(uTime * 4.0 + segIndex * 2.0) * uBass * 0.03;
    angle += bassWobble;
    
    // High → shimmer nodes along edge (handled in fragment)
    
    // Convert back to cartesian
    float x = cos(angle) * dist * ringRadius;
    float y = sin(angle) * dist * ringRadius;
    
    pos = vec3(x, y, pos.z);
  }
  
  // ============================================
  // LAYER B: MIDDLE WHEEL OF ACTION
  // ============================================
  if (glyphIndex >= 0.0) {
    // 12-20 rotating glyph icons (mobile: 10)
    float glyphAngle = (glyphIndex / 20.0) * 6.28318; // 20 glyphs max
    
    // RotationSync → glyph rotation: angle += uRotationSync * 0.6
    glyphAngle += uRotationSync * 0.6;
    
    // Scroll → spiral outward: radius*(1 + uScroll*0.2)
    float scrollOutward = 1.0 + uScroll * 0.2;
    float glyphDistance = 0.65 * scrollOutward;
    
    // Mid → turbulence jitter: fbm(uv*6 + time*0.3)*uMid*0.08
    float midJitter = fbm(uv * 6.0 + uTime * 0.3) * uMid * 0.08;
    glyphAngle += midJitter * 0.1;
    
    // Glyph radius: 0.08
    float glyphRadius = 0.08;
    
    // Position glyph
    float x = cos(glyphAngle) * glyphDistance;
    float y = sin(glyphAngle) * glyphDistance;
    
    pos = vec3(x, y, pos.z);
    
    // Glyph size
    pos *= glyphRadius;
  }
  
  // ============================================
  // LAYER C: INNER WHEEL OF CONSEQUENCE
  // ============================================
  if (coreIndex >= 0.0) {
    // Central mandala disc (seed-like)
    float coreRadius = 0.22;
    
    // Breath → core pulse: 1 + uBreathStrength*0.18
    float breathPulse = 1.0 + uBreathStrength * 0.18;
    coreRadius *= breathPulse;
    
    // Bass → flicker: sin(time*6 + dist*20)*uBass*0.04
    float bassFlicker = sin(uTime * 6.0 + dist * 20.0) * uBass * 0.04;
    coreRadius += bassFlicker * 0.02;
    
    // High → shimmering texture (handled in fragment)
    
    // Convert back to cartesian
    float x = cos(angle) * dist * coreRadius;
    float y = sin(angle) * dist * coreRadius;
    
    pos = vec3(x, y, pos.z);
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

