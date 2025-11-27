/**
 * Celestial Wave v2 Vertex Shader
 * 
 * Phase 2 — Section 51: CELESTIAL WAVE ENGINE v2
 * Celestial Wave Engine v2 (E55)
 * 
 * 5-layer harmonic astral wave: Base Harmonic Wave Sheet, Secondary Cross-Wave Sheet, Astral Ripple Rings, Rising Aura Streams, Floating Astral Particles
 */

export const celestialWaveVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;
attribute float waveSheetIndex;
attribute float crossWaveIndex;
attribute float rippleIndex;
attribute float auraStreamIndex;
attribute float particleIndex;

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
varying float vWaveSheetIndex;
varying float vCrossWaveIndex;
varying float vRippleIndex;
varying float vAuraStreamIndex;
varying float vParticleIndex;
varying float vDistance;
varying float vRadialDistance;
varying float vWaveHeight;
varying float vGradientProgress;
varying float vAngle;
varying float vRadius;

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
// BASE HARMONIC WAVE FUNCTION
// ============================================
float baseHarmonicWave(vec2 xz, float time) {
  // Multi-equation harmonic displacement:
  // wave1 = sin(x*0.6 + time*0.8) * 0.18
  // wave2 = sin(z*1.3 + time*0.5) * 0.12
  // noise = fbm(uv*3.0 + time*0.25) * 0.15
  // combined = wave1 + wave2 + noise
  float wave1 = sin(xz.x * 0.6 + time * 0.8) * 0.18;
  float wave2 = sin(xz.y * 1.3 + time * 0.5) * 0.12;
  float noise = fbm(xz * 3.0 + time * 0.25) * 0.15;
  
  return wave1 + wave2 + noise;
}

// ============================================
// CROSS-WAVE FUNCTION
// ============================================
float crossWaveFunction(vec2 xz, float time, float rotationSync) {
  // Equation:
  // cw1 = sin(x*1.2 + time*1.1) * 0.12
  // cw2 = sin(z*0.8 + time*0.6) * 0.1
  // combined = cw1 + cw2
  float cw1 = sin(xz.x * 1.2 + time * 1.1) * 0.12;
  float cw2 = sin(xz.y * 0.8 + time * 0.6) * 0.1;
  
  // RotationSync → wave tilt shift
  float tilt = rotationSync * 0.3;
  cw1 += sin(xz.x * 0.9 + time * 0.8 + tilt) * 0.03;
  
  return cw1 + cw2;
}

// ============================================
// RIPPLE FUNCTION
// ============================================
float rippleFunction(float angle, float radius, float time) {
  // Equation:
  // radial = sin(radius*3.0 - time*1.2) * 0.1
  // noise = fbm(vec2(angle*3.0, radius*0.7)+time*0.3)*0.06
  float radial = sin(radius * 3.0 - time * 1.2) * 0.1;
  float noise = fbm(vec2(angle * 3.0, radius * 0.7) + time * 0.3) * 0.06;
  
  return radial + noise;
}

