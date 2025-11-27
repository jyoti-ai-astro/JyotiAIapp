/**
 * Gate of Time v2 Vertex Shader
 * 
 * Phase 2 — Section 57: GATE OF TIME ENGINE v2
 * Gate of Time Engine v2 (E61)
 * 
 * 12-layer temporal wormhole: Temporal Base Disc, Chrono Rings, Temporal Spiral, Time Glyph Halo, Time Streams, Ripple Waves, Temporal Threads, Chrono Dust Field, Temporal Tear Layer, Inner Wormhole Core, Wormhole Tunnel, Bloom Mask Layer
 */

export const gateOfTimeVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;
attribute float baseDiscIndex;
attribute float chronoRingIndex;
attribute float temporalSpiralIndex;
attribute float glyphIndex;
attribute float timeStreamIndex;
attribute float rippleWaveIndex;
attribute float temporalThreadIndex;
attribute float dustIndex;
attribute float tearIndex;
attribute float wormholeCoreIndex;
attribute float wormholeTunnelIndex;
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
varying float vChronoRingIndex;
varying float vTemporalSpiralIndex;
varying float vGlyphIndex;
varying float vTimeStreamIndex;
varying float vRippleWaveIndex;
varying float vTemporalThreadIndex;
varying float vDustIndex;
varying float vTearIndex;
varying float vWormholeCoreIndex;
varying float vWormholeTunnelIndex;
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
// DOUBLE LOGARITHMIC SPIRAL FUNCTION
// ============================================
vec2 doubleLogarithmicSpiral(float t, float spiralIndex) {
  // Double logarithmic spiral curve
  float angle = t * 6.28318 * 4.0; // 4 full rotations
  float baseRadius = 0.3;
  float maxRadius = 5.0;
  float radius = baseRadius * exp(t * log(maxRadius / baseRadius));
  
  // Scroll → inward pull
  float scrollPull = uScroll * 0.35;
  t -= scrollPull;
  t = mod(t, 1.0);
  radius = baseRadius * exp(t * log(maxRadius / baseRadius));
  
  // Double spiral (two arms)
  float spiralOffset = (spiralIndex / 2.0) * 3.14159; // π offset for second arm
  angle += spiralOffset;
  
  float x = cos(angle) * radius;
  float z = sin(angle) * radius;
  
  return vec2(x, z);
}

