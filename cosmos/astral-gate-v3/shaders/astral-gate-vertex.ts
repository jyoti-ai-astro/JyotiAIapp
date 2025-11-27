/**
 * Astral Gate v3 Vertex Shader
 * 
 * Phase 2 — Section 59: ASTRAL GATE ENGINE v3
 * Astral Gate Engine v3 (E63)
 * 
 * 15-layer cosmic ascension portal: Gate Base Disc, Twin Ascension Arcs, Triple Spiral Halo, Ascension Pillars, Halo Glyph Ring, Energy Runners, Cross-Soul Threads, Astral Wave Rings, Dimensional Fog Layer, Ascension Stairs, Ascension Light Beams, Astral Dust Field, Portal Core, Outer Ascension Halo, Bloom Mask Layer
 */

export const astralGateVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;
attribute float baseDiscIndex;
attribute float twinArcIndex;
attribute float tripleSpiralIndex;
attribute float ascensionPillarIndex;
attribute float haloGlyphIndex;
attribute float energyRunnerIndex;
attribute float crossSoulThreadIndex;
attribute float astralWaveIndex;
attribute float dimensionalFogIndex;
attribute float ascensionStairIndex;
attribute float lightBeamIndex;
attribute float astralDustIndex;
attribute float portalCoreIndex;
attribute float outerHaloIndex;
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
varying float vTwinArcIndex;
varying float vTripleSpiralIndex;
varying float vAscensionPillarIndex;
varying float vHaloGlyphIndex;
varying float vEnergyRunnerIndex;
varying float vCrossSoulThreadIndex;
varying float vAstralWaveIndex;
varying float vDimensionalFogIndex;
varying float vAscensionStairIndex;
varying float vLightBeamIndex;
varying float vAstralDustIndex;
varying float vPortalCoreIndex;
varying float vOuterHaloIndex;
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
vec2 logarithmicSpiral(float t, float spiralIndex, float rotationSpeed) {
  // Logarithmic spiral curve
  float angle = t * 6.28318 * 4.0 * rotationSpeed; // 4 full rotations, variable speed
  float baseRadius = 0.4;
  float maxRadius = 6.5;
  float radius = baseRadius * exp(t * log(maxRadius / baseRadius));
  
  float x = cos(angle) * radius;
  float z = sin(angle) * radius;
  
  return vec2(x, z);
}