void main() {
  vUv = uv;
  vWaveSheetIndex = waveSheetIndex;
  vCrossWaveIndex = crossWaveIndex;
  vRippleIndex = rippleIndex;
  vAuraStreamIndex = auraStreamIndex;
  vParticleIndex = particleIndex;
  
  vec3 pos = position;
  
  // ============================================
  // LAYER A: BASE HARMONIC WAVE SHEET
  // ============================================
  if (waveSheetIndex >= 0.0) {
    // 28 × 16 units, 64×64 grid
    float planeWidth = 28.0;
    float planeHeight = 16.0;
    
    vec2 xz = vec2((uv.x - 0.5) * planeWidth, (uv.y - 0.5) * planeHeight);
    
    // Sample base harmonic wave
    float baseWave = baseHarmonicWave(xz, uTime);
    
    // Breath → amplitude pulse
    float breathPulse = 1.0 + sin(uBreathPhase * 6.28318) * uBreathStrength * 0.2;
    baseWave *= breathPulse;
    
    // Scroll → forward wave propagation
    float scrollPropagation = uScroll * 0.4;
    xz.x += scrollPropagation;
    baseWave += sin(xz.x * 0.6 + uTime * 0.8) * scrollPropagation * 0.1;
    
    // Bass → local jitter ripple
    float bassJitter = sin(uTime * 3.5 + length(xz) * 2.0) * uBass * 0.02;
    xz += normalize(xz) * bassJitter;
    baseWave += bassJitter * 1.5;
    
    // Mid → turbulence deformation
    float midTurbulence = fbm(xz * 2.5 + uTime * 0.3) * uMid * 0.04;
    baseWave += midTurbulence;
    
    // High → shimmer scattering (handled in fragment)
    
    // Position with wave displacement
    pos = vec3(xz.x, baseWave, xz.y - 8.2);
    
    vWaveHeight = baseWave;
    vGradientProgress = (baseWave + 0.3) / 0.6; // Normalize to 0-1
    vRadius = length(xz);
  }
  
  // ============================================
  // LAYER B: SECONDARY CROSS-WAVE SHEET
  // ============================================
  if (crossWaveIndex >= 0.0) {
    // 24 × 14 units, 48×48 grid
    float planeWidth = 24.0;
    float planeHeight = 14.0;
    
    vec2 xz = vec2((uv.x - 0.5) * planeWidth, (uv.y - 0.5) * planeHeight);
    
    // Sample cross-wave
    float baseCrossWave = crossWaveFunction(xz, uTime, uRotationSync);
    
    // Breath → amplitude scaling
    float breathScaling = 1.0 + uBreathStrength * 0.15;
    baseCrossWave *= breathScaling;
    
    // Position with cross-wave displacement
    pos = vec3(xz.x, baseCrossWave, xz.y - 8.2);
    
    vWaveHeight = baseCrossWave;
    vGradientProgress = (baseCrossWave + 0.2) / 0.4; // Normalize to 0-1
  }
  
  // ============================================
  // LAYER C: ASTRAL RIPPLE RINGS
  // ============================================
  if (rippleIndex >= 0.0) {
    // 12-18 ripple circles (full 2π rings)
    // Radius: 1.5 → 7.0
    float baseRadius = 1.5 + (rippleIndex / 17.0) * 5.5; // 1.5 to 7.0
    float angle = uv.x * 6.28318; // 0 to 2π
    float thickness = 0.2;
    
    // Sample ripple
    float baseRipple = rippleFunction(angle, baseRadius, uTime);
    
    // Scroll → outward ripple propagation
    float scrollPropagation = uScroll * 0.3;
    baseRadius += scrollPropagation * 2.0;
    baseRipple += scrollPropagation * 0.1;
    
    // Bass → ripple jitter
    float bassJitter = sin(uTime * 3.0 + baseRadius * 2.0) * uBass * 0.02;
    baseRadius += bassJitter * 0.1;
    baseRipple += bassJitter;
    
    // High → shimmer (handled in fragment)
    
    // Convert to 3D position
    float x = cos(angle) * (baseRadius + baseRipple);
    float z = sin(angle) * (baseRadius + baseRipple);
    float y = 0.0;
    
    pos = vec3(x, y, z - 8.2);
    
    vWaveHeight = baseRipple;
    vGradientProgress = (baseRipple + 0.15) / 0.3; // Normalize to 0-1
    vAngle = angle;
    vRadius = baseRadius;
  }
  
  // ============================================
  // LAYER D: RISING AURA STREAMS
  // ============================================
  if (auraStreamIndex >= 0.0) {
    // 60-100 vertical "aura stream" lines
    // Equation:
    // rise = sin(time*1.5 + index*0.3)*0.2
    // jitter = fbm(uv*5.0 + time*0.4)*0.1
    
    float baseX = (auraStreamIndex / 99.0) * 24.0 - 12.0; // -12 to 12
    float baseZ = -8.2;
    
    float rise = sin(uTime * 1.5 + auraStreamIndex * 0.3) * 0.2;
    float jitter = fbm(vec2(uv.x * 5.0, uTime * 0.4)) * 0.1;
    
    // Breath → stream height scaling
    float breathScaling = 1.0 + uBreathStrength * 0.15;
    rise *= breathScaling;
    
    // Scroll → upward drift
    float scrollDrift = uScroll * 0.3;
    rise += scrollDrift * 0.5;
    
    // High → spectral flicker (handled in fragment)
    
    float x = baseX + jitter;
    float y = rise;
    float z = baseZ;
    
    pos = vec3(x, y, z);
    
    vWaveHeight = rise;
    vGradientProgress = (rise + 0.3) / 0.6; // Normalize to 0-1
  }
  
  // ============================================
  // LAYER E: FLOATING ASTRAL PARTICLES
  // ============================================
  if (particleIndex >= 0.0) {
    // 180-260 particles (mobile: 120)
    // Drift equation:
    // angle = time*speed + offset
    // radius = baseRadius + sin(time*1.4 + index*0.9)*0.18
    
    float speed = 0.08 + (particleIndex / 260.0) * 0.06; // Varying speeds
    float offset = particleIndex * 0.03;
    float angle = (uTime * speed) + offset;
    
    // Base radius around wave
    float baseRadius = 1.0 + (particleIndex / 260.0) * 6.0; // 1.0 to 7.0
    float radiusVariation = sin(uTime * 1.4 + particleIndex * 0.9) * 0.18;
    float radius = baseRadius + radiusVariation;
    
    // Breath → expansion
    float breathExpansion = 1.0 + uBreathStrength * 0.15;
    radius *= breathExpansion;
    
    // Bass → jitter
    float bassJitter = sin(uTime * 4.0 + particleIndex * 2.0) * uBass * 0.01;
    angle += bassJitter;
    radius += bassJitter * 0.05;
    
    // High → sparkle noise (handled in fragment)
    
    // Convert to 3D position
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = sin(angle * 1.6) * 0.1; // Slight vertical variation
    
    // Radius: 0.01-0.015
    float particleRadius = 0.0125;
    
    pos = vec3(x, y, z - 8.2);
    pos *= particleRadius; // Scale particle size
    
    vAngle = angle;
    vRadius = radius;
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

