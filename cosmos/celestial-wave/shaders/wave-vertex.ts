/**
 * Celestial Wave Vertex Shader
 * 
 * Phase 2 — Section 42: CELESTIAL WAVE ENGINE
 * Celestial Wave Engine (E46)
 * 
 * Primary astral wave field, secondary cross-wave layer, wave mist particles, breath pulse, scroll drift, bass ripple, high shimmer, cameraFOV
 */

export const waveVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;
attribute float waveIndex;
attribute float crossWaveIndex;
attribute float mistIndex;

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
varying float vWaveIndex;
varying float vCrossWaveIndex;
varying float vMistIndex;
varying float vDistance;
varying float vRadialDistance;
varying float vWaveHeight;
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
// PRIMARY WAVE HEIGHT FUNCTION
// ============================================
float primaryWaveHeight(vec2 xz, float time) {
  // Horizontal waves using sin + fbm
  float wave1 = sin(xz.x * 0.5 + time * 0.4) * 0.12;
  float wave2 = sin(xz.y * 0.4 + time * 0.25) * 0.08;
  float wave3 = fbm(vec2(xz.x * 0.3, xz.y * 0.3)) * 0.05;
  
  return wave1 + wave2 + wave3;
}

// ============================================
// SECONDARY CROSS-WAVE HEIGHT FUNCTION
// ============================================
float secondaryWaveHeight(vec2 xz, float time, float rotationSync) {
  // Perpendicular wave pattern
  float waveB = sin(xz.y * 0.7 + time * 0.6 + rotationSync * 0.5) * 0.08;
  return waveB;
}

void main() {
  vUv = uv;
  vWaveIndex = waveIndex;
  vCrossWaveIndex = crossWaveIndex;
  vMistIndex = mistIndex;
  
  vec3 pos = position;
  
  // ============================================
  // LAYER A: PRIMARY ASTRAL WAVE FIELD
  // ============================================
  if (waveIndex >= 0.0) {
    // Massive plane: 20 × 12 units
    float planeWidth = 20.0;
    float planeHeight = 12.0;
    
    vec2 xz = vec2((uv.x - 0.5) * planeWidth, (uv.y - 0.5) * planeHeight);
    
    // Breath → wave amplitude pulse (0.12 → 0.20)
    float breathAmplitude = 1.0 + uBreathStrength * 0.4;
    
    // Scroll → wave direction drift
    float scrollDrift = uScroll * 0.2;
    xz += vec2(scrollDrift, scrollDrift * 0.5);
    
    // Sample primary wave height
    float baseHeight = primaryWaveHeight(xz, uTime);
    
    // Bass → wave ripple vibration
    float bassRipple = sin(uTime * 3.0 + xz.x * 0.8) * uBass * 0.02;
    baseHeight += bassRipple;
    
    // Apply breath amplitude
    baseHeight *= breathAmplitude;
    
    // High → shimmer noise (handled in fragment)
    
    // Position with wave displacement
    pos = vec3(xz.x, baseHeight, xz.y - 6.4);
    
    vWaveHeight = baseHeight;
    vGradientProgress = (baseHeight + 0.2) / 0.4; // Normalize to 0-1
  }
  
  // ============================================
  // LAYER B: SECONDARY CROSS-WAVE LAYER
  // ============================================
  if (crossWaveIndex >= 0.0) {
    // Perpendicular wave pattern
    float planeWidth = 20.0;
    float planeHeight = 12.0;
    
    vec2 xz = vec2((uv.x - 0.5) * planeWidth, (uv.y - 0.5) * planeHeight);
    
    // RotationSync → wave rotation offset
    float rotationOffset = uRotationSync * 0.5;
    
    // Breath → mild amplitude boost
    float breathBoost = 1.0 + uBreathStrength * 0.15;
    
    // Sample secondary cross-wave height
    float crossHeight = secondaryWaveHeight(xz, uTime, rotationOffset);
    
    // Mid → turbulence noise (fbm)
    float midTurbulence = fbm(vec2(xz.x * 0.4, xz.y * 0.4) + uTime * 0.2) * uMid * 0.03;
    crossHeight += midTurbulence;
    
    // Apply breath boost
    crossHeight *= breathBoost;
    
    // High → shimmer pulses (handled in fragment)
    
    // Position with cross-wave displacement
    pos = vec3(xz.x, crossHeight, xz.y - 6.4);
    
    vWaveHeight = crossHeight;
  }
  
  // ============================================
  // LAYER C: WAVE MIST PARTICLES
  // ============================================
  if (mistIndex >= 0.0) {
    // 80-140 floating mist sprites (mobile: 60)
    // Drift above wave surface (Y = waveHeight + offset)
    
    // Breath → drift amplitude
    float breathAmplitude = 1.0 + uBreathStrength * 0.2;
    
    // Scroll → drift speed
    float scrollDrift = uScroll * 0.3;
    
    // pos.xz drift with scroll and breath
    float planeWidth = 20.0;
    float planeHeight = 12.0;
    float mistX = (mistIndex / 140.0) * planeWidth - planeWidth * 0.5;
    float mistZ = mod(uTime * 0.1 + mistIndex * 0.05 + scrollDrift, planeHeight) - planeHeight * 0.5;
    
    // Sample wave height at mist position
    vec2 xz = vec2(mistX, mistZ);
    float waveHeight = primaryWaveHeight(xz, uTime) + secondaryWaveHeight(xz, uTime, uRotationSync * 0.5);
    
    // y = combinedWaveHeight + offset
    float mistOffset = 0.3; // Float above wave
    float mistY = waveHeight + mistOffset;
    mistY *= breathAmplitude;
    
    // Bass → flicker jitter
    float bassJitter = sin(uTime * 4.0 + mistIndex * 2.0) * uBass * 0.01;
    mistX += bassJitter;
    mistZ += bassJitter * 0.5;
    
    // High → sparkle mist noise (handled in fragment)
    
    // Loop across XZ using mod()
    mistX = mod(mistX + planeWidth * 0.5, planeWidth) - planeWidth * 0.5;
    mistZ = mod(mistZ + planeHeight * 0.5, planeHeight) - planeHeight * 0.5;
    
    // Radius: 0.02
    float mistRadius = 0.02;
    
    pos = vec3(mistX, mistY, mistZ - 6.4);
    pos *= mistRadius; // Scale particle size
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

