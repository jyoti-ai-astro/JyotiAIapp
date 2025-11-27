/**
 * Divine Compass Vertex Shader
 * 
 * Phase 2 — Section 27: DIVINE COMPASS ENGINE
 * Divine Compass Engine (E31)
 * 
 * Ring geometry, star geometry, arrow quad, rotationSync, scroll contraction, breath scaling, bass wobble, mid jitter, cameraFOV parallax
 */

export const compassVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;
attribute float compassRingIndex;
attribute float starIndex;
attribute float arrowIndex;
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
varying float vCompassRingIndex;
varying float vStarIndex;
varying float vArrowIndex;
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
  vCompassRingIndex = compassRingIndex;
  vStarIndex = starIndex;
  vArrowIndex = arrowIndex;
  vGlyphIndex = glyphIndex;
  
  vec3 pos = position;
  
  vec2 center = vec2(0.5, 0.5);
  vec2 toCenter = uv - center;
  float dist = length(toCenter);
  float angle = atan(toCenter.y, toCenter.x);
  
  // ============================================
  // LAYER A: OUTER SACRED COMPASS RING
  // ============================================
  if (compassRingIndex >= 0.0) {
    // 8-direction divine compass (Ashta-Dikpala)
    float ringRadius = 0.5;
    
    // Rotation synced to Projection (E17): rotation = baseRotation + uRotationSync * 0.5
    float baseRotation = 0.0;
    float compassRotation = baseRotation + uRotationSync * 0.5;
    angle += compassRotation;
    
    // Breath → expand/contract: 1.0 + uBreathStrength * 0.1
    float breathScale = 1.0 + uBreathStrength * 0.1;
    ringRadius *= breathScale;
    
    // Bass → wobble vibration on cardinal lines: sin(time*3+t*15)*uBass*0.02
    float bassWobble = sin(uTime * 3.0 + angle * 15.0) * uBass * 0.02;
    angle += bassWobble;
    
    // Convert back to cartesian
    float x = cos(angle) * dist * ringRadius;
    float y = sin(angle) * dist * ringRadius;
    
    pos = vec3(x, y, pos.z);
  }
  
  // ============================================
  // LAYER A: DIRECTION GLYPHS
  // ============================================
  if (glyphIndex >= 0.0) {
    // 8 direction glyphs placed along ring
    float glyphAngle = (glyphIndex / 8.0) * 6.28318; // 8 directions
    
    // Rotation synced to Projection (E17)
    float compassRotation = uRotationSync * 0.5;
    glyphAngle += compassRotation;
    
    // Breath → expand/contract
    float breathScale = 1.0 + uBreathStrength * 0.1;
    float glyphRadius = 0.45 * breathScale;
    
    // Position glyph along ring
    float x = cos(glyphAngle) * glyphRadius;
    float y = sin(glyphAngle) * glyphRadius;
    
    pos = vec3(x, y, pos.z);
    
    // Glyph size
    float glyphSize = 0.05;
    pos *= glyphSize;
  }
  
  // ============================================
  // LAYER B: INNER STAR PATH
  // ============================================
  if (starIndex >= 0.0) {
    // Rotating 12-point star mandala
    float starRadius = 0.35;
    
    // Rotation opposite of Layer A: starRotation = -uRotationSync * 0.3 + uTime * 0.1
    float starRotation = -uRotationSync * 0.3 + uTime * 0.1;
    angle += starRotation;
    
    // Scroll → star contraction: radius*(1.0 - uScroll * 0.2)
    float scrollContraction = 1.0 - uScroll * 0.2;
    starRadius *= scrollContraction;
    
    // Mid → turbulence jitter: fbm(uv*5 + time*0.3)*uMid*0.1
    float midJitter = fbm(uv * 5.0 + uTime * 0.3) * uMid * 0.1;
    angle += midJitter * 0.1;
    
    // Convert back to cartesian
    float x = cos(angle) * dist * starRadius;
    float y = sin(angle) * dist * starRadius;
    
    pos = vec3(x, y, pos.z);
  }
  
  // ============================================
  // LAYER C: DESTINY ARROW
  // ============================================
  if (arrowIndex >= 0.0) {
    // Glowing arrow pointer that tilts toward mouse direction
    // angle = atan(uMouse.y, uMouse.x)
    float mouseAngle = atan(uMouse.y, uMouse.x);
    
    // Arrow points toward mouse
    float arrowLength = 0.3;
    float x = cos(mouseAngle) * arrowLength;
    float y = sin(mouseAngle) * arrowLength;
    
    // Parallax depth shift using cameraFOV
    float fovFactor = uCameraFOV / 75.0;
    float depthShift = (fovFactor - 1.0) * 0.05;
    pos.z += depthShift;
    
    // Breath → pulse scale: 1.0 + uBreathStrength*0.15
    float breathPulse = 1.0 + uBreathStrength * 0.15;
    x *= breathPulse;
    y *= breathPulse;
    
    pos = vec3(x, y, pos.z);
    
    // Arrow size
    float arrowSize = 0.08;
    pos *= arrowSize;
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

