/**
 * Astral Mandala Vertex Shader
 * 
 * Phase 2 — Section 34: ASTRAL MANDALA ENGINE
 * Astral Mandala Engine (E38)
 * 
 * Concentric rings, glyph quads, seed core, breath expansion pulse, scroll rotation, bass harmonic wobble, mid turbulence, high shimmer, rotationSync, cameraFOV
 */

export const mandalaVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;
attribute float ringIndex;
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
varying float vRingIndex;
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
  vRingIndex = ringIndex;
  vGlyphIndex = glyphIndex;
  vCoreIndex = coreIndex;
  
  vec3 pos = position;
  
  vec2 center = vec2(0.5, 0.5);
  vec2 toCenter = uv - center;
  float dist = length(toCenter);
  float angle = atan(toCenter.y, toCenter.x);
  
  // ============================================
  // LAYER A: ROTATING SACRED RINGS
  // ============================================
  if (ringIndex >= 0.0) {
    // 3-5 concentric rings with geometric subdivisions (mobile: 3)
    // Ring radii: 0.4, 0.55, 0.7, 0.85 (as needed)
    float ringRadius = 0.4 + ringIndex * 0.15; // 0.4, 0.55, 0.7, 0.85
    
    // Breath → expansion pulse: radius *= (1.0 + uBreathStrength * 0.12)
    float breathPulse = 1.0 + uBreathStrength * 0.12;
    ringRadius *= breathPulse;
    
    // Scroll → rotation speed: angle += uScroll * 2π * ringSpeed
    float ringSpeed = 0.1 + ringIndex * 0.05; // Different speeds per ring
    angle += uScroll * 6.28318 * ringSpeed;
    
    // Bass → harmonic wobble: sin(time*4 + segmentIndex*3)*uBass*0.03
    float segmentIndex = dist * 64.0; // Approximate segment index
    float bassWobble = sin(uTime * 4.0 + segmentIndex * 3.0) * uBass * 0.03;
    angle += bassWobble;
    
    // High → shimmering golden nodes (handled in fragment)
    
    // Convert back to cartesian
    float x = cos(angle) * dist * ringRadius;
    float y = sin(angle) * dist * ringRadius;
    
    pos = vec3(x, y, pos.z);
  }
  
  // ============================================
  // LAYER B: MANDALA GLYPH LAYER
  // ============================================
  if (glyphIndex >= 0.0) {
    // 12-24 glyph symbols placed radially (mobile: 12)
    float glyphAngle = (glyphIndex / 24.0) * 6.28318; // 24 glyphs max
    
    // RotationSync → global mandala rotation: angle += uRotationSync * 0.5
    glyphAngle += uRotationSync * 0.5;
    
    // BlessingWave → glyph glow burst (handled in fragment)
    
    // Mid → glyph turbulence jitter: fbm(uv*6 + time*0.3)*uMid*0.08
    float midJitter = fbm(uv * 6.0 + uTime * 0.3) * uMid * 0.08;
    glyphAngle += midJitter * 0.1;
    
    // Glyph size: 0.08-0.12 radius quads
    float glyphRadius = 0.1;
    float glyphDistance = 0.6; // Distance from center
    
    // Position glyph
    float x = cos(glyphAngle) * glyphDistance;
    float y = sin(glyphAngle) * glyphDistance;
    
    pos = vec3(x, y, pos.z);
    
    // Glyph size
    pos *= glyphRadius;
  }
  
  // ============================================
  // LAYER C: COSMIC SEED CORE
  // ============================================
  if (coreIndex >= 0.0) {
    // Central seed-of-life sphere
    float coreRadius = 0.1;
    
    // Breath → core pulse: (1.0 + uBreathStrength * 0.18)
    float breathPulse = 1.0 + uBreathStrength * 0.18;
    coreRadius *= breathPulse;
    
    // Bass → radial flicker: sin(time*5 + dist*15)*uBass*0.05
    float bassFlicker = sin(uTime * 5.0 + dist * 15.0) * uBass * 0.05;
    coreRadius += bassFlicker * 0.02;
    
    // High → shimmer texture (handled in fragment)
    
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

