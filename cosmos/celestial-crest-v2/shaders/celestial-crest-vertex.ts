/**
 * Celestial Crest v2 Vertex Shader
 * 
 * Phase 2 — Section 66: CELESTIAL CREST ENGINE v2
 * Celestial Crest Engine v2 (E70)
 * 
 * 28-layer ultimate crest: Crest Base Plate, Twin Royal Crest Pillars, Triple Crest Arches, Supreme Crest Halo, Celestial Crest Rune Band, Crest Spiral Ribbons, Crest Glyph Ring, Orbital Crest Runners, Crest Light Shafts, Crest Flame Shell, Crest Fog Plane, Crest Dust Field, Crest Spiral Matrix, Ascension Crest Rays, Outer Crest Halo, Inner Crest Core, Crest Energy Threads, Dimensional Crest Ripple, Crest Wave Rings, Crest Particle Stream, Supreme Crest Aura Field, Crest Spires, Crest Rune Crown, Crest Lattice Veil, Crest Warp Layer, Bloom Mask Layer, Crown-Crest Interlink Layer, Crest-Sanctum Resonance Layer
 */

export const celestialCrestVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;
attribute float basePlateIndex;
attribute float twinPillarIndex;
attribute float tripleArchIndex;
attribute float supremeHaloIndex;
attribute float runeBandIndex;
attribute float spiralRibbonIndex;
attribute float glyphRingIndex;
attribute float orbitalRunnerIndex;
attribute float lightShaftIndex;
attribute float flameShellIndex;
attribute float fogPlaneIndex;
attribute float dustFieldIndex;
attribute float spiralMatrixIndex;
attribute float crestRayIndex;
attribute float outerHaloIndex;
attribute float innerCoreIndex;
attribute float energyThreadIndex;
attribute float rippleIndex;
attribute float waveRingIndex;
attribute float particleStreamIndex;
attribute float auraFieldIndex;
attribute float crestSpireIndex;
attribute float runeCrownIndex;
attribute float latticeVeilIndex;
attribute float warpLayerIndex;
attribute float bloomIndex;
attribute float interlinkIndex;
attribute float resonanceIndex;
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
varying float vBasePlateIndex;
varying float vTwinPillarIndex;
varying float vTripleArchIndex;
varying float vSupremeHaloIndex;
varying float vRuneBandIndex;
varying float vSpiralRibbonIndex;
varying float vGlyphRingIndex;
varying float vOrbitalRunnerIndex;
varying float vLightShaftIndex;
varying float vFlameShellIndex;
varying float vFogPlaneIndex;
varying float vDustFieldIndex;
varying float vSpiralMatrixIndex;
varying float vCrestRayIndex;
varying float vOuterHaloIndex;
varying float vInnerCoreIndex;
varying float vEnergyThreadIndex;
varying float vRippleIndex;
varying float vWaveRingIndex;
varying float vParticleStreamIndex;
varying float vAuraFieldIndex;
varying float vCrestSpireIndex;
varying float vRuneCrownIndex;
varying float vLatticeVeilIndex;
varying float vWarpLayerIndex;
varying float vBloomIndex;
varying float vInterlinkIndex;
varying float vResonanceIndex;
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
  float angle = t * 6.28318 * 4.0 * rotationSpeed;
  float baseRadius = 0.3;
  float maxRadius = 7.5;
  float radius = baseRadius * exp(t * log(maxRadius / baseRadius));
  
  float x = cos(angle) * radius;
  float z = sin(angle) * radius;
  
  return vec2(x, z);
}

