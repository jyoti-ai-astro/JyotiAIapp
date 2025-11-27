/**
 * Memory Stream Vertex Shader
 * 
 * Phase 2 — Section 21: COSMIC MEMORY STREAM ENGINE
 * Memory Stream Engine (E25)
 * 
 * Particle positions, ribbon splines, glyph orbits with orbit equation, noise displacement, breath scale, scroll lift
 */

export const memoryStreamVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;
attribute float particleIndex;
attribute float ribbonIndex;
attribute float glyphIndex;
attribute float orbitSpeed;
attribute float particleSize;

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
uniform float uBlessingWaveProgress;

varying vec2 vUv;
varying vec3 vPosition;
varying float vParticleIndex;
varying float vRibbonIndex;
varying float vGlyphIndex;
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

// Phi-based spiral for ribbons
vec3 phiSpiralRibbon(float t, float ribbonId) {
  float phi = 1.618033988749895;
  float spiralRadius = 0.6;
  float spiralTurns = 2.0;
  float spiralHeight = 0.0;
  
  // Offset each ribbon
  float ribbonOffset = ribbonId * 0.3;
  
  // Angle based on phi and ribbon offset
  float angle = (t * spiralTurns + ribbonOffset) * 6.28318;
  float radius = t * spiralRadius;
  
  // X-Z plane spiral (horizontal)
  float x = cos(angle) * radius;
  float z = sin(angle) * radius;
  
  // Y position (vertical lift with scroll)
  float y = spiralHeight + t * 0.4;
  
  return vec3(x, y, z);
}

void main() {
  vUv = uv;
  vParticleIndex = particleIndex;
  vRibbonIndex = ribbonIndex;
  vGlyphIndex = glyphIndex;
  
  vec3 pos = position;
  
  // ============================================
  // LAYER A: THOUGHT PARTICLES
  // ============================================
  if (particleIndex >= 0.0) {
    // Orbit equation: rotate around Y-axis
    float orbitAngle = uTime * orbitSpeed * (1.0 + uScroll * 0.5); // Scroll → orbit speed modulation
    float orbitRadius = 0.8 + particleIndex * 0.1;
    
    // Base orbit position
    float x = cos(orbitAngle + particleIndex) * orbitRadius;
    float z = sin(orbitAngle + particleIndex) * orbitRadius;
    float y = (particleIndex - 0.5) * 0.6; // Vertical distribution
    
    // Noise displacement: fbm
    vec2 noiseCoord = vec2(particleIndex, uTime * 0.1);
    float noiseDisplacement = fbm(noiseCoord) * 0.2;
    x += noiseDisplacement;
    z += noiseDisplacement;
    y += noiseDisplacement * 0.5;
    
    // Bass → outward push (expansion)
    float bassExpansion = 1.0 + uBass * 0.3;
    x *= bassExpansion;
    z *= bassExpansion;
    
    // Breath → size modulation
    float breathScale = 1.0 + uBreathStrength * 0.2;
    pos *= breathScale * particleSize;
    
    // Scroll lift
    y += uScroll * 0.5;
    
    pos = vec3(x, y, z);
  }
  
  // ============================================
  // LAYER B: MEMORY RIBBONS
  // ============================================
  if (ribbonIndex >= 0.0) {
    // Ribbon vertices follow a spline path (phi-spiral)
    float t = uv.x; // 0 to 1 along ribbon
    vec3 splinePos = phiSpiralRibbon(t, ribbonIndex);
    
    // Motion controlled by Guru's breath (inhale = tighten, exhale = loosen)
    float breathTightness = 1.0 - uBreathStrength * 0.3; // Inhale tightens, exhale loosens
    splinePos *= breathTightness;
    
    // Scroll lift
    splinePos.y += uScroll * 0.3;
    
    // Base position from attribute + spline
    pos = position + splinePos;
    
    // Ribbon width (thin)
    float ribbonWidth = 0.02;
    pos.y += (uv.y - 0.5) * ribbonWidth;
  }
  
  // ============================================
  // LAYER C: MEMORY ECHO GLYPHS
  // ============================================
  if (glyphIndex >= 0.0) {
    // Gently orbiting quads
    float orbitAngle = uTime * 0.3 + glyphIndex * 0.5;
    float orbitRadius = 1.0;
    
    // Semi-orbit (behind Guru)
    float x = cos(orbitAngle) * orbitRadius;
    float z = sin(orbitAngle) * orbitRadius - 0.5; // Behind Guru
    float y = (glyphIndex - 0.5) * 0.4; // Vertical distribution
    
    // Scroll → vertical drift
    y += uScroll * 0.4;
    
    // Bass → scale pulse
    float bassPulse = 1.0 + uBass * 0.15;
    pos *= bassPulse;
    
    // Base position from attribute + orbit
    pos = position + vec3(x, y, z);
    
    // Glyph size
    float glyphSize = 0.15;
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