void main() {
  vUv = uv;
  vBaseDiscIndex = baseDiscIndex;
  vTwinArcIndex = twinArcIndex;
  vTripleSpiralIndex = tripleSpiralIndex;
  vAscensionPillarIndex = ascensionPillarIndex;
  vHaloGlyphIndex = haloGlyphIndex;
  vEnergyRunnerIndex = energyRunnerIndex;
  vCrossSoulThreadIndex = crossSoulThreadIndex;
  vAstralWaveIndex = astralWaveIndex;
  vDimensionalFogIndex = dimensionalFogIndex;
  vAscensionStairIndex = ascensionStairIndex;
  vLightBeamIndex = lightBeamIndex;
  vAstralDustIndex = astralDustIndex;
  vPortalCoreIndex = portalCoreIndex;
  vOuterHaloIndex = outerHaloIndex;
  vBloomIndex = bloomIndex;
  vRadialSegment = radialSegment;
  vConcentricRing = concentricRing;
  
  vec3 pos = position;
  
  // ============================================
  // LAYER A: GATE BASE DISC
  // ============================================
  if (baseDiscIndex >= 0.0) {
    // 64 radial × 32 concentric grid
    float discRadius = 6.0;
    float angle = uv.x * 6.28318; // 0 to 2π
    float radius = uv.y * discRadius; // 0 to discRadius
    
    // Scroll → rotation acceleration
    float scrollRotation = uScroll * 0.5;
    angle += scrollRotation;
    
    // Breath → radius pulse
    float breathPulse = 1.0 + sin(uBreathPhase * 6.28318) * uBreathStrength * 0.12;
    radius *= breathPulse;
    
    // High → spectral shimmer (handled in fragment)
    
    // Convert to 3D position
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 0.0;
    
    pos = vec3(x, y, z - 21.2);
    
    vAngle = angle;
    vRadius = radius;
    vGradientProgress = radius / discRadius;
  }
  
  // ============================================
  // LAYER B: TWIN ASCENSION ARCS
  // ============================================
  if (twinArcIndex >= 0.0) {
    // 2 mirrored arcs
    float arcIdx = twinArcIndex;
    float arcAngle = (arcIdx / 2.0) * 3.14159; // 0 or π (mirrored)
    float arcRadius = 5.5;
    float t = uv.y; // 0 to 1 along arc
    
    // Scroll → climb progression
    float scrollClimb = uScroll * 0.4;
    t += scrollClimb;
    t = mod(t, 1.0);
    
    // Bass → arc wobble
    float bassWobble = sin(uTime * 3.5 + arcIdx * 2.0) * uBass * 0.02;
    arcAngle += bassWobble;
    
    // Arc geometry (curved path)
    float angle = arcAngle + (t - 0.5) * 1.5708; // ±90 degrees from center
    float radius = arcRadius;
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = t * 3.0; // Rising arc
    
    // Arc width
    float arcWidth = 0.2;
    float widthOffset = (uv.x - 0.5) * arcWidth;
    float perpAngle = angle + 1.5708; // Perpendicular
    x += cos(perpAngle) * widthOffset;
    z += sin(perpAngle) * widthOffset;
    
    pos = vec3(x, y, z - 21.2);
    
    vAngle = angle;
    vRadius = radius;
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER C: TRIPLE SPIRAL HALO
  // ============================================
  if (tripleSpiralIndex >= 0.0) {
    // 3 spirals rotating at different speeds
    float spiralIdx = tripleSpiralIndex;
    float rotationSpeed = 0.8 + spiralIdx * 0.2; // 0.8, 1.0, 1.2
    float t = uv.y; // 0 to 1 along spiral
    
    // Sample logarithmic spiral
    vec2 spiralPos = logarithmicSpiral(t, spiralIdx, rotationSpeed);
    
    // High → spiral glitter (handled in fragment)
    
    // Spiral width
    float spiralWidth = 0.12;
    float widthOffset = (uv.x - 0.5) * spiralWidth;
    
    // Perpendicular offset
    vec2 tangent = normalize(spiralPos);
    vec2 normal = vec2(-tangent.y, tangent.x);
    spiralPos += normal * widthOffset;
    
    pos = vec3(spiralPos.x, t * 2.0, spiralPos.y - 21.2);
    
    vAngle = atan(spiralPos.y, spiralPos.x);
    vRadius = length(spiralPos);
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER D: ASCENSION PILLARS
  // ============================================
  if (ascensionPillarIndex >= 0.0) {
    // 6–12 vertical pillars
    float numPillars = 12.0;
    float pillarAngle = (ascensionPillarIndex / numPillars) * 6.28318;
    float pillarRadius = 5.0;
    float pillarHeight = 4.0;
    float t = uv.y; // 0 to 1 along pillar
    
    // Scroll → pillar growth
    float scrollGrowth = uScroll * 0.4;
    pillarHeight *= (1.0 + scrollGrowth);
    
    // Breath → width pulse (handled in fragment)
    
    // Pillar geometry
    float radius = pillarRadius;
    float x = cos(pillarAngle) * radius;
    float z = sin(pillarAngle) * radius;
    float y = t * pillarHeight;
    
    // Pillar width
    float pillarWidth = 0.15;
    float widthOffset = (uv.x - 0.5) * pillarWidth;
    float perpAngle = pillarAngle + 1.5708; // Perpendicular
    x += cos(perpAngle) * widthOffset;
    z += sin(perpAngle) * widthOffset;
    
    pos = vec3(x, y, z - 21.2);
    
    vAngle = pillarAngle;
    vRadius = radius;
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER E: HALO GLYPH RING
  // ============================================
  if (haloGlyphIndex >= 0.0) {
    // 72–96 glyphs
    float numGlyphs = 96.0;
    float glyphAngle = (haloGlyphIndex / numGlyphs) * 6.28318;
    float baseRadius = 5.2;
    
    // Bass → glyph jitter
    float bassJitter = sin(uTime * 3.0 + haloGlyphIndex * 2.0) * uBass * 0.02;
    glyphAngle += bassJitter;
    baseRadius += bassJitter * 0.05;
    
    // BlessingWave → flash pulse (handled in fragment)
    
    // Glyph size
    float glyphSize = 0.2;
    float quadSize = glyphSize * 0.5;
    float x = (uv.x - 0.5) * quadSize * 2.0;
    float y = (uv.y - 0.5) * quadSize * 2.0;
    
    // Position glyph at radius
    float glyphX = cos(glyphAngle) * baseRadius;
    float glyphZ = sin(glyphAngle) * baseRadius;
    
    pos = vec3(glyphX + x, y, glyphZ - 21.2);
    
    vAngle = glyphAngle;
    vRadius = baseRadius;
    vGradientProgress = glyphSize;
  }
  
  // ============================================
  // LAYER F: ENERGY RUNNERS
  // ============================================
  if (energyRunnerIndex >= 0.0) {
    // 6–12 streaks orbiting the ring
    float numRunners = 12.0;
    float runnerAngle = (energyRunnerIndex / numRunners) * 6.28318;
    float runnerRadius = 5.5;
    float t = uv.y; // 0 to 1 along runner
    
    // Scroll → speed factor
    float speedFactor = uScroll * 0.5 + 0.1;
    runnerAngle += uTime * speedFactor;
    
    // Runner geometry
    float radius = runnerRadius;
    float x = cos(runnerAngle) * radius;
    float z = sin(runnerAngle) * radius;
    float y = 0.0;
    
    // Runner width
    float runnerWidth = 0.1;
    float widthOffset = (uv.x - 0.5) * runnerWidth;
    float perpAngle = runnerAngle + 1.5708; // Perpendicular
    x += cos(perpAngle) * widthOffset;
    z += sin(perpAngle) * widthOffset;
    
    pos = vec3(x, y, z - 21.2);
    
    vAngle = runnerAngle;
    vRadius = radius;
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER G: CROSS-SOUL THREADS
  // ============================================
  if (crossSoulThreadIndex >= 0.0) {
    // 24–40 threads
    float numThreads = 40.0;
    float threadIdx = crossSoulThreadIndex;
    float t = uv.y; // 0 to 1 along thread
    
    // Connect between points on opposite sides
    float angle1 = (threadIdx / numThreads) * 6.28318;
    float angle2 = angle1 + 3.14159; // Opposite side
    float radius = 5.0;
    
    vec2 pos1 = vec2(cos(angle1) * radius, sin(angle1) * radius);
    vec2 pos2 = vec2(cos(angle2) * radius, sin(angle2) * radius);
    vec2 threadPos = mix(pos1, pos2, t);
    
    // High → thread shimmer (handled in fragment)
    
    // Thread width
    float threadWidth = 0.06;
    float widthOffset = (uv.x - 0.5) * threadWidth;
    
    vec2 tangent = normalize(pos2 - pos1);
    vec2 normal = vec2(-tangent.y, tangent.x);
    threadPos += normal * widthOffset;
    
    pos = vec3(threadPos.x, t * 2.0, threadPos.y - 21.2);
    
    vRadius = length(threadPos);
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER H: ASTRAL WAVE RINGS
  // ============================================
  if (astralWaveIndex >= 0.0) {
    // 4–8 expanding rings
    float numWaves = 8.0;
    float waveIdx = astralWaveIndex;
    float baseRadius = 1.5 + (waveIdx / numWaves) * 5.0; // 1.5 to 6.5
    float angle = uv.x * 6.28318;
    float thickness = 0.2;
    
    // Scroll → ring expansion
    float expansionRate = uScroll * 0.3;
    baseRadius += uTime * expansionRate;
    baseRadius = mod(baseRadius, 6.5);
    
    // Breath → amplitude pulse (handled in fragment)
    
    float radius = baseRadius + (uv.y - 0.5) * thickness;
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 0.0;
    
    pos = vec3(x, y, z - 21.2);
    
    vAngle = angle;
    vRadius = radius;
    vGradientProgress = (radius - 1.5) / 5.0;
  }
  
  // ============================================
  // LAYER I: DIMENSIONAL FOG LAYER
  // ============================================
  if (dimensionalFogIndex >= 0.0) {
    // fbm fog plane (64×64)
    float planeWidth = 13.0;
    float planeHeight = 13.0;
    
    vec2 xz = vec2((uv.x - 0.5) * planeWidth, (uv.y - 0.5) * planeHeight);
    
    // fbm fog
    float fogDensity = fbm(xz * 0.3 + uTime * 0.15) * 0.8;
    
    // BlessingWave → bright flash (handled in fragment)
    
    // Apply fog displacement
    xz += normalize(xz) * fogDensity * 0.3;
    
    pos = vec3(xz.x, fogDensity * 0.4, xz.y - 21.2);
    
    vRadius = length(xz);
    vGradientProgress = fogDensity;
  }
  
  // ============================================
  // LAYER J: ASCENSION STAIRS
  // ============================================
  if (ascensionStairIndex >= 0.0) {
    // 20–30 step-like segments forming a rising staircase
    float numStairs = 30.0;
    float stairIdx = ascensionStairIndex;
    float stairAngle = (stairIdx / numStairs) * 6.28318;
    float stairRadius = 4.5;
    float stairHeight = 0.15;
    float t = uv.y; // 0 to 1 along stair
    
    // Scroll → vertical progression
    float scrollProgression = uScroll * 0.4;
    float heightOffset = (stairIdx / numStairs) * 3.0 + scrollProgression * 2.0;
    
    // Stair geometry
    float radius = stairRadius;
    float x = cos(stairAngle) * radius;
    float z = sin(stairAngle) * radius;
    float y = heightOffset + t * stairHeight;
    
    // Stair width
    float stairWidth = 0.25;
    float widthOffset = (uv.x - 0.5) * stairWidth;
    float perpAngle = stairAngle + 1.5708; // Perpendicular
    x += cos(perpAngle) * widthOffset;
    z += sin(perpAngle) * widthOffset;
    
    pos = vec3(x, y, z - 21.2);
    
    vAngle = stairAngle;
    vRadius = radius;
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER K: ASCENSION LIGHT BEAMS
  // ============================================
  if (lightBeamIndex >= 0.0) {
    // 6–10 rising beams
    float numBeams = 10.0;
    float beamAngle = (lightBeamIndex / numBeams) * 6.28318;
    float beamHeight = 5.0;
    float t = uv.y; // 0 to 1 along beam
    
    // Breath → width swell (handled in fragment)
    
    // High → spectral shimmer (handled in fragment)
    
    float height = t * beamHeight;
    float beamWidth = 0.14;
    float widthOffset = (uv.x - 0.5) * beamWidth;
    float perpAngle = beamAngle + 1.5708; // Perpendicular
    float x = cos(beamAngle) * 4.0 + cos(perpAngle) * widthOffset;
    float z = sin(beamAngle) * 4.0 + sin(perpAngle) * widthOffset;
    
    pos = vec3(x, height, z - 21.2);
    
    vAngle = beamAngle;
    vRadius = length(vec2(x, z));
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER L: ASTRAL DUST FIELD
  // ============================================
  if (astralDustIndex >= 0.0) {
    // 200–300 particles
    float numParticles = 300.0;
    float angle = (astralDustIndex / numParticles) * 6.28318 * 8.0; // 8 full rotations
    float baseRadius = 0.5 + (astralDustIndex / numParticles) * 7.0; // 0.5 to 7.5
    
    // Bass → jitter
    float bassJitter = sin(uTime * 4.0 + astralDustIndex * 2.0) * uBass * 0.01;
    angle += bassJitter;
    baseRadius += bassJitter * 0.05;
    
    // High → sparkle (handled in fragment)
    
    float radius = baseRadius;
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = sin(angle * 1.9) * 0.2; // Slight vertical variation
    
    // Particle radius
    float particleRadius = 0.0125;
    
    pos = vec3(x, y, z - 21.2);
    pos *= particleRadius; // Scale particle size
    
    vAngle = angle;
    vRadius = radius;
    vGradientProgress = (radius - 0.5) / 7.0;
  }
  
  // ============================================
  // LAYER M: PORTAL CORE
  // ============================================
  if (portalCoreIndex >= 0.0) {
    // Bright ascending core
    float coreRadius = 1.3;
    float angle = uv.x * 6.28318;
    float radius = uv.y * coreRadius;
    
    // Breath → expansion
    float breathExpansion = 1.0 + sin(uBreathPhase * 6.28318) * uBreathStrength * 0.25;
    radius *= breathExpansion;
    
    // High → flare (handled in fragment)
    
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 0.0;
    
    pos = vec3(x, y, z - 21.2);
    
    vRadius = radius;
    vGradientProgress = radius / coreRadius;
  }
  
  // ============================================
  // LAYER N: OUTER ASCENSION HALO
  // ============================================
  if (outerHaloIndex >= 0.0) {
    // Rotating halo around portal
    float haloRadius = 6.0;
    float angle = uv.x * 6.28318;
    float thickness = 0.25;
    
    // Scroll → rotation speed
    float scrollRotation = uScroll * 0.5;
    angle += scrollRotation;
    
    float radius = haloRadius + (uv.y - 0.5) * thickness;
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 0.0;
    
    pos = vec3(x, y, z - 21.2);
    
    vAngle = angle;
    vRadius = radius;
    vGradientProgress = (radius - 6.0) / 0.25;
  }
  
  // ============================================
  // LAYER O: BLOOM MASK LAYER
  // ============================================
  if (bloomIndex >= 0.0) {
    // Required for postFX bloom
    // Same plane as base disc
    float discRadius = 6.0;
    float angle = uv.x * 6.28318;
    float radius = uv.y * discRadius;
    
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 0.0;
    
    pos = vec3(x, y, z - 21.2);
    
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

