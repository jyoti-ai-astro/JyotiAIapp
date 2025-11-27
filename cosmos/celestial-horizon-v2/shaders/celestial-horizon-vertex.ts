/**
 * Celestial Horizon v2 Vertex Shader
 * 
 * Phase 2 — Section 52: CELESTIAL HORIZON ENGINE v2
 * Celestial Horizon Engine v2 (E56)
 * 
 * 7-layer atmospheric quantum horizon: Base Horizon Gradient Plane, Atmospheric Fog Bands, Quantum Diffraction Edge, Celestial Aurora Bands, Horizon Light Rays, Atmospheric Dust Particles, Horizon Bloom Layer
 */

export const celestialHorizonVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;
attribute float gradientIndex;
attribute float fogBandIndex;
attribute float diffractionIndex;
attribute float auroraIndex;
attribute float rayIndex;
attribute float particleIndex;
attribute float bloomIndex;

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
varying float vGradientIndex;
varying float vFogBandIndex;
varying float vDiffractionIndex;
varying float vAuroraIndex;
varying float vRayIndex;
varying float vParticleIndex;
varying float vBloomIndex;
varying float vDistance;
varying float vRadialDistance;
varying float vHeight;
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
// FOG BAND FUNCTION
// ============================================
float fogBandFunction(float y, float time) {
  // Equation:
  // fog = smoothstep(0.0,1.0, sin(y*1.5 + time*0.5))
  return smoothstep(0.0, 1.0, sin(y * 1.5 + time * 0.5));
}

// ============================================
// AURORA FUNCTION
// ============================================
float auroraFunction(float x, vec2 uv, float time) {
  // Equation:
  // aur = sin(x*2.0 + time*1.2)*0.2 + fbm(uv*3.0 + time*0.4)*0.1
  float aur = sin(x * 2.0 + time * 1.2) * 0.2;
  float noise = fbm(uv * 3.0 + time * 0.4) * 0.1;
  
  return aur + noise;
}

