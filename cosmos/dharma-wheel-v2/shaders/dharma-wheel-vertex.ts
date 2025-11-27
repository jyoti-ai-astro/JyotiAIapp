/**
 * Dharma Wheel v2 Vertex Shader
 * 
 * Phase 2 — Section 55: DHARMA WHEEL ENGINE v2
 * Dharma Wheel Engine v2 (E59)
 * 
 * 7-layer rotational karmic mandala: Core Mandala Disk, Rotating Karmic Spokes, Outer Chakra Ring, Karmic Glyphs, Rotating Mantra Bands, Aura Flame Shell, Mandala Dust Field
 */

export const dharmaWheelVertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;
attribute float mandalaIndex;
attribute float spokeIndex;
attribute float chakraRingIndex;
attribute float glyphIndex;
attribute float mantraBandIndex;
attribute float flameIndex;
attribute float dustIndex;
attribute float radialSegment; // Radial segment index
attribute float concentricRing; // Concentric ring index

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
varying float vMandalaIndex;
varying float vSpokeIndex;
varying float vChakraRingIndex;
varying float vGlyphIndex;
varying float vMantraBandIndex;
varying float vFlameIndex;
varying float vDustIndex;
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
  vMandalaIndex = mandalaIndex;
  vSpokeIndex = spokeIndex;
  vChakraRingIndex = chakraRingIndex;
  vGlyphIndex = glyphIndex;
  vMantraBandIndex = mantraBandIndex;
  vFlameIndex = flameIndex;
  vDustIndex = dustIndex;
  vRadialSegment = radialSegment;
  vConcentricRing = concentricRing;
  
  vec3 pos = position;
  
  // ============================================
  // LAYER A: CORE MANDALA DISK
  // ============================================
  if (mandalaIndex >= 0.0) {
    // Circular disk subdivided into 64 radial + 32 concentric rings
    float diskRadius = 3.5;
    float angle = uv.x * 6.28318; // 0 to 2π
    float radius = uv.y * diskRadius; // 0 to diskRadius
    
    // Scroll → rotation acceleration
    float scrollRotation = uScroll * 0.4;
    angle += scrollRotation;
    
    // Breath → radius expansion pulse
    float breathExpansion = 1.0 + sin(uBreathPhase * 6.28318) * uBreathStrength * 0.15;
    radius *= breathExpansion;
    
    // High → shimmer pulse (handled in fragment)
    
    // Convert to 3D position
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 0.0;
    
    pos = vec3(x, y, z - 12.0);
    
    vAngle = angle;
    vRadius = radius;
    vGradientProgress = radius / diskRadius;
  }
  
  // ============================================
  // LAYER B: ROTATING KARMIC SPOKES
  // ============================================
  if (spokeIndex >= 0.0) {
    // 8, 12, or 16 spokes depending on screen size
    // Spokes rotate at speed = base + scroll*0.5
    float numSpokes = 16.0;
    float spokeAngle = (spokeIndex / numSpokes) * 6.28318;
    
    // Rotation speed
    float rotationSpeed = 0.1 + uScroll * 0.5;
    spokeAngle += uTime * rotationSpeed;
    
    // Bass → vibration wobble
    float bassWobble = sin(uTime * 3.5 + spokeIndex * 2.0) * uBass * 0.02;
    spokeAngle += bassWobble;
    
    // High → streak shimmer (handled in fragment)
    
    // Spoke geometry (thin quad extending from center)
    float spokeLength = 3.5;
    float spokeWidth = 0.08;
    float t = uv.y; // 0 to 1 along spoke length
    float widthOffset = (uv.x - 0.5) * spokeWidth;
    
    float radius = t * spokeLength;
    float x = cos(spokeAngle) * radius + cos(spokeAngle + 1.5708) * widthOffset;
    float z = sin(spokeAngle) * radius + sin(spokeAngle + 1.5708) * widthOffset;
    float y = 0.0;
    
    pos = vec3(x, y, z - 12.0);
    
    vAngle = spokeAngle;
    vRadius = radius;
    vGradientProgress = t;
  }
  
  // ============================================
  // LAYER C: OUTER CHAKRA RING
  // ============================================
  if (chakraRingIndex >= 0.0) {
    // 3 nested chakra rings
    float ringIdx = chakraRingIndex;
    float baseRadius = 3.8 + ringIdx * 0.4; // 3.8, 4.2, 4.6
    float angle = uv.x * 6.28318; // 0 to 2π
    float thickness = 0.15;
    
    // RotationSync → ring tilt + sync
    float rotationSync = uRotationSync * 0.3;
    angle += rotationSync;
    
    // Breath → ring radius modulation
    float breathModulation = 1.0 + uBreathStrength * 0.1;
    baseRadius *= breathModulation;
    
    // High → spectral scatter (handled in fragment)
    
    // Ring geometry (toroidal arc)
    float radius = baseRadius + (uv.y - 0.5) * thickness;
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 0.0;
    
    pos = vec3(x, y, z - 12.0);
    
    vAngle = angle;
    vRadius = radius;
    vGradientProgress = (radius - 3.8) / 0.8;
  }
  
  // ============================================
  // LAYER D: KARMIC GLYPHS
  // ============================================
  if (glyphIndex >= 0.0) {
    // 32–48 glyph nodes arranged circularly
    // Glyph pulse equation: sin(time*2.4 + index*0.3)*0.15
    float numGlyphs = 48.0;
    float glyphAngle = (glyphIndex / numGlyphs) * 6.28318;
    float baseRadius = 3.2;
    
    // Glyph pulse
    float glyphPulse = sin(uTime * 2.4 + glyphIndex * 0.3) * 0.15;
    float radius = baseRadius + glyphPulse;
    
    // Bass → glyph jitter
    float bassJitter = sin(uTime * 4.0 + glyphIndex * 2.0) * uBass * 0.01;
    glyphAngle += bassJitter;
    radius += bassJitter * 0.05;
    
    // High → sparkle noise (handled in fragment)
    
    // Glyph size
    float glyphSize = 0.18;
    float quadSize = glyphSize * 0.5;
    float x = (uv.x - 0.5) * quadSize * 2.0;
    float y = (uv.y - 0.5) * quadSize * 2.0;
    
    // Position glyph at radius
    float glyphX = cos(glyphAngle) * radius;
    float glyphZ = sin(glyphAngle) * radius;
    
    pos = vec3(glyphX + x, y, glyphZ - 12.0);
    
    vAngle = glyphAngle;
    vRadius = radius;
    vGradientProgress = glyphPulse;
  }
  
  // ============================================
  // LAYER E: ROTATING MANTRA BANDS
  // ============================================
  if (mantraBandIndex >= 0.0) {
    // 2 rotating bands of mantra-like symbols
    // Bands scroll at rate = scroll*0.3 + 0.05
    float bandIdx = mantraBandIndex;
    float baseRadius = 2.8 + bandIdx * 0.6; // 2.8, 3.4
    float angle = uv.x * 6.28318; // 0 to 2π
    
    // Bands scroll at rate = scroll*0.3 + 0.05
    float scrollRate = uScroll * 0.3 + 0.05;
    angle += uTime * scrollRate;
    
    // Breath → band scale pulse
    float breathPulse = 1.0 + uBreathStrength * 0.12;
    baseRadius *= breathPulse;
    
    // High → shimmer dust (handled in fragment)
    
    // Band geometry (curved ring strip)
    float thickness = 0.12;
    float radius = baseRadius + (uv.y - 0.5) * thickness;
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = 0.0;
    
    pos = vec3(x, y, z - 12.0);
    
    vAngle = angle;
    vRadius = radius;
    vGradientProgress = (radius - 2.8) / 0.6;
  }
  
  // ============================================
  // LAYER F: AURA FLAME SHELL
  // ============================================
  if (flameIndex >= 0.0) {
    // 1.5 unit thick shell
    // Flame equation: sin(angle*6.0 + time*2.2)*0.25
    float baseRadius = 4.0;
    float angle = uv.x * 6.28318; // 0 to 2π
    float thickness = 1.5;
    
    // Flame equation
    float flameHeight = sin(angle * 6.0 + uTime * 2.2) * 0.25;
    
    // Breath → flame height swell
    float breathSwell = 1.0 + uBreathStrength * 0.15;
    flameHeight *= breathSwell;
    
    // Scroll → upward drift
    float scrollDrift = uScroll * 0.2;
    flameHeight += scrollDrift * 0.3;
    
    // Shell geometry
    float radius = baseRadius + (uv.y - 0.5) * thickness;
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = flameHeight;
    
    pos = vec3(x, y, z - 12.0);
    
    vAngle = angle;
    vRadius = radius;
    vGradientProgress = flameHeight;
  }
  
  // ============================================
  // LAYER G: MANDALA DUST FIELD
  // ============================================
  if (dustIndex >= 0.0) {
    // 200–260 drifting dust particulates
    float numDust = 260.0;
    float angle = (dustIndex / numDust) * 6.28318 * 4.0; // 4 full rotations
    float baseRadius = 1.5 + (dustIndex / numDust) * 4.5; // 1.5 to 6.0
    
    // Bass → jitter
    float bassJitter = sin(uTime * 4.0 + dustIndex * 2.0) * uBass * 0.01;
    angle += bassJitter;
    baseRadius += bassJitter * 0.05;
    
    // High → sparkle (handled in fragment)
    
    // Dust radius
    float dustRadius = 0.0125;
    
    // Convert to 3D position
    float radius = baseRadius;
    float x = cos(angle) * radius;
    float z = sin(angle) * radius;
    float y = sin(angle * 1.8) * 0.1; // Slight vertical variation
    
    pos = vec3(x, y, z - 12.0);
    pos *= dustRadius; // Scale particle size
    
    vAngle = angle;
    vRadius = radius;
    vGradientProgress = (radius - 1.5) / 4.5;
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

