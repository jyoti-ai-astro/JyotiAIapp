/**
 * Astral Lotus Vertex Shader
 * 
 * Phase 2 — Section 33: ASTRAL LOTUS ENGINE
 * Astral Lotus Engine (E37)
 * 
 * Outer petals, inner petals, core jewel, breath bloom pulse, scroll rotation, bass vibration, mid flutter, high edge shimmer, rotationSync, cameraFOV
 */

export const lotusVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;
attribute float outerPetalIndex;
attribute float innerPetalIndex;
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
varying float vOuterPetalIndex;
varying float vInnerPetalIndex;
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
  vOuterPetalIndex = outerPetalIndex;
  vInnerPetalIndex = innerPetalIndex;
  vCoreIndex = coreIndex;
  
  vec3 pos = position;
  
  vec2 center = vec2(0.5, 0.5);
  vec2 toCenter = uv - center;
  float dist = length(toCenter);
  float angle = atan(toCenter.y, toCenter.x);
  
  // ============================================
  // LAYER A: OUTER PETAL HALO
  // ============================================
  if (outerPetalIndex >= 0.0) {
    // 12-24 lotus petals in circular formation (mobile: 10)
    float petalAngle = (outerPetalIndex / 24.0) * 6.28318; // 24 petals max
    
    // Scroll → slow rotation: angle += uScroll*2π*0.08
    petalAngle += uScroll * 6.28318 * 0.08;
    
    // Breath → bloom pulse: scale*(1.0 + uBreathStrength*0.15)
    float breathPulse = 1.0 + uBreathStrength * 0.15;
    
    // Bass → petal vibration: sin(time*4 + petalIndex*2.5)*uBass*0.03
    float bassVibration = sin(uTime * 4.0 + outerPetalIndex * 2.5) * uBass * 0.03;
    petalAngle += bassVibration;
    
    // High → shimmer along edges (handled in fragment)
    
    // Petal length: 0.35-0.45
    float petalLength = 0.4 * breathPulse;
    
    // Petal width: 0.18
    float petalWidth = 0.18;
    
    // Position petal
    float x = cos(petalAngle) * petalLength;
    float y = sin(petalAngle) * petalLength;
    
    pos = vec3(x, y, pos.z);
    
    // Petal shape (elongated along angle)
    float petalLocalX = (uv.x - 0.5) * petalWidth;
    float petalLocalY = (uv.y - 0.5) * petalLength;
    pos.x += petalLocalX * cos(petalAngle);
    pos.y += petalLocalX * sin(petalAngle);
  }
  
  // ============================================
  // LAYER B: MIDDLE INNER PETALS
  // ============================================
  if (innerPetalIndex >= 0.0) {
    // 6-12 inner petals, tighter, more luminous (mobile: 6)
    float petalAngle = (innerPetalIndex / 12.0) * 6.28318; // 12 petals max
    
    // RotationSync → orientation sync with Projection: angle += uRotationSync*0.4
    petalAngle += uRotationSync * 0.4;
    
    // BlessingWave → bloom flash pulse (handled in fragment)
    
    // Mid → turbulence flutter: fbm(uv*5 + time*0.3)*uMid*0.08
    float midFlutter = fbm(uv * 5.0 + uTime * 0.3) * uMid * 0.08;
    petalAngle += midFlutter * 0.1;
    
    // Inner petal length: 0.25
    float petalLength = 0.25;
    
    // Inner petal width: 0.12
    float petalWidth = 0.12;
    
    // Position petal
    float x = cos(petalAngle) * petalLength;
    float y = sin(petalAngle) * petalLength;
    
    pos = vec3(x, y, pos.z);
    
    // Petal shape
    float petalLocalX = (uv.x - 0.5) * petalWidth;
    float petalLocalY = (uv.y - 0.5) * petalLength;
    pos.x += petalLocalX * cos(petalAngle);
    pos.y += petalLocalX * sin(petalAngle);
  }
  
  // ============================================
  // LAYER C: LOTUS CORE JEWEL
  // ============================================
  if (coreIndex >= 0.0) {
    // Radiant glowing orb at center
    float coreRadius = 0.08;
    
    // Breath → core pulse: (1.0 + uBreathStrength*0.18)
    float breathPulse = 1.0 + uBreathStrength * 0.18;
    coreRadius *= breathPulse;
    
    // Bass → core flicker: sin(time*6 + dist*20)*uBass*0.05
    float bassFlicker = sin(uTime * 6.0 + dist * 20.0) * uBass * 0.05;
    coreRadius += bassFlicker * 0.02;
    
    // High → bright shimmer noise (handled in fragment)
    
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