void main() {
  vUv = uv;
  vGradientIndex = gradientIndex;
  vFogBandIndex = fogBandIndex;
  vDiffractionIndex = diffractionIndex;
  vAuroraIndex = auroraIndex;
  vRayIndex = rayIndex;
  vParticleIndex = particleIndex;
  vBloomIndex = bloomIndex;
  
  vec3 pos = position;
  
  // ============================================
  // LAYER A: BASE HORIZON GRADIENT PLANE
  // ============================================
  if (gradientIndex >= 0.0) {
    // 36 × 18 units, 64×48 grid
    float planeWidth = 36.0;
    float planeHeight = 18.0;
    
    vec2 xz = vec2((uv.x - 0.5) * planeWidth, (uv.y - 0.5) * planeHeight);
    
    // Breath → atmospheric swell (vertical gradient modulation)
    float breathSwell = 1.0 + sin(uBreathPhase * 6.28318) * uBreathStrength * 0.15;
    xz.y *= breathSwell;
    
    // Scroll → horizon pan
    float scrollPan = uScroll * 0.3;
    xz.x += scrollPan;
    
    // Bass → micro jitter shimmer (handled in fragment)
    
    // High → micro-Lensing shimmer (handled in fragment)
    
    // Position
    pos = vec3(xz.x, xz.y, -9.0);
    
    vHeight = xz.y;
    vGradientProgress = (xz.y + 9.0) / 18.0; // Normalize to 0-1 (bottom to top)
    vRadius = length(xz);
  }
  
  // ============================================
  // LAYER B: ATMOSPHERIC FOG BANDS
  // ============================================
  if (fogBandIndex >= 0.0) {
    // 4-6 horizontal fog strata
    float planeWidth = 36.0;
    float planeHeight = 18.0;
    
    vec2 xz = vec2((uv.x - 0.5) * planeWidth, (uv.y - 0.5) * planeHeight);
    
    // Sample fog band
    float baseFog = fogBandFunction(xz.y, uTime);
    
    // Breath → fog band swell
    float breathSwell = 1.0 + uBreathStrength * 0.12;
    baseFog *= breathSwell;
    
    // Scroll → fog drift
    float scrollDrift = uScroll * 0.2;
    xz.y += scrollDrift;
    
    // Position
    pos = vec3(xz.x, xz.y, -9.0);
    
    vHeight = xz.y;
    vGradientProgress = baseFog;
  }
  
  // ============================================
  // LAYER C: QUANTUM DIFFRACTION EDGE
  // ============================================
  if (diffractionIndex >= 0.0) {
    // Edge line where horizon meets void
    // Thin 1-2 unit band
    float planeWidth = 36.0;
    float edgeHeight = 1.5; // 1-2 unit band
    
    vec2 xz = vec2((uv.x - 0.5) * planeWidth, (uv.y - 0.5) * edgeHeight);
    
    // Bass → diffraction vibration
    float bassVibration = sin(uTime * 3.5 + xz.x * 0.5) * uBass * 0.02;
    xz.y += bassVibration;
    
    // High → diffraction sparkle (handled in fragment)
    
    // Position at horizon edge
    pos = vec3(xz.x, 8.0 + xz.y, -9.0); // Top of horizon plane
    
    vHeight = xz.y;
    vGradientProgress = (xz.y + edgeHeight * 0.5) / edgeHeight;
  }
  
  // ============================================
  // LAYER D: CELESTIAL AURORA BANDS
  // ============================================
  if (auroraIndex >= 0.0) {
    // 3-5 vertical aurora curtains
    float planeWidth = 36.0;
    float planeHeight = 18.0;
    
    vec2 xz = vec2((uv.x - 0.5) * planeWidth, (uv.y - 0.5) * planeHeight);
    
    // Sample aurora
    float baseAurora = auroraFunction(xz.x, uv, uTime);
    
    // Breath → aurora height swell
    float breathSwell = 1.0 + uBreathStrength * 0.15;
    baseAurora *= breathSwell;
    xz.y *= breathSwell;
    
    // Scroll → vertical drift
    float scrollDrift = uScroll * 0.25;
    xz.y += scrollDrift;
    
    // High → spectral flicker (handled in fragment)
    
    // Position
    pos = vec3(xz.x, xz.y + baseAurora, -9.0);
    
    vHeight = baseAurora;
    vGradientProgress = (xz.y + 9.0) / 18.0;
  }
  
  // ============================================
  // LAYER E: HORIZON LIGHT RAYS
  // ============================================
  if (rayIndex >= 0.0) {
    // 20-40 radial light rays emanating from center
    // Geometry: thin triangular wedges
    // Angle: 0 → 2π
    // Radius: 8.0 → 18.0
    float baseRadius = 8.0 + (rayIndex / 39.0) * 10.0; // 8.0 to 18.0
    float angle = uv.x * 6.28318; // 0 to 2π
    float wedgeWidth = 0.3; // Thin wedge
    
    // Bass → ray vibration
    float bassVibration = sin(uTime * 3.0 + angle * 2.0) * uBass * 0.02;
    angle += bassVibration;
    
    // High → shimmer noise (handled in fragment)
    
    // Convert to 3D position
    float x = cos(angle) * baseRadius;
    float z = sin(angle) * baseRadius;
    float y = 0.0;
    
    pos = vec3(x, y, z - 9.0);
    
    vAngle = angle;
    vRadius = baseRadius;
    vGradientProgress = (baseRadius - 8.0) / 10.0;
  }
  
  // ============================================
  // LAYER F: ATMOSPHERIC DUST PARTICLES
  // ============================================
  if (particleIndex >= 0.0) {
    // 150-220 particles (mobile: 120)
    // Drift equation:
    // angle = time*speed + offset
    // radius = baseRadius + sin(time*1.3 + index*0.7)*0.15
    
    float speed = 0.06 + (particleIndex / 220.0) * 0.05; // Varying speeds
    float offset = particleIndex * 0.04;
    float angle = (uTime * speed) + offset;
    
    // Base radius around horizon
    float baseRadius = 8.0 + (particleIndex / 220.0) * 10.0; // 8.0 to 18.0
    float radiusVariation = sin(uTime * 1.3 + particleIndex * 0.7) * 0.15;
    float radius = baseRadius + radiusVariation;
    
    // Breath → expansion
    float breathExpansion = 1.0 + uBreathStrength * 0.15;
    radius *= breathExpansion;
    
    // Bass → jitter
    float bassJitter = sin(uTime * 4.0 + particleIndex * 2.0) * uBass * 0.01;
    angle += bassJitter;
    radius += bassJitter * 0.05;
    
    // High → sparkle (handled in fragment)
    
    // Convert to 3D position
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = sin(angle * 1.4) * 0.08; // Slight vertical variation
    
    // Radius: 0.01-0.015
    float dustRadius = 0.0125;
    
    pos = vec3(x, y, z - 9.0);
    pos *= dustRadius; // Scale particle size
    
    vAngle = angle;
    vRadius = radius;
  }
  
  // ============================================
  // LAYER G: HORIZON BLOOM LAYER
  // ============================================
  if (bloomIndex >= 0.0) {
    // Soft Gaussian bloom
    // Controlled via alpha mask
    // Same plane as gradient plane
    float planeWidth = 36.0;
    float planeHeight = 18.0;
    
    vec2 xz = vec2((uv.x - 0.5) * planeWidth, (uv.y - 0.5) * planeHeight);
    
    // Position
    pos = vec3(xz.x, xz.y, -9.0);
    
    vHeight = xz.y;
    vGradientProgress = (xz.y + 9.0) / 18.0;
    vRadius = length(xz);
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