void main() {
  vUv = uv;
  vBasePlateIndex = basePlateIndex;
  vTwinPillarIndex = twinPillarIndex;
  vTripleArchIndex = tripleArchIndex;
  vSupremeHaloIndex = supremeHaloIndex;
  vRuneBandIndex = runeBandIndex;
  vSpiralRibbonIndex = spiralRibbonIndex;
  vGlyphRingIndex = glyphRingIndex;
  vOrbitalRunnerIndex = orbitalRunnerIndex;
  vLightShaftIndex = lightShaftIndex;
  vFlameShellIndex = flameShellIndex;
  vFogPlaneIndex = fogPlaneIndex;
  vDustFieldIndex = dustFieldIndex;
  vSpiralMatrixIndex = spiralMatrixIndex;
  vCrestRayIndex = crestRayIndex;
  vOuterHaloIndex = outerHaloIndex;
  vInnerCoreIndex = innerCoreIndex;
  vEnergyThreadIndex = energyThreadIndex;
  vRippleIndex = rippleIndex;
  vWaveRingIndex = waveRingIndex;
  vParticleStreamIndex = particleStreamIndex;
  vAuraFieldIndex = auraFieldIndex;
  vCrestSpireIndex = crestSpireIndex;
  vRuneCrownIndex = runeCrownIndex;
  vLatticeVeilIndex = latticeVeilIndex;
  vWarpLayerIndex = warpLayerIndex;
  vBloomIndex = bloomIndex;
  vInterlinkIndex = interlinkIndex;
  vResonanceIndex = resonanceIndex;
  vRadialSegment = radialSegment;
  vConcentricRing = concentricRing;
  
  vec3 pos = position;
  
  // ============================================
  // LAYER A: CREST BASE PLATE
  // ============================================
  if (basePlateIndex >= 0.0) {
    float crestRadius = 7.5;
    float angle = uv.x * 6.28318;
    float radius = uv.y * crestRadius;
    
    // Scroll → rotation
    float scrollRotation = uScroll * 0.6;
    angle += scrollRotation;
    
    // Breath → pulsation
    float breathPulse = 1.0 + sin(uBreathPhase * 6.28318) * uBreathStrength * 0.12;
    radius *= breathPulse;
    
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 0.0;
    
    pos = vec3(x, y, z - 42.6);
    
    vAngle = angle;
    vRadius = radius;
    vGradientProgress = radius / crestRadius;
  }
  
  // ============================================
  // LAYER B: TWIN ROYAL CREST PILLARS
  // ============================================
  if (twinPillarIndex >= 0.0) {
    float pillarIdx = twinPillarIndex;
    float pillarAngle = pillarIdx * 3.14159; // 0 or π
    float pillarRadius = 6.0;
    float pillarHeight = 11.0;
    float t = uv.y; // 0 to 1 along pillar
    
    // Bass → vibration wobble
    float bassWobble = sin(uTime * 3.5 + pillarIdx * 2.0) * uBass * 0.02;
    pillarAngle += bassWobble;
    pillarRadius += bassWobble * 0.05;
    
    float height = t * pillarHeight;
    float pillarWidth = 0.24;
    float widthOffset = (uv.x - 0.5) * pillarWidth;
    float perpAngle = pillarAngle + 1.5708;
    float x = cos(pillarAngle) * pillarRadius + cos(perpAngle) * widthOffset;
    float z = sin(pillarAngle) * pillarRadius + sin(perpAngle) * widthOffset;
    
    pos = vec3(x, height, z - 42.6);
    
    vAngle = pillarAngle;
    vRadius = pillarRadius;
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER C: TRIPLE CREST ARCHES
  // ============================================
  if (tripleArchIndex >= 0.0) {
    float archIdx = tripleArchIndex;
    float archRadius = 5.5 + archIdx * 0.7; // 5.5 to 6.9
    float angle = uv.x * 6.28318;
    
    // RotationSync → tilt
    float archTilt = uRotationSync * 0.15;
    angle += archTilt;
    
    float radius = archRadius;
    float archThickness = 0.35;
    radius += (uv.y - 0.5) * archThickness;
    
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 4.5 + archIdx * 0.6;
    
    pos = vec3(x, y, z - 42.6);
    
    vAngle = angle;
    vRadius = radius;
    vGradientProgress = archIdx / 3.0;
  }
  
  // ============================================
  // LAYER D: SUPREME CREST HALO
  // ============================================
  if (supremeHaloIndex >= 0.0) {
    float haloRadius = 6.5;
    float angle = uv.x * 6.28318;
    
    // RotationSync → rotation
    float haloRotation = uRotationSync * 0.15;
    angle += haloRotation;
    
    float radius = haloRadius;
    float haloThickness = 0.28;
    radius += (uv.y - 0.5) * haloThickness;
    
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 2.5;
    
    pos = vec3(x, y, z - 42.6);
    
    vAngle = angle;
    vRadius = radius;
    vGradientProgress = (radius - 6.5) / 0.28;
  }
  
  // ============================================
  // LAYER E: CELESTIAL CREST RUNE BAND
  // ============================================
  if (runeBandIndex >= 0.0) {
    float numRunes = 140.0;
    float runeAngle = (runeBandIndex / numRunes) * 6.28318;
    float baseRadius = 7.0;
    
    // BlessingWave → rune flash (handled in fragment)
    
    float runeSize = 0.28;
    float quadSize = runeSize * 0.5;
    float x = (uv.x - 0.5) * quadSize * 2.0;
    float y = (uv.y - 0.5) * quadSize * 2.0;
    
    float runeX = cos(runeAngle) * baseRadius;
    float runeZ = sin(runeAngle) * baseRadius;
    
    pos = vec3(runeX + x, y, runeZ - 42.6);
    
    vAngle = runeAngle;
    vRadius = baseRadius;
    vGradientProgress = runeSize;
  }
  
  // ============================================
  // LAYER F: CREST SPIRAL RIBBONS
  // ============================================
  if (spiralRibbonIndex >= 0.0) {
    float ribbonIdx = spiralRibbonIndex;
    float rotationSpeed = 0.75 + ribbonIdx * 0.18;
    float t = uv.y; // 0 to 1 along ribbon
    
    vec2 spiralPos = logarithmicSpiral(t, ribbonIdx, rotationSpeed);
    
    // Scroll → ribbon speed
    float scrollSpeed = uScroll * 0.4;
    t += scrollSpeed;
    t = mod(t, 1.0);
    spiralPos = logarithmicSpiral(t, ribbonIdx, rotationSpeed);
    
    float ribbonWidth = 0.14;
    float widthOffset = (uv.x - 0.5) * ribbonWidth;
    
    vec2 tangent = normalize(spiralPos);
    vec2 normal = vec2(-tangent.y, tangent.x);
    spiralPos += normal * widthOffset;
    
    pos = vec3(spiralPos.x, t * 4.5, spiralPos.y - 42.6);
    
    vAngle = atan(spiralPos.y, spiralPos.x);
    vRadius = length(spiralPos);
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER G: CREST GLYPH RING
  // ============================================
  if (glyphRingIndex >= 0.0) {
    float numGlyphs = 140.0;
    float glyphAngle = (glyphRingIndex / numGlyphs) * 6.28318;
    float baseRadius = 6.5;
    
    // BlessingWave → glyph flash (handled in fragment)
    
    float glyphSize = 0.26;
    float quadSize = glyphSize * 0.5;
    float x = (uv.x - 0.5) * quadSize * 2.0;
    float y = (uv.y - 0.5) * quadSize * 2.0;
    
    float glyphX = cos(glyphAngle) * baseRadius;
    float glyphZ = sin(glyphAngle) * baseRadius;
    
    pos = vec3(glyphX + x, y, glyphZ - 42.6);
    
    vAngle = glyphAngle;
    vRadius = baseRadius;
    vGradientProgress = glyphSize;
  }
  
  // ============================================
  // LAYER H: ORBITAL CREST RUNNERS
  // ============================================
  if (orbitalRunnerIndex >= 0.0) {
    float numRunners = 16.0;
    float runnerIdx = orbitalRunnerIndex;
    float runnerRadius = 6.5;
    float angle = (runnerIdx / numRunners) * 6.28318 + uTime * 2.4; // Fast rotation
    
    // High → sparkle (handled in fragment)
    
    float runnerSize = 0.18;
    float quadSize = runnerSize * 0.5;
    float x = (uv.x - 0.5) * quadSize * 2.0;
    float y = (uv.y - 0.5) * quadSize * 2.0;
    
    float runnerX = cos(angle) * runnerRadius;
    float runnerZ = sin(angle) * runnerRadius;
    
    pos = vec3(runnerX + x, y, runnerZ - 42.6);
    
    vAngle = angle;
    vRadius = runnerRadius;
    vGradientProgress = runnerIdx / numRunners;
  }
  
  // ============================================
  // LAYER I: CREST LIGHT SHAFTS
  // ============================================
  if (lightShaftIndex >= 0.0) {
    float numShafts = 16.0;
    float shaftAngle = (lightShaftIndex / numShafts) * 6.28318;
    float shaftHeight = 11.5;
    float t = uv.y; // 0 to 1 along shaft
    
    float height = t * shaftHeight;
    float shaftWidth = 0.24;
    float widthOffset = (uv.x - 0.5) * shaftWidth;
    float perpAngle = shaftAngle + 1.5708;
    float x = cos(shaftAngle) * 5.5 + cos(perpAngle) * widthOffset;
    float z = sin(shaftAngle) * 5.5 + sin(perpAngle) * widthOffset;
    
    pos = vec3(x, height, z - 42.6);
    
    vAngle = shaftAngle;
    vRadius = length(vec2(x, z));
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER J: CREST FLAME SHELL
  // ============================================
  if (flameShellIndex >= 0.0) {
    float flameWidth = 15.0;
    float flameHeight = 15.0;
    
    vec2 xz = vec2((uv.x - 0.5) * flameWidth, (uv.y - 0.5) * flameHeight);
    
    // fbm flame
    float flameDensity = fbm(xz * 0.3 + uTime * 0.2) * 0.8;
    
    float height = flameDensity * 3.2;
    xz += normalize(xz) * flameDensity * 0.3;
    
    pos = vec3(xz.x, height, xz.y - 42.6);
    
    vRadius = length(xz);
    vGradientProgress = flameDensity;
  }
  
  // ============================================
  // LAYER K: CREST FOG PLANE
  // ============================================
  if (fogPlaneIndex >= 0.0) {
    float fogWidth = 15.0;
    float fogHeight = 15.0;
    
    vec2 xz = vec2((uv.x - 0.5) * fogWidth, (uv.y - 0.5) * fogHeight);
    
    // fbm fog
    float fogDensity = fbm(xz * 0.3 + uTime * 0.15) * 0.8;
    
    // Breath → pulse (handled in fragment)
    
    xz += normalize(xz) * fogDensity * 0.3;
    
    pos = vec3(xz.x, fogDensity * 0.8, xz.y - 42.6);
    
    vRadius = length(xz);
    vGradientProgress = fogDensity;
  }
  
  // ============================================
  // LAYER L: CREST DUST FIELD
  // ============================================
  if (dustFieldIndex >= 0.0) {
    float numParticles = 500.0;
    float angle = (dustFieldIndex / numParticles) * 6.28318 * 26.0; // 26 full rotations
    float baseRadius = 0.1 + (dustFieldIndex / numParticles) * 10.0; // 0.1 to 10.1
    
    // Bass → jitter
    float bassJitter = sin(uTime * 4.0 + dustFieldIndex * 2.0) * uBass * 0.01;
    angle += bassJitter;
    baseRadius += bassJitter * 0.05;
    
    float radius = baseRadius;
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = sin(angle * 2.0) * 0.9;
    
    float particleRadius = 0.01;
    
    pos = vec3(x, y, z - 42.6);
    pos *= particleRadius;
    
    vAngle = angle;
    vRadius = radius;
    vGradientProgress = (radius - 0.1) / 10.0;
  }
  
  // ============================================
  // LAYER M: CREST SPIRAL MATRIX
  // ============================================
  if (spiralMatrixIndex >= 0.0) {
    float numSpirals = 22.0;
    float spiralIdx = spiralMatrixIndex;
    float rotationSpeed = 0.65 + spiralIdx * 0.06;
    float t = uv.y; // 0 to 1 along spiral
    
    vec2 spiralPos = logarithmicSpiral(t, spiralIdx, rotationSpeed);
    
    float spiralWidth = 0.14;
    float widthOffset = (uv.x - 0.5) * spiralWidth;
    
    vec2 tangent = normalize(spiralPos);
    vec2 normal = vec2(-tangent.y, tangent.x);
    spiralPos += normal * widthOffset;
    
    pos = vec3(spiralPos.x, t * 4.5, spiralPos.y - 42.6);
    
    vAngle = atan(spiralPos.y, spiralPos.x);
    vRadius = length(spiralPos);
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER N: ASCENSION CREST RAYS
  // ============================================
  if (crestRayIndex >= 0.0) {
    float numRays = 28.0;
    float rayAngle = (crestRayIndex / numRays) * 6.28318;
    float rayLength = 13.0;
    float t = uv.y; // 0 to 1 along ray
    
    float length = t * rayLength;
    float x = cos(rayAngle) * length;
    float z = sin(rayAngle) * length;
    float y = 0.0;
    
    float rayWidth = 0.2;
    float widthOffset = (uv.x - 0.5) * rayWidth;
    float perpAngle = rayAngle + 1.5708;
    x += cos(perpAngle) * widthOffset;
    z += sin(perpAngle) * widthOffset;
    
    pos = vec3(x, y, z - 42.6);
    
    vAngle = rayAngle;
    vRadius = length;
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER O: OUTER CREST HALO
  // ============================================
  if (outerHaloIndex >= 0.0) {
    float haloRadius = 8.5;
    float angle = uv.x * 6.28318;
    float thickness = 0.45;
    
    // RotationSync → rotation
    float haloRotation = uRotationSync * 0.15;
    angle += haloRotation;
    
    float radius = haloRadius + (uv.y - 0.5) * thickness;
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 0.0;
    
    pos = vec3(x, y, z - 42.6);
    
    vAngle = angle;
    vRadius = radius;
    vGradientProgress = (radius - 8.5) / 0.45;
  }
  
  // ============================================
  // LAYER P: INNER CREST CORE
  // ============================================
  if (innerCoreIndex >= 0.0) {
    float coreRadius = 2.8;
    float angle = uv.x * 6.28318;
    float radius = uv.y * coreRadius;
    
    // Breath → pulse
    float breathPulse = 1.0 + sin(uBreathPhase * 6.28318) * uBreathStrength * 0.22;
    radius *= breathPulse;
    
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 0.0;
    
    pos = vec3(x, y, z - 42.6);
    
    vRadius = radius;
    vGradientProgress = radius / coreRadius;
  }
  
  // ============================================
  // LAYER Q: CREST ENERGY THREADS
  // ============================================
  if (energyThreadIndex >= 0.0) {
    float numThreads = 55.0;
    float threadIdx = energyThreadIndex;
    float t = uv.y; // 0 to 1 along thread
    
    float angle1 = (threadIdx / numThreads) * 6.28318;
    float angle2 = angle1 + 1.25664; // 72 degrees
    float radius1 = 4.5;
    float radius2 = 7.5;
    
    vec2 pos1 = vec2(cos(angle1) * radius1, sin(angle1) * radius1);
    vec2 pos2 = vec2(cos(angle2) * radius2, sin(angle2) * radius2);
    
    vec2 threadPos = mix(pos1, pos2, t);
    
    // Breath → thickness pulse (handled in fragment)
    
    float threadWidth = 0.13;
    float widthOffset = (uv.x - 0.5) * threadWidth;
    
    vec2 tangent = normalize(pos2 - pos1);
    vec2 normal = vec2(-tangent.y, tangent.x);
    threadPos += normal * widthOffset;
    
    pos = vec3(threadPos.x, t * 3.5, threadPos.y - 42.6);
    
    vRadius = length(threadPos);
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER R: DIMENSIONAL CREST RIPPLE
  // ============================================
  if (rippleIndex >= 0.0) {
    float rippleWidth = 15.0;
    float rippleHeight = 15.0;
    
    vec2 xz = vec2((uv.x - 0.5) * rippleWidth, (uv.y - 0.5) * rippleHeight);
    
    // fbm ripple
    float rippleDensity = fbm(xz * 0.28 + uTime * 0.16) * 0.8;
    
    // Scroll → ripple drift
    float scrollRipple = uScroll * 0.35;
    xz += normalize(xz) * scrollRipple * 0.24;
    rippleDensity = fbm(xz * 0.28 + uTime * 0.16) * 0.8;
    
    xz += normalize(xz) * rippleDensity * 0.38;
    
    pos = vec3(xz.x, rippleDensity * 0.7, xz.y - 42.6);
    
    vRadius = length(xz);
    vGradientProgress = rippleDensity;
  }
  
  // ============================================
  // LAYER S: CREST WAVE RINGS
  // ============================================
  if (waveRingIndex >= 0.0) {
    float numWaves = 16.0;
    float waveIdx = waveRingIndex;
    float baseRadius = 3.5 + (waveIdx / numWaves) * 6.0; // 3.5 to 9.5
    float angle = uv.x * 6.28318;
    float thickness = 0.26;
    
    // Mid → turbulence jitter
    float midJitter = sin(uTime * 4.0 + waveIdx * 2.0) * uMid * 0.02;
    baseRadius += midJitter;
    
    float radius = baseRadius + (uv.y - 0.5) * thickness;
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 0.0;
    
    pos = vec3(x, y, z - 42.6);
    
    vAngle = angle;
    vRadius = radius;
    vGradientProgress = (radius - 3.5) / 6.0;
  }
  
  // ============================================
  // LAYER T: CREST PARTICLE STREAM
  // ============================================
  if (particleStreamIndex >= 0.0) {
    float numParticles = 500.0;
    float angle = (particleStreamIndex / numParticles) * 6.28318 * 28.0; // 28 full rotations
    float baseRadius = 0.08 + (particleStreamIndex / numParticles) * 10.5; // 0.08 to 10.58
    
    float radius = baseRadius;
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = sin(angle * 2.0) * 1.0;
    
    float particleRadius = 0.01;
    
    pos = vec3(x, y, z - 42.6);
    pos *= particleRadius;
    
    vAngle = angle;
    vRadius = radius;
    vGradientProgress = (radius - 0.08) / 10.5;
  }
  
  // ============================================
  // LAYER U: SUPREME CREST AURA FIELD
  // ============================================
  if (auraFieldIndex >= 0.0) {
    float auraRadius = 8.0;
    float angle = uv.x * 6.28318;
    float radius = uv.y * auraRadius;
    
    // Breath → pulse (handled in fragment)
    
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 0.0;
    
    pos = vec3(x, y, z - 42.6);
    
    vRadius = radius;
    vGradientProgress = radius / auraRadius;
  }
  
  // ============================================
  // LAYER V: CREST SPIRES
  // ============================================
  if (crestSpireIndex >= 0.0) {
    float numSpires = 14.0;
    float spireAngle = (crestSpireIndex / numSpires) * 6.28318;
    float spireRadius = 6.0;
    float spireHeight = 12.0;
    float t = uv.y; // 0 to 1 along spire
    
    float height = t * spireHeight;
    float spireWidth = 0.22;
    float widthOffset = (uv.x - 0.5) * spireWidth;
    float perpAngle = spireAngle + 1.5708;
    float x = cos(spireAngle) * spireRadius + cos(perpAngle) * widthOffset;
    float z = sin(spireAngle) * spireRadius + sin(perpAngle) * widthOffset;
    
    pos = vec3(x, height, z - 42.6);
    
    vAngle = spireAngle;
    vRadius = spireRadius;
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER W: CREST RUNE CROWN
  // ============================================
  if (runeCrownIndex >= 0.0) {
    float numRunes = 140.0;
    float runeAngle = (runeCrownIndex / numRunes) * 6.28318;
    float baseRadius = 7.2;
    
    // BlessingWave → rune flash (handled in fragment)
    
    float runeSize = 0.28;
    float quadSize = runeSize * 0.5;
    float x = (uv.x - 0.5) * quadSize * 2.0;
    float y = (uv.y - 0.5) * quadSize * 2.0;
    
    float runeX = cos(runeAngle) * baseRadius;
    float runeZ = sin(runeAngle) * baseRadius;
    
    pos = vec3(runeX + x, y, runeZ - 42.6);
    
    vAngle = runeAngle;
    vRadius = baseRadius;
    vGradientProgress = runeSize;
  }
  
  // ============================================
  // LAYER X: CREST LATTICE VEIL
  // ============================================
  if (latticeVeilIndex >= 0.0) {
    float latticeWidth = 15.0;
    float latticeHeight = 15.0;
    
    vec2 xz = vec2((uv.x - 0.5) * latticeWidth, (uv.y - 0.5) * latticeHeight);
    
    // fbm lattice
    float latticeDensity = fbm(xz * 0.3 + uTime * 0.15) * 0.8;
    
    // Scroll → drift
    float scrollDrift = uScroll * 0.3;
    xz += normalize(xz) * scrollDrift * 0.2;
    latticeDensity = fbm(xz * 0.3 + uTime * 0.15) * 0.8;
    
    xz += normalize(xz) * latticeDensity * 0.3;
    
    pos = vec3(xz.x, latticeDensity * 0.7, xz.y - 42.6);
    
    vRadius = length(xz);
    vGradientProgress = latticeDensity;
  }
  
  // ============================================
  // LAYER Y: CREST WARP LAYER
  // ============================================
  if (warpLayerIndex >= 0.0) {
    float warpWidth = 15.0;
    float warpHeight = 15.0;
    
    vec2 xz = vec2((uv.x - 0.5) * warpWidth, (uv.y - 0.5) * warpHeight);
    
    // fbm warp distortion
    float warpDensity = fbm(xz * 0.24 + uTime * 0.19) * 0.8;
    
    // Scroll → warp drift
    float scrollWarp = uScroll * 0.4;
    xz += normalize(xz) * scrollWarp * 0.28;
    warpDensity = fbm(xz * 0.24 + uTime * 0.19) * 0.8;
    
    xz += normalize(xz) * warpDensity * 0.5;
    
    pos = vec3(xz.x, warpDensity * 0.8, xz.y - 42.6);
    
    vRadius = length(xz);
    vGradientProgress = warpDensity;
  }
  
  // ============================================
  // LAYER Z: BLOOM MASK LAYER
  // ============================================
  if (bloomIndex >= 0.0) {
    float crestRadius = 7.5;
    float angle = uv.x * 6.28318;
    float radius = uv.y * crestRadius;
    
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 0.0;
    
    pos = vec3(x, y, z - 42.6);
    
    vRadius = radius;
    vGradientProgress = radius / crestRadius;
  }
  
  // ============================================
  // LAYER AA: CROWN-CREST INTERLINK LAYER
  // ============================================
  if (interlinkIndex >= 0.0) {
    float interlinkWidth = 15.0;
    float interlinkHeight = 15.0;
    
    vec2 xz = vec2((uv.x - 0.5) * interlinkWidth, (uv.y - 0.5) * interlinkHeight);
    
    // Crown-crest resonance shimmer (handled in fragment)
    // fbm interlink pattern
    float interlinkDensity = fbm(xz * 0.26 + uTime * 0.17) * 0.8;
    
    // Scroll → interlink drift
    float scrollInterlink = uScroll * 0.36;
    xz += normalize(xz) * scrollInterlink * 0.26;
    interlinkDensity = fbm(xz * 0.26 + uTime * 0.17) * 0.8;
    
    xz += normalize(xz) * interlinkDensity * 0.42;
    
    pos = vec3(xz.x, interlinkDensity * 0.75, xz.y - 42.6);
    
    vRadius = length(xz);
    vGradientProgress = interlinkDensity;
  }
  
  // ============================================
  // LAYER AB: CREST-SANCTUM RESONANCE LAYER
  // ============================================
  if (resonanceIndex >= 0.0) {
    float resonanceWidth = 15.0;
    float resonanceHeight = 15.0;
    
    vec2 xz = vec2((uv.x - 0.5) * resonanceWidth, (uv.y - 0.5) * resonanceHeight);
    
    // Crest-sanctum resonance shimmer (handled in fragment)
    // fbm resonance pattern
    float resonanceDensity = fbm(xz * 0.27 + uTime * 0.18) * 0.8;
    
    // Scroll → resonance drift
    float scrollResonance = uScroll * 0.38;
    xz += normalize(xz) * scrollResonance * 0.27;
    resonanceDensity = fbm(xz * 0.27 + uTime * 0.18) * 0.8;
    
    xz += normalize(xz) * resonanceDensity * 0.45;
    
    pos = vec3(xz.x, resonanceDensity * 0.8, xz.y - 42.6);
    
    vRadius = length(xz);
    vGradientProgress = resonanceDensity;
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

