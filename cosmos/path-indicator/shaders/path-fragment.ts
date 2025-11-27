/**
 * Path Indicator Fragment Shader
 * 
 * Phase 2 — Section 20: DIVINE PATH INDICATOR ENGINE
 * Path Indicator Engine (E24)
 * 
 * 3-layer path indicator: Footstep Light Beads, Golden Line Path, Future Footstep Projections
 */

export const pathFragmentShader = `
precision mediump float;

uniform float uTime;
uniform float uIntensity;
uniform float uBreathPhase;
uniform float uBreathStrength;
uniform float uBass;
uniform float uMid;
uniform float uHigh;
uniform float uScroll;
uniform float uBlessingWaveProgress;

varying vec2 vUv;
varying vec3 vPosition;
varying float vBeadIndex;
varying float vDistance;
varying float vRadialDistance;

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

// SDF functions
float sdCircle(vec2 p, float r) {
  return length(p) - r;
}

// ============================================
// LAYER A: FOOTSTEP LIGHT BEADS
// ============================================
vec3 footstepLightBeads(vec2 uv) {
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // Bead position along spline (from vertex shader)
  float beadT = vBeadIndex / 20.0;
  
  // Bead radius
  float beadRadius = 0.03;
  
  // Breath-linked brightness: 0.8 + uBreathStrength * 0.3
  float brightness = 0.8 + uBreathStrength * 0.3;
  
  // Soft radial falloff per bead
  float beadDist = sdCircle(p, beadRadius);
  float beadGlow = 1.0 - smoothstep(0.0, beadRadius * 2.0, beadDist);
  
  // High → sparkle shimmer
  float shimmer = sin(uTime * 15.0 + beadT * 20.0) * 0.5 + 0.5;
  shimmer = smoothstep(0.7, 1.0, shimmer);
  shimmer *= uHigh * 0.4;
  
  // BlessingWave → brightness surge (progress * 0.5)
  float blessingSurge = uBlessingWaveProgress * 0.5;
  brightness += blessingSurge;
  
  // Color: Gold → White
  vec3 goldColor = vec3(1.0, 0.85, 0.5);
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 beadColor = mix(goldColor, whiteColor, uBreathStrength);
  
  // Soft bloom
  float bloom = 1.0 - smoothstep(0.0, beadRadius * 3.0, beadDist);
  
  return beadColor * beadGlow * brightness * (1.0 + shimmer) * bloom;
}

// ============================================
// LAYER B: GOLDEN LINE PATH
// ============================================
vec3 goldenLinePath(vec2 uv) {
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  
  // Path follows spline curve (approximate with smooth curve)
  float beadT = vBeadIndex / 20.0;
  
  // Line thickness modulation based on scroll
  float baseThickness = 0.015;
  float scrollThickness = uScroll * 0.01;
  float lineThickness = baseThickness + scrollThickness;
  
  // Bass → subtle wobble
  float wobble = sin(uTime * 2.0 + beadT * 10.0) * uBass * 0.005;
  p.x += wobble;
  
  // Distance from path center (approximate as distance from bead center)
  float pathDist = length(p);
  
  // Smoothstep thickness mask
  float lineMask = 1.0 - smoothstep(0.0, lineThickness, pathDist);
  
  // Color: Golden
  vec3 lineColor = vec3(1.0, 0.9, 0.6);
  
  // Fade along path (stronger near beads, weaker between)
  float pathFade = sin(beadT * 3.14159) * 0.5 + 0.5; // Sin wave for smooth fade
  
  return lineColor * lineMask * pathFade * 0.6;
}

// ============================================
// LAYER C: FUTURE FOOTSTEP PROJECTIONS
// ============================================
vec3 futureFootstepProjections(vec2 uv) {
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // Projection dots extend forward (higher bead indices)
  float beadT = vBeadIndex / 20.0;
  
  // Only show projections for future steps (t > 0.5)
  if (beadT < 0.5) {
    return vec3(0.0);
  }
  
  // Fade over scroll depth
  float scrollFade = 1.0 - smoothstep(0.5, 1.0, uScroll);
  
  // Projection dot radius
  float dotRadius = 0.02;
  
  // Distance from dot center
  float dotDist = sdCircle(p, dotRadius);
  float dotGlow = 1.0 - smoothstep(0.0, dotRadius * 2.0, dotDist);
  
  // High-frequency shimmer
  float shimmer = fbm(uv * 15.0 + uTime * 0.5);
  shimmer = smoothstep(0.6, 1.0, shimmer);
  shimmer *= uHigh * 0.3;
  
  // Color: Subtle violet sparks
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  
  // Fade based on distance along path
  float pathFade = 1.0 - smoothstep(0.5, 1.0, beadT);
  
  return violetColor * dotGlow * scrollFade * pathFade * (0.3 + shimmer);
}

void main() {
  vec2 uv = vUv;
  
  // ============================================
  // COMBINE ALL LAYERS (Additive Blending)
  // ============================================
  vec3 finalColor = vec3(0.0);
  float bloomMask = 0.0;
  
  // Layer A: Footstep Light Beads
  vec3 layerA = footstepLightBeads(uv);
  finalColor += layerA;
  bloomMask = max(bloomMask, length(layerA));
  
  // Layer B: Golden Line Path
  vec3 layerB = goldenLinePath(uv);
  finalColor += layerB;
  bloomMask = max(bloomMask, length(layerB));
  
  // Layer C: Future Footstep Projections
  vec3 layerC = futureFootstepProjections(uv);
  finalColor += layerC;
  bloomMask = max(bloomMask, length(layerC));
  
  // ============================================
  // BLESSINGWAVE RADIANCE
  // ============================================
  // uBlessingWaveProgress * 0.4
  if (uBlessingWaveProgress > 0.0) {
    float blessingRadiance = uBlessingWaveProgress * 0.4;
    vec3 blessingColor = mix(
      vec3(1.0, 0.9, 0.7),  // Gold
      vec3(1.0, 1.0, 1.0),  // White
      uBlessingWaveProgress
    );
    finalColor += blessingColor * blessingRadiance;
    bloomMask = max(bloomMask, blessingRadiance);
  }
  
  // ============================================
  // FINAL COMPOSITION
  // ============================================
  finalColor *= uIntensity;
  
  float alpha = min(length(finalColor), 0.9);
  
  // Clamp
  finalColor = clamp(finalColor, 0.0, 1.0);
  alpha = clamp(alpha, 0.0, 1.0);
  
  // Output color and bloom mask (for E12 post-processing)
  // Bloom mask stored in alpha channel intensity
  gl_FragColor = vec4(finalColor, alpha * bloomMask);
}
`;

