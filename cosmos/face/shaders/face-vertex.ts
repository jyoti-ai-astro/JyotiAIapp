/**
 * Face Vertex Shader
 * 
 * Phase 2 — Section 17: DYNAMIC AVATAR FACE ENGINE
 * Dynamic Avatar Face Engine (E21)
 * 
 * Micro-deformation, breath-driven oscillation, scroll-driven tilt, audio-driven distortion, parallax wobble
 */

export const faceVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;
attribute vec3 normal;

uniform float uTime;
uniform float uBreathPhase;
uniform float uBrow;
uniform float uEye;
uniform float uCheek;
uniform float uMouthCurve;
uniform float uGlow;
uniform float uBass;
uniform float uMid;
uniform float uHigh;
uniform float uScroll;
uniform float uScrollVelocity;
uniform float uScrollDirection;
uniform vec2 uMouse;
uniform float uIntensity;
uniform float uParallaxStrength;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying float vDistance;
varying float vExpressionIntensity;

// Noise functions
float hash(float n) {
  return fract(sin(n) * 43758.5453123);
}

float noise(float x) {
  float i = floor(x);
  float f = fract(x);
  return mix(hash(i), hash(i + 1.0), smoothstep(0.0, 1.0, f));
}

float fbm(float p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 3; i++) {
    value += amplitude * noise(p);
    p *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vUv = uv;
  vNormal = normal;
  vec3 pos = position;
  
  // ============================================
  // MICRO-DEFORMATION (Expression-based)
  // ============================================
  // Brow deformation
  float browDeform = uBrow * 0.1;
  if (uv.y > 0.6) { // Upper face region
    pos.y += browDeform;
  }
  
  // Eye deformation
  float eyeDeform = (1.0 - uEye) * 0.15;
  if (uv.y > 0.4 && uv.y < 0.6 && abs(uv.x - 0.5) < 0.2) { // Eye region
    pos.z -= eyeDeform;
  }
  
  // Cheek deformation
  float cheekDeform = uCheek * 0.2;
  if (uv.y < 0.5 && abs(uv.x - 0.5) < 0.3) { // Cheek region
    pos += normal * cheekDeform;
  }
  
  // Mouth curve deformation
  float mouthDeform = uMouthCurve * 0.1;
  if (uv.y < 0.3) { // Mouth region
    pos.y += mouthDeform * sin((uv.x - 0.5) * 3.14159);
  }
  
  // ============================================
  // BREATH-DRIVEN OSCILLATION
  // ============================================
  float breath = sin(uBreathPhase * 3.14159 * 2.0) * 0.5 + 0.5;
  float breathScale = 1.0 + breath * 0.02;
  pos *= breathScale;
  
  // ============================================
  // SCROLL-DRIVEN TILT
  // ============================================
  // Scroll depth zones → face tilt
  float tiltAmount = (uScroll - 0.5) * 0.1; // -0.05 to 0.05
  pos.x += tiltAmount;
  
  // Scroll velocity → micro-tilt shake
  float shakeAmount = uScrollVelocity * 0.01;
  pos.x += shakeAmount;
  
  // Scroll direction → left/right 2° bias
  float directionBias = uScrollDirection * 0.035; // ~2 degrees
  pos.x += directionBias;
  
  // ============================================
  // AUDIO-DRIVEN DISTORTION
  // ============================================
  // Bass → cheek expansion micro-pulse
  float bassPulse = uBass * 0.05;
  if (uv.y < 0.5) {
    pos += normal * bassPulse;
  }
  
  // Mid → brow tension oscillation
  float browTension = sin(uTime * 5.0) * uMid * 0.02;
  if (uv.y > 0.6) {
    pos.y += browTension;
  }
  
  // High → micro shimmer (subtle jitter)
  float shimmer = fbm(uTime * 10.0 + uv.x * 5.0) * uHigh * 0.01;
  pos += normal * shimmer;
  
  // ============================================
  // PARALLAX WOBBLE FROM MOUSE
  // ============================================
  float wobbleX = sin(uTime * 0.3 + pos.x * 0.1) * uMouse.x * 0.01;
  float wobbleY = cos(uTime * 0.3 + pos.y * 0.1) * uMouse.y * 0.01;
  pos.xy += vec2(wobbleX, wobbleY) * uParallaxStrength;
  
  vPosition = pos;
  vDistance = length(pos);
  vExpressionIntensity = uGlow;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