void main() {
  vUv = uv;
  vBaseDiscIndex = baseDiscIndex;
  vChronoRingIndex = chronoRingIndex;
  vTemporalSpiralIndex = temporalSpiralIndex;
  vGlyphIndex = glyphIndex;
  vTimeStreamIndex = timeStreamIndex;
  vRippleWaveIndex = rippleWaveIndex;
  vTemporalThreadIndex = temporalThreadIndex;
  vDustIndex = dustIndex;
  vTearIndex = tearIndex;
  vWormholeCoreIndex = wormholeCoreIndex;
  vWormholeTunnelIndex = wormholeTunnelIndex;
  vBloomIndex = bloomIndex;
  vRadialSegment = radialSegment;
  vConcentricRing = concentricRing;
  
  vec3 pos = position;
  
  // ============================================
  // LAYER A: TEMPORAL BASE DISC
  // ============================================
  if (baseDiscIndex >= 0.0) {
    // 64 radial × 32 concentric grid
    float discRadius = 5.5;
    float angle = uv.x * 6.28318; // 0 to 2π
    float radius = uv.y * discRadius; // 0 to discRadius
    
    // Scroll → time-ripple acceleration
    float scrollRotation = uScroll * 0.5;
    angle += scrollRotation;
    
    // Breath → radius swelling
    float breathSwelling = 1.0 + sin(uBreathPhase * 6.28318) * uBreathStrength * 0.15;
    radius *= breathSwelling;
    
    // High → shimmer (handled in fragment)
    
    // Convert to 3D position
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 0.0;
    
    pos = vec3(x, y, z - 15.2);
    
    vAngle = angle;
    vRadius = radius;
    vGradientProgress = radius / discRadius;
  }
  
  // ============================================
  // LAYER B: CHRONO RINGS
  // ============================================
  if (chronoRingIndex >= 0.0) {
    // 5 nested rings
    float ringIdx = chronoRingIndex;
    float baseRadius = 4.8 + ringIdx * 0.4; // 4.8, 5.2, 5.6, 6.0, 6.4
    float angle = uv.x * 6.28318; // 0 to 2π
    float thickness = 0.2;
    
    // RotationSync → linked rotation
    float rotationSync = uRotationSync * 0.5;
    angle += rotationSync;
    
    // High → spectral shimmer (handled in fragment)
    
    // Ring geometry
    float radius = baseRadius + (uv.y - 0.5) * thickness;
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 0.0;
    
    pos = vec3(x, y, z - 15.2);
    
    vAngle = angle;
    vRadius = radius;
    vGradientProgress = (radius - 4.8) / 1.6;
  }
  
  // ============================================
  // LAYER C: TEMPORAL SPIRAL
  // ============================================
  if (temporalSpiralIndex >= 0.0) {
    // Double logarithmic spiral
    float t = uv.y; // 0 to 1 along spiral
    float spiralIdx = temporalSpiralIndex;
    
    // Sample double logarithmic spiral
    vec2 spiralPos = doubleLogarithmicSpiral(t, spiralIdx);
    
    // Scroll → inward pull (already in doubleLogarithmicSpiral)
    
    // Bass → spiral jitter
    float bassJitter = sin(uTime * 3.5 + t * 12.0) * uBass * 0.02;
    spiralPos += normalize(spiralPos) * bassJitter;
    
    // Spiral width
    float spiralWidth = 0.12;
    float widthOffset = (uv.x - 0.5) * spiralWidth;
    
    // Perpendicular offset
    vec2 tangent = normalize(spiralPos);
    vec2 normal = vec2(-tangent.y, tangent.x);
    spiralPos += normal * widthOffset;
    
    pos = vec3(spiralPos.x, 0.0, spiralPos.y - 15.2);
    
    vAngle = atan(spiralPos.y, spiralPos.x);
    vRadius = length(spiralPos);
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER D: TIME GLYPH HALO
  // ============================================
  if (glyphIndex >= 0.0) {
    // 60–100 glyph nodes
    float numGlyphs = 100.0;
    float glyphAngle = (glyphIndex / numGlyphs) * 6.28318;
    float baseRadius = 4.2;
    
    // Bass → wobble
    float bassWobble = sin(uTime * 3.0 + glyphIndex * 2.0) * uBass * 0.02;
    glyphAngle += bassWobble;
    baseRadius += bassWobble * 0.05;
    
    // High → sparkle noise (handled in fragment)
    
    // Glyph size
    float glyphSize = 0.22;
    float quadSize = glyphSize * 0.5;
    float x = (uv.x - 0.5) * quadSize * 2.0;
    float y = (uv.y - 0.5) * quadSize * 2.0;
    
    // Position glyph at radius
    float glyphX = cos(glyphAngle) * baseRadius;
    float glyphZ = sin(glyphAngle) * baseRadius;
    
    pos = vec3(glyphX + x, y, glyphZ - 15.2);
    
    vAngle = glyphAngle;
    vRadius = baseRadius;
    vGradientProgress = glyphSize;
  }
  
  // ============================================
  // LAYER E: TIME STREAMS
  // ============================================
  if (timeStreamIndex >= 0.0) {
    // 8–16 streams
    float streamIdx = timeStreamIndex;
    float numStreams = 16.0;
    float streamAngle = (streamIdx / numStreams) * 6.28318;
    float streamLength = 5.5;
    float t = uv.y; // 0 to 1 along stream
    
    // Scroll → flow speed
    float flowSpeed = uScroll * 0.4 + 0.1;
    t += uTime * flowSpeed;
    t = mod(t, 1.0);
    
    // Breath → stream width modulation (handled in fragment)
    
    // Stream geometry
    float radius = t * streamLength;
    float x = cos(streamAngle) * radius;
    float z = sin(streamAngle) * radius;
    float y = 0.0;
    
    // Stream width
    float streamWidth = 0.1;
    float widthOffset = (uv.x - 0.5) * streamWidth;
    float perpAngle = streamAngle + 1.5708; // Perpendicular
    x += cos(perpAngle) * widthOffset;
    z += sin(perpAngle) * widthOffset;
    
    pos = vec3(x, y, z - 15.2);
    
    vAngle = streamAngle;
    vRadius = radius;
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER F: RIPPLE WAVES
  // ============================================
  if (rippleWaveIndex >= 0.0) {
    // Concentric time ripples (8–12 waves)
    float numWaves = 12.0;
    float waveIdx = rippleWaveIndex;
    float baseRadius = 1.0 + (waveIdx / numWaves) * 4.5; // 1.0 to 5.5
    float angle = uv.x * 6.28318; // 0 to 2π
    float thickness = 0.15;
    
    // Animate outward over time
    float waveSpeed = 0.3;
    baseRadius += uTime * waveSpeed;
    baseRadius = mod(baseRadius, 5.5);
    
    // High → shimmer amplification (handled in fragment)
    
    // Ripple geometry
    float radius = baseRadius + (uv.y - 0.5) * thickness;
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 0.0;
    
    pos = vec3(x, y, z - 15.2);
    
    vAngle = angle;
    vRadius = radius;
    vGradientProgress = (radius - 1.0) / 4.5;
  }
  
  // ============================================
  // LAYER G: TEMPORAL THREADS
  // ============================================
  if (temporalThreadIndex >= 0.0) {
    // 6–12 threads weaving around spiral
    float threadIdx = temporalThreadIndex;
    float numThreads = 12.0;
    float t = uv.y; // 0 to 1 along thread
    
    // Sample double logarithmic spiral
    vec2 spiralPos = doubleLogarithmicSpiral(t, threadIdx);
    
    // Scroll → weaving speed
    float weavingSpeed = uScroll * 0.4 + 0.1;
    t += uTime * weavingSpeed;
    t = mod(t, 1.0);
    spiralPos = doubleLogarithmicSpiral(t, threadIdx);
    
    // Bass → flicker (handled in fragment)
    
    // Thread width
    float threadWidth = 0.08;
    float widthOffset = (uv.x - 0.5) * threadWidth;
    
    // Perpendicular offset
    vec2 tangent = normalize(spiralPos);
    vec2 normal = vec2(-tangent.y, tangent.x);
    spiralPos += normal * widthOffset;
    
    pos = vec3(spiralPos.x, 0.0, spiralPos.y - 15.2);
    
    vAngle = atan(spiralPos.y, spiralPos.x);
    vRadius = length(spiralPos);
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER H: CHRONO DUST FIELD
  // ============================================
  if (dustIndex >= 0.0) {
    // 300–450 particles
    float numParticles = 450.0;
    float angle = (dustIndex / numParticles) * 6.28318 * 6.0; // 6 full rotations
    float baseRadius = 0.8 + (dustIndex / numParticles) * 5.2; // 0.8 to 6.0
    
    // Bass → jitter
    float bassJitter = sin(uTime * 4.0 + dustIndex * 2.0) * uBass * 0.01;
    angle += bassJitter;
    baseRadius += bassJitter * 0.05;
    
    // High → sparkle (handled in fragment)
    
    // Convert to 3D position
    float radius = baseRadius;
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = sin(angle * 1.7) * 0.12; // Slight vertical variation
    
    // Particle radius
    float particleRadius = 0.0125;
    
    pos = vec3(x, y, z - 15.2);
    pos *= particleRadius; // Scale particle size
    
    vAngle = angle;
    vRadius = radius;
    vGradientProgress = (radius - 0.8) / 5.2;
  }
  
  // ============================================
  // LAYER I: TEMPORAL TEAR LAYER
  // ============================================
  if (tearIndex >= 0.0) {
    // fbm distortion grid
    float planeWidth = 11.0;
    float planeHeight = 11.0;
    
    vec2 xz = vec2((uv.x - 0.5) * planeWidth, (uv.y - 0.5) * planeHeight);
    
    // fbm distortion
    float distortion = fbm(xz * 0.4 + uTime * 0.2) * 0.9;
    
    // Scroll → widening distortion
    float scrollWidening = uScroll * 0.35;
    distortion += scrollWidening * 0.25;
    
    // BlessingWave → bright flash (handled in fragment)
    
    // Apply distortion
    xz += normalize(xz) * distortion;
    
    pos = vec3(xz.x, distortion * 0.25, xz.y - 15.2);
    
    vRadius = length(xz);
    vGradientProgress = distortion;
  }
  
  // ============================================
  // LAYER J: INNER WORMHOLE CORE
  // ============================================
  if (wormholeCoreIndex >= 0.0) {
    // Pulsing bright core
    float coreRadius = 1.2;
    float angle = uv.x * 6.28318;
    float radius = uv.y * coreRadius;
    
    // Breath → expansion pulse
    float breathPulse = 1.0 + sin(uBreathPhase * 6.28318) * uBreathStrength * 0.2;
    radius *= breathPulse;
    
    // High → inner flare shimmer (handled in fragment)
    
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 0.0;
    
    pos = vec3(x, y, z - 15.2);
    
    vRadius = radius;
    vGradientProgress = radius / coreRadius;
  }
  
  // ============================================
  // LAYER K: WORMHOLE TUNNEL
  // ============================================
  if (wormholeTunnelIndex >= 0.0) {
    // Depth-simulated tunnel using radial UV warp
    float tunnelRadius = 5.5;
    float angle = uv.x * 6.28318;
    float depth = uv.y; // 0 to 1 (depth)
    
    // Scroll → tunnel pull
    float tunnelPull = uScroll * 0.4;
    depth += tunnelPull;
    depth = mod(depth, 1.0);
    
    // Radial UV warp for depth effect
    float radius = tunnelRadius * (1.0 - depth * 0.7); // Shrinks with depth
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 0.0;
    
    pos = vec3(x, y, z - 15.2);
    
    vRadius = radius;
    vGradientProgress = depth;
  }
  
  // ============================================
  // LAYER L: BLOOM MASK LAYER
  // ============================================
  if (bloomIndex >= 0.0) {
    // Strong bloom around core
    // Same plane as base disc
    float discRadius = 5.5;
    float angle = uv.x * 6.28318;
    float radius = uv.y * discRadius;
    
    // Intensifies with blessingWaveProgress (handled in fragment)
    
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 0.0;
    
    pos = vec3(x, y, z - 15.2);
    
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

