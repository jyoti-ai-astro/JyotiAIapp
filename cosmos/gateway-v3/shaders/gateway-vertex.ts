/**
 * Gateway v3 Vertex Shader
 * 
 * Phase 2 — Section 56: GATEWAY ENGINE v3
 * Gateway Engine v3 (E60)
 * 
 * 9-layer cosmic portal: Portal Base Disc, Rotating Outer Ring, Inner Vortex Spiral, Portal Glyph Band, Spiral Energy Threads, Portal Rays, Dimensional Tear Layer, Energy Particles, Bloom Mask Layer
 */

export const gatewayVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;
attribute float baseDiscIndex;
attribute float outerRingIndex;
attribute float vortexSpiralIndex;
attribute float glyphIndex;
attribute float spiralThreadIndex;
attribute float rayIndex;
attribute float tearIndex;
attribute float particleIndex;
attribute float bloomIndex;
attribute float radialSegment;
attribute float concentricRing;

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
varying float vBaseDiscIndex;
varying float vOuterRingIndex;
varying float vVortexSpiralIndex;
varying float vGlyphIndex;
varying float vSpiralThreadIndex;
varying float vRayIndex;
varying float vTearIndex;
varying float vParticleIndex;
varying float vBloomIndex;
varying float vRadialSegment;
varying float vConcentricRing;
varying float vDistance;
varying float vRadialDistance;
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
// LOGARITHMIC SPIRAL FUNCTION
// ============================================
vec2 logarithmicSpiral(float t, float spiralIndex) {
  // Logarithmic spiral curve
  float angle = t * 6.28318 * 3.0; // 3 full rotations
  float baseRadius = 0.5;
  float maxRadius = 4.0;
  float radius = baseRadius * exp(t * log(maxRadius / baseRadius));
  
  // Scroll → inward pull
  float scrollPull = uScroll * 0.3;
  t -= scrollPull;
  t = mod(t, 1.0);
  radius = baseRadius * exp(t * log(maxRadius / baseRadius));
  
  float x = cos(angle) * radius;
  float z = sin(angle) * radius;
  
  return vec2(x, z);
}

