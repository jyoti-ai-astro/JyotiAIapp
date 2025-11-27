/**
 * Stellar Wind Vertex Shader
 * 
 * Phase 2 — Section 46: STELLAR WIND SHEAR ENGINE
 * Stellar Wind Engine (E50)
 * 
 * High-altitude wind sheets, cross-wind ribbons, wind dust streams, breath pulse, scroll speed-up, bass jitter, high shimmer, cameraFOV
 */

export const stellarWindVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;
attribute float windSheetIndex;
attribute float ribbonIndex;
attribute float dustIndex;

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
varying float vWindSheetIndex;
varying float vRibbonIndex;
varying float vDustIndex;
varying float vDistance;
varying float vRadialDistance;
varying float vWindHeight;
varying float vGradientProgress;

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

// ============================================
// WIND DISTORTION FUNCTION
// ============================================
float windDistortion(vec2 xz, float time) {
  // Wind distortion:
  // windX = sin(x * 0.5 + time * 1.2) * 0.15
  // windY = sin(z * 0.4 + time * 0.9) * 0.1
  // windNoise = fbm(uv * 3.0 + time * 0.4) * 0.12
  // combined = windX + windY + windNoise
  float windX = sin(xz.x * 0.5 + time * 1.2) * 0.15;
  float windY = sin(xz.y * 0.4 + time * 0.9) * 0.1;
  float windNoise = fbm(xz * 3.0 + time * 0.4) * 0.12;
  
  return windX + windY + windNoise;
}

// ============================================
// RIBBON FUNCTION
// ============================================
float ribbonFunction(vec2 xz, float time, float rotationSync) {
  // Equation:
  // ribbon = sin((x+z) * 1.2 + time * 2.2) * 0.12
  float baseRibbon = sin((xz.x + xz.y) * 1.2 + time * 2.2) * 0.12;
  
  // RotationSync → directional skew
  float skew = rotationSync * 0.4;
  baseRibbon += sin((xz.x - xz.y) * 0.8 + time * 1.5) * skew * 0.05;
  
  return baseRibbon;
}

void main() {
  vUv = uv;
  vWindSheetIndex = windSheetIndex;
  vRibbonIndex = ribbonIndex;
  vDustIndex = dustIndex;
  
  vec3 pos = position;
  
  // ============================================
  // LAYER A: HIGH-ALTITUDE WIND SHEETS
  // ============================================
  if (windSheetIndex >= 0.0) {
    // Two massive diagonal wind sheets
    // Dimensions: 26 × 14 units, grid 48×48
    float sheetWidth = 26.0;
    float sheetHeight = 14.0;
    
    vec2 xz = vec2((uv.x - 0.5) * sheetWidth, (uv.y - 0.5) * sheetHeight);
    
    // Sample wind distortion
    float baseWind = windDistortion(xz, uTime);
    
    // Breath → amplitude boost
    float breathAmplitude = 1.0 + uBreathStrength * 0.2;
    baseWind *= breathAmplitude;
    
    // Scroll → directional speed-up
    float scrollSpeed = 1.0 + uScroll * 0.3;
    baseWind *= scrollSpeed;
    
    // Bass → jitter vibration
    float bassJitter = sin(uTime * 4.0 + xz.x * 0.8) * uBass * 0.02;
    xz.x += bassJitter;
    xz.y += bassJitter * 0.5;
    
    // High → shimmer pulses (handled in fragment)
    
    // Position with wind displacement
    pos = vec3(xz.x, baseWind, xz.y - 6.7);
    
    vWindHeight = baseWind;
    vGradientProgress = (baseWind + 0.2) / 0.4; // Normalize to 0-1
  }
  
  // ============================================
  // LAYER B: CROSS-WIND RIBBONS
  // ============================================
  if (ribbonIndex >= 0.0) {
    // Fast-moving thin ribbons
    float sheetWidth = 26.0;
    float sheetHeight = 14.0;
    
    vec2 xz = vec2((uv.x - 0.5) * sheetWidth, (uv.y - 0.5) * sheetHeight);
    
    // Sample ribbon
    float baseRibbon = ribbonFunction(xz, uTime, uRotationSync);
    
    // Breath → amplitude broadening
    float breathBroadening = 1.0 + uBreathStrength * 0.15;
    baseRibbon *= breathBroadening;
    
    // Mid → turbulence via fbm
    float midTurbulence = fbm(xz * 2.5 + uTime * 0.3) * uMid * 0.04;
    baseRibbon += midTurbulence;
    
    // High → spectral shimmer (handled in fragment)
    
    // Position with ribbon displacement
    pos = vec3(xz.x, baseRibbon, xz.y - 6.7);
    
    vWindHeight = baseRibbon;
  }
  
  // ============================================
  // LAYER C: WIND DUST STREAMS
  // ============================================
  if (dustIndex >= 0.0) {
    // 160-260 micro dust particles (mobile: 110)
    // Drift direction: diagonal (x+, y+, z-)
    // x = baseX + (time * speed * 0.8)
    // y = baseY + (time * speed * 0.3)
    // z = baseZ - (time * speed * 0.6)
    
    // Breath → vertical modulation
    float breathModulation = 1.0 + uBreathStrength * 0.15;
    
    float speed = 0.2 + (dustIndex / 260.0) * 0.15; // Varying speeds
    float baseX = (dustIndex / 260.0) * 26.0 - 13.0; // Spread across X
    float baseY = 0.0;
    float baseZ = -6.7;
    
    // Diagonal drift
    float driftX = uTime * speed * 0.8;
    float driftY = uTime * speed * 0.3;
    float driftZ = -uTime * speed * 0.6;
    
    // Loop using mod() across XZ
    float x = mod(baseX + driftX + 13.0, 26.0) - 13.0;
    float y = baseY + driftY * breathModulation;
    float z = mod(baseZ + driftZ + 7.0, 14.0) - 7.0;
    
    // Bass → flicker jitter
    float bassJitter = sin(uTime * 3.0 + dustIndex * 2.0) * uBass * 0.01;
    x += bassJitter;
    y += bassJitter * 0.3;
    z += bassJitter * 0.5;
    
    // High → sparkle noise (handled in fragment)
    
    // Radius: 0.01-0.015
    float dustRadius = 0.0125;
    
    pos = vec3(x, y, z);
    pos *= dustRadius; // Scale particle size
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

