/**
 * Divine Throne v3 Vertex Shader
 * 
 * Phase 2 — Section 60: DIVINE THRONE ENGINE v3
 * Divine Throne Engine v3 (E64)
 * 
 * 16-layer celestial throne: Celestial Base Pedestal, Throne Pillars, Halo Crown, Divine Seat Geometry, Golden Insignia Ring, Ascension Backplate, Divine Spires, Orbital Runner Rings, Karmic Thread Weave, Supreme Aura Shell, Light Pillars, Crown Dust Field, Radiant Ascension Rays, Throne Heart Core, Outer Throne Halo, Bloom Mask Layer
 */

export const divineThroneVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;
attribute float basePedestalIndex;
attribute float thronePillarIndex;
attribute float haloCrownIndex;
attribute float divineSeatIndex;
attribute float goldenInsigniaIndex;
attribute float ascensionBackplateIndex;
attribute float divineSpireIndex;
attribute float orbitalRunnerIndex;
attribute float karmicThreadIndex;
attribute float supremeAuraIndex;
attribute float lightPillarIndex;
attribute float crownDustIndex;
attribute float ascensionRayIndex;
attribute float throneHeartIndex;
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
varying float vBasePedestalIndex;
varying float vThronePillarIndex;
varying float vHaloCrownIndex;
varying float vDivineSeatIndex;
varying float vGoldenInsigniaIndex;
varying float vAscensionBackplateIndex;
varying float vDivineSpireIndex;
varying float vOrbitalRunnerIndex;
varying float vKarmicThreadIndex;
varying float vSupremeAuraIndex;
varying float vLightPillarIndex;
varying float vCrownDustIndex;
varying float vAscensionRayIndex;
varying float vThroneHeartIndex;
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

