/**
 * Cosmic Fracture Vertex Shader
 * 
 * Phase 2 — Section 50: COSMIC FRACTURE ENGINE
 * Cosmic Fracture Engine (E54)
 * 
 * Primary fractal shatter plane, secondary prism refraction shards, crystal dust & refracted particles, breath pulse, scroll spread, bass jitter, high shimmer, cameraFOV
 */

export const cosmicFractureVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;
attribute float fractureIndex;
attribute float shardIndex;
attribute float crystalIndex;

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
varying float vFractureIndex;
varying float vShardIndex;
varying float vCrystalIndex;
varying float vDistance;
varying float vRadialDistance;
varying float vFractureHeight;
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
// FRACTURE DISPLACEMENT FUNCTION
// ============================================
float fractureDisplacement(vec2 xz, float time) {
  // Noise-based fracture displacement:
  // crack1 = fbm(uv*5.0 + time*0.3)*0.2
  // crack2 = sin(x*3.0 + time*0.6)*0.08
  // fracture = crack1 + crack2
  float crack1 = fbm(xz * 5.0 + time * 0.3) * 0.2;
  float crack2 = sin(xz.x * 3.0 + time * 0.6) * 0.08;
  
  return crack1 + crack2;
}

// ============================================
// PRISM FUNCTION
// ============================================
float prismFunction(float angle, float radius, float time, float rotationSync) {
  // Equation:
  // prism = sin(angle*4.5 + radius*1.8 + time*0.4)*0.1
  // noise = fbm(vec2(angle*3.0, radius*1.2)+time*0.3)*0.07
  float prism = sin(angle * 4.5 + radius * 1.8 + time * 0.4) * 0.1;
  float noise = fbm(vec2(angle * 3.0, radius * 1.2) + time * 0.3) * 0.07;
  
  // RotationSync → directional shard tilt
  float tilt = rotationSync * 0.4;
  prism += sin(angle * 2.5 + radius * 1.0 + time * 0.5 + tilt) * 0.03;
  
  return prism + noise;
}

void main() {
  vUv = uv;
  vFractureIndex = fractureIndex;
  vShardIndex = shardIndex;
  vCrystalIndex = crystalIndex;
  
  vec3 pos = position;
  
  // ============================================
  // LAYER A: PRIMARY FRACTAL SHATTER PLANE
  // ============================================
  if (fractureIndex >= 0.0) {
    // 22 × 14 units, 48×48 grid
    float planeWidth = 22.0;
    float planeHeight = 14.0;
    
    vec2 xz = vec2((uv.x - 0.5) * planeWidth, (uv.y - 0.5) * planeHeight);
    
    // Sample fracture displacement
    float baseFracture = fractureDisplacement(xz, uTime);
    
    // Breath → fracture amplitude pulse
    float breathPulse = 1.0 + sin(uBreathPhase * 6.28318) * uBreathStrength * 0.2;
    baseFracture *= breathPulse;
    
    // Scroll → fracture spread outward from center
    float distFromCenter = length(xz);
    float scrollSpread = uScroll * 0.4;
    float spreadFactor = scrollSpread * (1.0 / (distFromCenter + 0.3)) * 0.15;
    xz += normalize(xz) * spreadFactor;
    baseFracture += spreadFactor * 2.0;
    
    // Bass → shatter jitter (local micro-breaks)
    float bassJitter = sin(uTime * 4.0 + distFromCenter * 3.0) * uBass * 0.02;
    xz += normalize(xz) * bassJitter;
    baseFracture += bassJitter * 1.5;
    
    // High → sparkle refraction noise (handled in fragment)
    
    // Position with fracture displacement
    pos = vec3(xz.x, baseFracture, xz.y - 7.9);
    
    vFractureHeight = baseFracture;
    vGradientProgress = (baseFracture + 0.25) / 0.5; // Normalize to 0-1
    vRadius = distFromCenter;
  }
  
  // ============================================
  // LAYER B: SECONDARY PRISM REFRACTION SHARDS
  // ============================================
  if (shardIndex >= 0.0) {
    // 8-14 shards, sharp triangular prisms
    // Angle: 0 → 2π
    // Radius: 1.5 → 6.0
    float baseRadius = 1.5 + (shardIndex / 13.0) * 4.5; // 1.5 to 6.0
    float angle = uv.x * 6.28318; // 0 to 2π
    float thickness = 0.2;
    
    // Sample prism
    float basePrism = prismFunction(angle, baseRadius, uTime, uRotationSync);
    
    // Breath → shard scale expansion
    float breathExpansion = 1.0 + uBreathStrength * 0.15;
    basePrism *= breathExpansion;
    baseRadius *= breathExpansion;
    
    // Mid → turbulence injection (already in prismFunction)
    float midTurbulence = fbm(vec2(angle * 3.0, baseRadius * 1.2) + uTime * 0.3) * uMid * 0.03;
    basePrism += midTurbulence;
    
    // High → spectral refraction shimmer (handled in fragment)
    
    // Convert to 3D position
    float x = cos(angle) * (baseRadius + basePrism);
    float z = sin(angle) * (baseRadius + basePrism);
    float y = 0.0;
    
    pos = vec3(x, y, z - 7.9);
    
    vFractureHeight = basePrism;
    vGradientProgress = (basePrism + 0.15) / 0.3; // Normalize to 0-1
    vAngle = angle;
    vRadius = baseRadius;
  }
  
  // ============================================
  // LAYER C: CRYSTAL DUST & REFRACTED PARTICLES
  // ============================================
  if (crystalIndex >= 0.0) {
    // 200-320 micro-crystal particles (mobile: 150)
    // Drift equation:
    // angle = time*speed + offset
    // radius = baseRadius + sin(time*1.5 + index*0.7)*0.22
    
    float speed = 0.1 + (crystalIndex / 320.0) * 0.08; // Varying speeds
    float offset = crystalIndex * 0.04;
    float angle = (uTime * speed) + offset;
    
    // Base radius around fracture
    float baseRadius = 1.2 + (crystalIndex / 320.0) * 4.8; // 1.2 to 6.0
    float radiusVariation = sin(uTime * 1.5 + crystalIndex * 0.7) * 0.22;
    float radius = baseRadius + radiusVariation;
    
    // Breath → radial expansion
    float breathExpansion = 1.0 + uBreathStrength * 0.15;
    radius *= breathExpansion;
    
    // Bass → flicker jitter
    float bassJitter = sin(uTime * 4.5 + crystalIndex * 2.5) * uBass * 0.01;
    angle += bassJitter;
    radius += bassJitter * 0.05;
    
    // High → spectral sparkle noise (handled in fragment)
    
    // Convert to 3D position
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = sin(angle * 2.0) * 0.12; // Slight vertical variation
    
    // Radius: 0.01-0.015
    float crystalRadius = 0.0125;
    
    pos = vec3(x, y, z - 7.9);
    pos *= crystalRadius; // Scale particle size
    
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