void main() {
  vUv = uv;
  vBaseDiscIndex = baseDiscIndex;
  vOuterRingIndex = outerRingIndex;
  vVortexSpiralIndex = vortexSpiralIndex;
  vGlyphIndex = glyphIndex;
  vSpiralThreadIndex = spiralThreadIndex;
  vRayIndex = rayIndex;
  vTearIndex = tearIndex;
  vParticleIndex = particleIndex;
  vBloomIndex = bloomIndex;
  vRadialSegment = radialSegment;
  vConcentricRing = concentricRing;
  
  vec3 pos = position;
  
  // ============================================
  // LAYER A: PORTAL BASE DISC
  // ============================================
  if (baseDiscIndex >= 0.0) {
    // 64 radial × 32 concentric grid
    float discRadius = 4.5;
    float angle = uv.x * 6.28318; // 0 to 2π
    float radius = uv.y * discRadius; // 0 to discRadius
    
    // Scroll → rotation acceleration
    float scrollRotation = uScroll * 0.4;
    angle += scrollRotation;
    
    // Breath → radius modulation
    float breathModulation = 1.0 + sin(uBreathPhase * 6.28318) * uBreathStrength * 0.12;
    radius *= breathModulation;
    
    // High → shimmer scatter (handled in fragment)
    
    // Convert to 3D position
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 0.0;
    
    pos = vec3(x, y, z - 13.4);
    
    vAngle = angle;
    vRadius = radius;
    vGradientProgress = radius / discRadius;
  }
  
  // ============================================
  // LAYER B: ROTATING OUTER RING
  // ============================================
  if (outerRingIndex >= 0.0) {
    // 3 nested rings
    float ringIdx = outerRingIndex;
    float baseRadius = 4.2 + ringIdx * 0.3; // 4.2, 4.5, 4.8
    float angle = uv.x * 6.28318; // 0 to 2π
    float thickness = 0.18;
    
    // RotationSync → synced rotation
    float rotationSync = uRotationSync * 0.4;
    angle += rotationSync;
    
    // High → spectral shimmer (handled in fragment)
    
    // Ring geometry
    float radius = baseRadius + (uv.y - 0.5) * thickness;
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 0.0;
    
    pos = vec3(x, y, z - 13.4);
    
    vAngle = angle;
    vRadius = radius;
    vGradientProgress = (radius - 4.2) / 0.6;
  }
  
  // ============================================
  // LAYER C: INNER VORTEX SPIRAL
  // ============================================
  if (vortexSpiralIndex >= 0.0) {
    // Logarithmic spiral curve
    float t = uv.y; // 0 to 1 along spiral
    float spiralIdx = vortexSpiralIndex;
    
    // Sample logarithmic spiral
    vec2 spiralPos = logarithmicSpiral(t, spiralIdx);
    
    // Scroll → inward pull (already in logarithmicSpiral)
    
    // Bass → vortex jitter
    float bassJitter = sin(uTime * 3.5 + t * 10.0) * uBass * 0.02;
    spiralPos += normalize(spiralPos) * bassJitter;
    
    // High → spectral shimmer (handled in fragment)
    
    // Spiral width
    float spiralWidth = 0.1;
    float widthOffset = (uv.x - 0.5) * spiralWidth;
    
    // Perpendicular offset
    vec2 tangent = normalize(spiralPos);
    vec2 normal = vec2(-tangent.y, tangent.x);
    spiralPos += normal * widthOffset;
    
    pos = vec3(spiralPos.x, 0.0, spiralPos.y - 13.4);
    
    vAngle = atan(spiralPos.y, spiralPos.x);
    vRadius = length(spiralPos);
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER D: PORTAL GLYPH BAND
  // ============================================
  if (glyphIndex >= 0.0) {
    // Circular glyph ring (48–72 glyphs)
    float numGlyphs = 72.0;
    float glyphAngle = (glyphIndex / numGlyphs) * 6.28318;
    float baseRadius = 3.8;
    
    // Bass → glyph wobble
    float bassWobble = sin(uTime * 3.0 + glyphIndex * 2.0) * uBass * 0.02;
    glyphAngle += bassWobble;
    baseRadius += bassWobble * 0.05;
    
    // High → sparkle noise (handled in fragment)
    
    // Glyph size
    float glyphSize = 0.2;
    float quadSize = glyphSize * 0.5;
    float x = (uv.x - 0.5) * quadSize * 2.0;
    float y = (uv.y - 0.5) * quadSize * 2.0;
    
    // Position glyph at radius
    float glyphX = cos(glyphAngle) * baseRadius;
    float glyphZ = sin(glyphAngle) * baseRadius;
    
    pos = vec3(glyphX + x, y, glyphZ - 13.4);
    
    vAngle = glyphAngle;
    vRadius = baseRadius;
    vGradientProgress = glyphSize;
  }
  
  // ============================================
  // LAYER E: SPIRAL ENERGY THREADS
  // ============================================
  if (spiralThreadIndex >= 0.0) {
    // 6–12 spiral threads
    float threadIdx = spiralThreadIndex;
    float numThreads = 12.0;
    float t = uv.y; // 0 to 1 along thread
    
    // Sample logarithmic spiral
    vec2 spiralPos = logarithmicSpiral(t, threadIdx);
    
    // Travel speed tied to scroll
    float travelSpeed = uScroll * 0.35 + 0.1;
    t += uTime * travelSpeed;
    t = mod(t, 1.0);
    spiralPos = logarithmicSpiral(t, threadIdx);
    
    // Breath → thread width modulation (handled in fragment)
    
    // High → spectral shimmer (handled in fragment)
    
    // Thread width
    float threadWidth = 0.06;
    float widthOffset = (uv.x - 0.5) * threadWidth;
    
    // Perpendicular offset
    vec2 tangent = normalize(spiralPos);
    vec2 normal = vec2(-tangent.y, tangent.x);
    spiralPos += normal * widthOffset;
    
    pos = vec3(spiralPos.x, 0.0, spiralPos.y - 13.4);
    
    vAngle = atan(spiralPos.y, spiralPos.x);
    vRadius = length(spiralPos);
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER F: PORTAL RAYS
  // ============================================
  if (rayIndex >= 0.0) {
    // 20–40 radial rays
    float numRays = 40.0;
    float rayAngle = (rayIndex / numRays) * 6.28318;
    float rayLength = 4.5;
    float t = uv.y; // 0 to 1 along ray
    
    // Bass → vibration
    float bassVibration = sin(uTime * 3.5 + rayIndex * 2.0) * uBass * 0.02;
    rayAngle += bassVibration;
    
    // High → shimmer streaks (handled in fragment)
    
    // Ray geometry
    float radius = t * rayLength;
    float x = cos(rayAngle) * radius;
    float z = sin(rayAngle) * radius;
    float y = 0.0;
    
    // Ray width
    float rayWidth = 0.08;
    float widthOffset = (uv.x - 0.5) * rayWidth;
    float perpAngle = rayAngle + 1.5708; // Perpendicular
    x += cos(perpAngle) * widthOffset;
    z += sin(perpAngle) * widthOffset;
    
    pos = vec3(x, y, z - 13.4);
    
    vAngle = rayAngle;
    vRadius = radius;
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER G: DIMENSIONAL TEAR LAYER
  // ============================================
  if (tearIndex >= 0.0) {
    // fbm distortion texture
    float planeWidth = 9.0;
    float planeHeight = 9.0;
    
    vec2 xz = vec2((uv.x - 0.5) * planeWidth, (uv.y - 0.5) * planeHeight);
    
    // fbm distortion
    float distortion = fbm(xz * 0.4 + uTime * 0.2) * 0.8;
    
    // Scroll → tear widening
    float scrollWidening = uScroll * 0.3;
    distortion += scrollWidening * 0.2;
    
    // BlessingWave → bright white-violet flash (handled in fragment)
    
    // Apply distortion
    xz += normalize(xz) * distortion;
    
    pos = vec3(xz.x, distortion * 0.2, xz.y - 13.4);
    
    vRadius = length(xz);
    vGradientProgress = distortion;
  }
  
  // ============================================
  // LAYER H: ENERGY PARTICLES
  // ============================================
  if (particleIndex >= 0.0) {
    // 200–320 drifting nodes
    float numParticles = 320.0;
    float angle = (particleIndex / numParticles) * 6.28318 * 5.0; // 5 full rotations
    float baseRadius = 1.0 + (particleIndex / numParticles) * 4.5; // 1.0 to 5.5
    
    // Bass → jitter
    float bassJitter = sin(uTime * 4.0 + particleIndex * 2.0) * uBass * 0.01;
    angle += bassJitter;
    baseRadius += bassJitter * 0.05;
    
    // High → sparkle (handled in fragment)
    
    // Convert to 3D position
    float radius = baseRadius;
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = sin(angle * 1.6) * 0.1; // Slight vertical variation
    
    // Particle radius
    float particleRadius = 0.0125;
    
    pos = vec3(x, y, z - 13.4);
    pos *= particleRadius; // Scale particle size
    
    vAngle = angle;
    vRadius = radius;
    vGradientProgress = (radius - 1.0) / 4.5;
  }
  
  // ============================================
  // LAYER I: BLOOM MASK LAYER
  // ============================================
  if (bloomIndex >= 0.0) {
    // Soft bloom for postFX
    // Same plane as base disc
    float discRadius = 4.5;
    float angle = uv.x * 6.28318;
    float radius = uv.y * discRadius;
    
    // Intensifies with blessingWaveProgress (handled in fragment)
    
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 0.0;
    
    pos = vec3(x, y, z - 13.4);
    
    vRadius = radius;
    vGradientProgress = radius / discRadius;
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