void main() {
  vUv = uv;
  vBasePedestalIndex = basePedestalIndex;
  vThronePillarIndex = thronePillarIndex;
  vHaloCrownIndex = haloCrownIndex;
  vDivineSeatIndex = divineSeatIndex;
  vGoldenInsigniaIndex = goldenInsigniaIndex;
  vAscensionBackplateIndex = ascensionBackplateIndex;
  vDivineSpireIndex = divineSpireIndex;
  vOrbitalRunnerIndex = orbitalRunnerIndex;
  vKarmicThreadIndex = karmicThreadIndex;
  vSupremeAuraIndex = supremeAuraIndex;
  vLightPillarIndex = lightPillarIndex;
  vCrownDustIndex = crownDustIndex;
  vAscensionRayIndex = ascensionRayIndex;
  vThroneHeartIndex = throneHeartIndex;
  vOuterHaloIndex = outerHaloIndex;
  vBloomIndex = bloomIndex;
  vRadialSegment = radialSegment;
  vConcentricRing = concentricRing;
  
  vec3 pos = position;
  
  // ============================================
  // LAYER A: CELESTIAL BASE PEDESTAL
  // ============================================
  if (basePedestalIndex >= 0.0) {
    // 64×64 grid, radius 5.2
    float pedestalRadius = 5.2;
    float angle = uv.x * 6.28318; // 0 to 2π
    float radius = uv.y * pedestalRadius; // 0 to pedestalRadius
    
    // Breath → expansion pulse
    float breathPulse = 1.0 + sin(uBreathPhase * 6.28318) * uBreathStrength * 0.12;
    radius *= breathPulse;
    
    // High → shimmering dust (handled in fragment)
    
    // Scroll → rotational acceleration
    float scrollRotation = uScroll * 0.5;
    angle += scrollRotation;
    
    // Convert to 3D position
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 0.0;
    
    pos = vec3(x, y, z - 24.4);
    
    vAngle = angle;
    vRadius = radius;
    vGradientProgress = radius / pedestalRadius;
  }
  
  // ============================================
  // LAYER B: THRONE PILLARS
  // ============================================
  if (thronePillarIndex >= 0.0) {
    // 4–8 vertical pillars
    float numPillars = 8.0;
    float pillarAngle = (thronePillarIndex / numPillars) * 6.28318;
    float pillarRadius = 4.5;
    float pillarHeight = 5.0;
    float t = uv.y; // 0 to 1 along pillar
    
    // Breath → width pulse (handled in fragment)
    
    // Bass → vibration wobble
    float bassWobble = sin(uTime * 3.5 + thronePillarIndex * 2.0) * uBass * 0.02;
    pillarAngle += bassWobble;
    pillarRadius += bassWobble * 0.05;
    
    // Pillar geometry
    float radius = pillarRadius;
    float x = cos(pillarAngle) * radius;
    float z = sin(pillarAngle) * radius;
    float y = t * pillarHeight;
    
    // Pillar width
    float pillarWidth = 0.18;
    float widthOffset = (uv.x - 0.5) * pillarWidth;
    float perpAngle = pillarAngle + 1.5708; // Perpendicular
    x += cos(perpAngle) * widthOffset;
    z += sin(perpAngle) * widthOffset;
    
    pos = vec3(x, y, z - 24.4);
    
    vAngle = pillarAngle;
    vRadius = radius;
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER C: HALO CROWN
  // ============================================
  if (haloCrownIndex >= 0.0) {
    // Rotating circular crown
    float crownRadius = 5.0;
    float angle = uv.x * 6.28318;
    float thickness = 0.25;
    
    // RotationSync → crown tilt
    float crownTilt = uRotationSync * 0.15;
    angle += crownTilt;
    
    // High → crown sparkle (handled in fragment)
    
    float radius = crownRadius + (uv.y - 0.5) * thickness;
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 5.5; // Above throne
    
    pos = vec3(x, y, z - 24.4);
    
    vAngle = angle;
    vRadius = radius;
    vGradientProgress = (radius - 5.0) / 0.25;
  }
  
  // ============================================
  // LAYER D: DIVINE SEAT GEOMETRY
  // ============================================
  if (divineSeatIndex >= 0.0) {
    // Hybrid spline + extruded quads
    float seatWidth = 4.0;
    float seatDepth = 3.0;
    float seatHeight = 2.0;
    float t = uv.y; // 0 to 1 along seat
    
    // Scroll → rising motion
    float scrollRise = uScroll * 0.3;
    float y = seatHeight * t + scrollRise * 0.5;
    
    // Seat geometry (simplified spline)
    float x = (uv.x - 0.5) * seatWidth;
    float z = -seatDepth * 0.5 + t * seatDepth;
    
    pos = vec3(x, y, z - 24.4);
    
    vRadius = length(vec2(x, z));
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER E: GOLDEN INSIGNIA RING
  // ============================================
  if (goldenInsigniaIndex >= 0.0) {
    // 72–96 insignia glyphs
    float numGlyphs = 96.0;
    float glyphAngle = (goldenInsigniaIndex / numGlyphs) * 6.28318;
    float baseRadius = 4.8;
    
    // BlessingWave → gold flash (handled in fragment)
    
    // Mid → swirling noise (handled in fragment)
    
    // Glyph size
    float glyphSize = 0.22;
    float quadSize = glyphSize * 0.5;
    float x = (uv.x - 0.5) * quadSize * 2.0;
    float y = (uv.y - 0.5) * quadSize * 2.0;
    
    // Position glyph at radius
    float glyphX = cos(glyphAngle) * baseRadius;
    float glyphZ = sin(glyphAngle) * baseRadius;
    
    pos = vec3(glyphX + x, y, glyphZ - 24.4);
    
    vAngle = glyphAngle;
    vRadius = baseRadius;
    vGradientProgress = glyphSize;
  }
  
  // ============================================
  // LAYER F: ASCENSION BACKPLATE
  // ============================================
  if (ascensionBackplateIndex >= 0.0) {
    // Large ornate backplate
    float backplateWidth = 6.0;
    float backplateHeight = 7.0;
    float x = (uv.x - 0.5) * backplateWidth;
    float y = uv.y * backplateHeight;
    float z = -2.5; // Behind throne
    
    // Breath → flare intensity (handled in fragment)
    
    // High → shimmer streaks (handled in fragment)
    
    pos = vec3(x, y, z - 24.4);
    
    vRadius = length(vec2(x, y));
    vGradientProgress = y / backplateHeight;
  }
  
  // ============================================
  // LAYER G: DIVINE SPIRES
  // ============================================
  if (divineSpireIndex >= 0.0) {
    // 6–12 spires emerging upward
    float numSpires = 12.0;
    float spireAngle = (divineSpireIndex / numSpires) * 6.28318;
    float spireRadius = 4.0;
    float spireHeight = 6.0;
    float t = uv.y; // 0 to 1 along spire
    
    // Scroll → height growth
    float scrollGrowth = uScroll * 0.4;
    spireHeight *= (1.0 + scrollGrowth);
    
    float height = t * spireHeight;
    float radius = spireRadius;
    float x = cos(spireAngle) * radius;
    float z = sin(spireAngle) * radius;
    
    // Spire width
    float spireWidth = 0.12;
    float widthOffset = (uv.x - 0.5) * spireWidth;
    float perpAngle = spireAngle + 1.5708; // Perpendicular
    x += cos(perpAngle) * widthOffset;
    z += sin(perpAngle) * widthOffset;
    
    pos = vec3(x, height, z - 24.4);
    
    vAngle = spireAngle;
    vRadius = radius;
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER H: ORBITAL RUNNER RINGS
  // ============================================
  if (orbitalRunnerIndex >= 0.0) {
    // 2–4 rings with fast runners
    float numRings = 4.0;
    float ringIdx = mod(orbitalRunnerIndex, numRings);
    float runnerIdx = floor(orbitalRunnerIndex / numRings);
    float ringRadius = 3.5 + ringIdx * 0.8; // 3.5 to 6.3
    float angle = uv.x * 6.28318;
    float t = uv.y; // 0 to 1 along runner
    
    // Scroll → speed factor
    float speedFactor = uScroll * 0.5 + 0.2;
    angle += uTime * speedFactor * (1.0 + ringIdx * 0.3);
    
    float radius = ringRadius;
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 2.0 + ringIdx * 0.5;
    
    // Runner width
    float runnerWidth = 0.08;
    float widthOffset = (t - 0.5) * runnerWidth;
    float perpAngle = angle + 1.5708; // Perpendicular
    x += cos(perpAngle) * widthOffset;
    z += sin(perpAngle) * widthOffset;
    
    pos = vec3(x, y, z - 24.4);
    
    vAngle = angle;
    vRadius = radius;
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER I: KARMIC THREAD WEAVE
  // ============================================
  if (karmicThreadIndex >= 0.0) {
    // 20–40 threads connecting throne edges
    float numThreads = 40.0;
    float threadIdx = karmicThreadIndex;
    float t = uv.y; // 0 to 1 along thread
    
    // Connect between points on throne edges
    float angle1 = (threadIdx / numThreads) * 6.28318;
    float angle2 = angle1 + 3.14159; // Opposite side
    float radius1 = 4.0;
    float radius2 = 4.5;
    
    vec2 pos1 = vec2(cos(angle1) * radius1, sin(angle1) * radius1);
    vec2 pos2 = vec2(cos(angle2) * radius2, sin(angle2) * radius2);
    vec2 threadPos = mix(pos1, pos2, t);
    
    // High → weave shimmer (handled in fragment)
    
    // Thread width
    float threadWidth = 0.06;
    float widthOffset = (uv.x - 0.5) * threadWidth;
    
    vec2 tangent = normalize(pos2 - pos1);
    vec2 normal = vec2(-tangent.y, tangent.x);
    threadPos += normal * widthOffset;
    
    pos = vec3(threadPos.x, t * 3.0, threadPos.y - 24.4);
    
    vRadius = length(threadPos);
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER J: SUPREME AURA SHELL
  // ============================================
  if (supremeAuraIndex >= 0.0) {
    // 64×64 spherical fog
    float sphereRadius = 7.0;
    float angle = uv.x * 6.28318;
    float elevation = (uv.y - 0.5) * 3.14159; // -π/2 to π/2
    
    // Breath → opacity pulse (handled in fragment)
    
    // Spherical coordinates
    float radius = sphereRadius;
    float x = cos(elevation) * cos(angle) * radius;
    float y = sin(elevation) * radius;
    float z = cos(elevation) * sin(angle) * radius;
    
    pos = vec3(x, y, z - 24.4);
    
    vRadius = length(vec2(x, z));
    vGradientProgress = (elevation + 1.5708) / 3.14159;
  }
  
  // ============================================
  // LAYER K: LIGHT PILLARS
  // ============================================
  if (lightPillarIndex >= 0.0) {
    // 6–10 vertical beams from throne
    float numPillars = 10.0;
    float pillarAngle = (lightPillarIndex / numPillars) * 6.28318;
    float pillarHeight = 8.0;
    float t = uv.y; // 0 to 1 along pillar
    
    // High → beam shimmer (handled in fragment)
    
    // BlessingWave → bright flash (handled in fragment)
    
    float height = t * pillarHeight;
    float beamWidth = 0.15;
    float widthOffset = (uv.x - 0.5) * beamWidth;
    float perpAngle = pillarAngle + 1.5708; // Perpendicular
    float x = cos(pillarAngle) * 3.5 + cos(perpAngle) * widthOffset;
    float z = sin(pillarAngle) * 3.5 + sin(perpAngle) * widthOffset;
    
    pos = vec3(x, height, z - 24.4);
    
    vAngle = pillarAngle;
    vRadius = length(vec2(x, z));
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER L: CROWN DUST FIELD
  // ============================================
  if (crownDustIndex >= 0.0) {
    // 200–350 particles
    float numParticles = 350.0;
    float angle = (crownDustIndex / numParticles) * 6.28318 * 9.0; // 9 full rotations
    float baseRadius = 0.5 + (crownDustIndex / numParticles) * 7.5; // 0.5 to 8.0
    
    // Bass → jitter
    float bassJitter = sin(uTime * 4.0 + crownDustIndex * 2.0) * uBass * 0.01;
    angle += bassJitter;
    baseRadius += bassJitter * 0.05;
    
    // High → sparkle (handled in fragment)
    
    float radius = baseRadius;
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = sin(angle * 1.9) * 0.3; // Slight vertical variation
    
    // Particle radius
    float particleRadius = 0.0125;
    
    pos = vec3(x, y, z - 24.4);
    pos *= particleRadius; // Scale particle size
    
    vAngle = angle;
    vRadius = radius;
    vGradientProgress = (radius - 0.5) / 7.5;
  }
  
  // ============================================
  // LAYER M: RADIANT ASCENSION RAYS
  // ============================================
  if (ascensionRayIndex >= 0.0) {
    // 12–20 long radial rays
    float numRays = 20.0;
    float rayAngle = (ascensionRayIndex / numRays) * 6.28318;
    float rayLength = 8.0;
    float t = uv.y; // 0 to 1 along ray
    
    // Scroll → rotation acceleration
    float scrollRotation = uScroll * 0.5;
    rayAngle += scrollRotation;
    
    float length = t * rayLength;
    float x = cos(rayAngle) * length;
    float z = sin(rayAngle) * length;
    float y = 0.0;
    
    // Ray width
    float rayWidth = 0.1;
    float widthOffset = (uv.x - 0.5) * rayWidth;
    float perpAngle = rayAngle + 1.5708; // Perpendicular
    x += cos(perpAngle) * widthOffset;
    z += sin(perpAngle) * widthOffset;
    
    pos = vec3(x, y, z - 24.4);
    
    vAngle = rayAngle;
    vRadius = length;
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER N: THRONE HEART CORE
  // ============================================
  if (throneHeartIndex >= 0.0) {
    // Pulsing white-gold core
    float coreRadius = 1.5;
    float angle = uv.x * 6.28318;
    float radius = uv.y * coreRadius;
    
    // Breath → expansion
    float breathExpansion = 1.0 + sin(uBreathPhase * 6.28318) * uBreathStrength * 0.25;
    radius *= breathExpansion;
    
    // High → flare (handled in fragment)
    
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 2.5; // Center of throne
    
    pos = vec3(x, y, z - 24.4);
    
    vRadius = radius;
    vGradientProgress = radius / coreRadius;
  }
  
  // ============================================
  // LAYER O: OUTER THRONE HALO
  // ============================================
  if (outerHaloIndex >= 0.0) {
    // Large rotating halo
    float haloRadius = 6.5;
    float angle = uv.x * 6.28318;
    float thickness = 0.3;
    
    // RotationSync → tilt
    float haloTilt = uRotationSync * 0.15;
    angle += haloTilt;
    
    // High → halo shimmer (handled in fragment)
    
    float radius = haloRadius + (uv.y - 0.5) * thickness;
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 3.0;
    
    pos = vec3(x, y, z - 24.4);
    
    vAngle = angle;
    vRadius = radius;
    vGradientProgress = (radius - 6.5) / 0.3;
  }
  
  // ============================================
  // LAYER P: BLOOM MASK LAYER
  // ============================================
  if (bloomIndex >= 0.0) {
    // Required for bloom post-processing
    // Brightest near Heart Core
    float discRadius = 5.2;
    float angle = uv.x * 6.28318;
    float radius = uv.y * discRadius;
    
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 0.0;
    
    pos = vec3(x, y, z - 24.4);
    
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

