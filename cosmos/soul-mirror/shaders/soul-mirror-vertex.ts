/**
 * Soul Mirror Vertex Shader
 * 
 * Phase 2 — Section 26: SOUL MIRROR ENGINE
 * Soul Mirror Engine (E30)
 * 
 * Disc geometry, ripple/distortion/breath effects, echo rings, glyph quads, scroll depth drift, rotationSync, cameraFOV
 */

export const soulMirrorVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;
attribute float mirrorDiscIndex;
attribute float echoRingIndex;
attribute float glyphIndex;

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
varying float vMirrorDiscIndex;
varying float vEchoRingIndex;
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

void main() {
  vUv = uv;
  vMirrorDiscIndex = mirrorDiscIndex;
  vEchoRingIndex = echoRingIndex;
  vGlyphIndex = glyphIndex;
  
  vec3 pos = position;
  
  vec2 center = vec2(0.5, 0.5);
  vec2 toCenter = uv - center;
  float dist = length(toCenter);
  float angle = atan(toCenter.y, toCenter.x);
  
  // ============================================
  // LAYER A: CORE MIRROR DISC
  // ============================================
  if (mirrorDiscIndex >= 0.0) {
    // Large circular reflective disc (radius ~0.7)
    float discRadius = 0.7;
    
    // Angle tracks Projection rotation (E17)
    angle += uRotationSync;
    
    // Convert back to cartesian
    float x = cos(angle) * dist * discRadius;
    float y = sin(angle) * dist * discRadius;
    
    // Breath → smooth pulsing: 1.0 + uBreathStrength * 0.1
    float breathPulse = 1.0 + uBreathStrength * 0.1;
    x *= breathPulse;
    y *= breathPulse;
    
    // Bass → ripples on surface: sin(dist*15.0 + time*5.0) * uBass * 0.05
    float ripple = sin(dist * 15.0 + uTime * 5.0) * uBass * 0.05;
    float rippleOffset = ripple * 0.02;
    x += cos(angle) * rippleOffset;
    y += sin(angle) * rippleOffset;
    
    // Mid → reflective distortion: fbm(uv*3 + time*0.3) * uMid * 0.1
    float midDistortion = fbm(uv * 3.0 + uTime * 0.3) * uMid * 0.1;
    x += cos(angle) * midDistortion * 0.05;
    y += sin(angle) * midDistortion * 0.05;
    
    pos = vec3(x, y, pos.z);
  }
  
  // ============================================
  // LAYER B: ECHO REFLECTIONS
  // ============================================
  if (echoRingIndex >= 0.0) {
    // 3-5 echo rings behind mirror
    float ringRadius = 0.75 + echoRingIndex * 0.15; // Expanding rings
    
    // Scroll → spacing shift: ringRadius += uScroll * 0.2
    ringRadius += uScroll * 0.2;
    
    // Convert to cartesian
    float x = cos(angle) * ringRadius;
    float y = sin(angle) * ringRadius;
    
    pos = vec3(x, y, pos.z);
  }
  
  // ============================================
  // LAYER C: SOUL GLYPH REFLECTIONS
  // ============================================
  if (glyphIndex >= 0.0) {
    // Glyphs drift around disc using polar orbits
    float glyphOrbitRadius = 0.6;
    float glyphOrbitSpeed = uTime * 0.2;
    float glyphAngle = (glyphIndex / 12.0) * 6.28318 + glyphOrbitSpeed; // 12 glyphs max
    
    // Polar orbit
    float x = cos(glyphAngle) * glyphOrbitRadius;
    float y = sin(glyphAngle) * glyphOrbitRadius;
    
    // Breath → subtle pulsation
    float breathPulse = 1.0 + uBreathStrength * 0.05;
    x *= breathPulse;
    y *= breathPulse;
    
    pos = vec3(x, y, pos.z);
    
    // Glyph size
    float glyphSize = 0.06;
    pos *= glyphSize;
  }
  
  // ============================================
  // SCROLL → DEPTH DRIFT
  // ============================================
  pos.z += uScroll * 0.1;
  
  // ============================================
  // CAMERA FOV → PARALLAX WARP INTENSITY
  // ============================================
  float fovFactor = uCameraFOV / 75.0; // Normalize to 75
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

