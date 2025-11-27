/**
 * Alignment Grid Fragment Shader
 * 
 * Phase 2 — Section 22: COSMIC ALIGNMENT GRID ENGINE
 * Alignment Grid Engine (E26)
 * 
 * 3-layer sacred geometry grid: Major Cosmic Grid, Mandala Subgrid, Depth Lines
 */

export const gridFragmentShader = `
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
uniform float uGridRotation;
uniform float uCameraFOV;

varying vec2 vUv;
varying vec3 vPosition;
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

// Sacred ratios
#define PHI 1.618033988749895
#define SQRT2 1.4142135623730951
#define SQRT3 1.7320508075688772

// ============================================
// LAYER A: MAJOR COSMIC GRID
// ============================================
vec3 majorCosmicGrid(vec2 uv) {
  vec2 center = vec2(0.5, 0.5);
  vec2 p = (uv - center) * 20.0; // Scale up for grid
  
  // Grid spacing using sacred ratios: phi, sqrt2, sqrt3
  float gridSpacingX = PHI;
  float gridSpacingY = SQRT2;
  
  // Scroll → spacing modulation
  float spacingMod = 1.0 + uScroll * 0.2;
  gridSpacingX *= spacingMod;
  gridSpacingY *= spacingMod;
  
  // Audio (bass) → grid breathing effect (scale 0.98→1.02)
  float breathScale = 0.98 + uBass * 0.04; // 0.98 to 1.02
  p *= breathScale;
  
  // Grid lines
  vec2 gridCoord = p;
  vec2 gridCell = floor(gridCoord / vec2(gridSpacingX, gridSpacingY));
  vec2 gridUV = fract(gridCoord / vec2(gridSpacingX, gridSpacingY));
  
  // Draw grid lines
  float lineWidth = 0.02;
  float gridLineX = step(lineWidth, gridUV.x) * step(gridUV.x, 1.0 - lineWidth);
  float gridLineY = step(lineWidth, gridUV.y) * step(gridUV.y, 1.0 - lineWidth);
  float gridLines = 1.0 - min(gridLineX, gridLineY);
  
  // High → shimmer on grid intersections
  float intersection = 1.0 - gridLineX * gridLineY;
  float shimmer = fbm(gridCell * 5.0 + uTime * 0.5);
  shimmer = smoothstep(0.7, 1.0, shimmer);
  shimmer *= uHigh * 0.3;
  intersection *= shimmer;
  
  // Color: Subtle gold
  vec3 gridColor = vec3(1.0, 0.9, 0.7) * 0.4;
  
  return gridColor * (gridLines + intersection);
}

// ============================================
// LAYER B: MANDALA SUBGRID
// ============================================
vec3 mandalaSubgrid(vec2 uv) {
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  float angle = atan(p.y, p.x);
  
  // 12-fold radial mandala spokes
  float numSpokes = 12.0;
  float spokeAngle = angle * numSpokes / 6.28318; // Normalize to 0-12
  float spokeIndex = floor(spokeAngle);
  float spokeFract = fract(spokeAngle);
  
  // Scroll → spoke thickness modulation
  float baseThickness = 0.01;
  float scrollThickness = uScroll * 0.005;
  float spokeThickness = baseThickness + scrollThickness;
  
  // Draw radial lines
  float spokeLine = 1.0 - smoothstep(0.0, spokeThickness, abs(spokeFract - 0.5) * 2.0);
  
  // Audio mid → micro-rotation vibration
  float midVibration = sin(uTime * 5.0 + dist * 10.0) * uMid * 0.01;
  spokeLine *= (1.0 + midVibration);
  
  // Color: gold → white gradient
  vec3 goldColor = vec3(1.0, 0.85, 0.5);
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  float gradientT = dist / 0.5; // Normalize to 0-1
  vec3 mandalaColor = mix(goldColor, whiteColor, gradientT);
  
  // BlessingWave → bright radial pulse (progress * 0.4)
  float blessingPulse = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    float pulseDist = abs(dist - uBlessingWaveProgress * 0.3);
    blessingPulse = 1.0 - smoothstep(0.0, 0.1, pulseDist);
    blessingPulse *= uBlessingWaveProgress * 0.4;
  }
  
  return mandalaColor * spokeLine * (1.0 + blessingPulse);
}

// ============================================
// LAYER C: DEPTH LINES
// ============================================
vec3 depthLines(vec2 uv) {
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  
  // Vertical depth lines pointing toward vanishing point
  // Camera FOV → determines line divergence
  float fovFactor = uCameraFOV / 75.0;
  float divergence = 0.3 * fovFactor;
  
  // Vanishing point (center)
  vec2 vanishingPoint = vec2(0.0, 0.0);
  vec2 toVanishing = vanishingPoint - p;
  float distToVanishing = length(toVanishing);
  
  // Depth lines (vertical lines converging to vanishing point)
  float lineSpacing = 0.1;
  float lineIndex = floor(p.x / lineSpacing);
  float lineFract = fract(p.x / lineSpacing);
  
  // Line thickness (thinner at distance)
  float lineThickness = 0.005 * (1.0 + distToVanishing * 2.0);
  float depthLine = 1.0 - smoothstep(0.0, lineThickness, abs(lineFract - 0.5) * 2.0);
  
  // Scroll → depth progression (lines rise/descend)
  float scrollOffset = uScroll * 0.3;
  depthLine *= (1.0 - smoothstep(0.0, 0.5, abs(p.y + scrollOffset)));
  
  // High → shimmer flicker on distant lines
  float shimmer = fbm(p * 10.0 + uTime * 0.5);
  shimmer = smoothstep(0.6, 1.0, shimmer);
  shimmer *= uHigh * 0.2;
  shimmer *= (1.0 - smoothstep(0.0, 0.5, distToVanishing)); // More shimmer at distance
  
  // Color: Subtle violet-white
  vec3 depthColor = vec3(0.9, 0.8, 1.0) * 0.3;
  
  return depthColor * depthLine * (1.0 + shimmer);
}

void main() {
  vec2 uv = vUv;
  
  // ============================================
  // COMBINE ALL LAYERS (Additive Blending)
  // ============================================
  vec3 finalColor = vec3(0.0);
  float bloomMask = 0.0;
  
  // Layer A: Major Cosmic Grid
  vec3 layerA = majorCosmicGrid(uv);
  finalColor += layerA;
  bloomMask = max(bloomMask, length(layerA));
  
  // Layer B: Mandala Subgrid
  vec3 layerB = mandalaSubgrid(uv);
  finalColor += layerB * 0.6;
  bloomMask = max(bloomMask, length(layerB));
  
  // Layer C: Depth Lines
  vec3 layerC = depthLines(uv);
  finalColor += layerC * 0.4;
  bloomMask = max(bloomMask, length(layerC));
  
  // ============================================
  // BLESSINGWAVE → GLOW BOOST
  // ============================================
  if (uBlessingWaveProgress > 0.0) {
    float glowBoost = uBlessingWaveProgress * 0.3;
    vec3 glowColor = vec3(1.0, 0.95, 0.9);
    finalColor += glowColor * glowBoost;
    bloomMask = max(bloomMask, glowBoost);
  }
  
  // ============================================
  // FINAL COMPOSITION
  // ============================================
  finalColor *= uIntensity;
  
  float alpha = min(length(finalColor), 0.7);
  
  // Clamp
  finalColor = clamp(finalColor, 0.0, 1.0);
  alpha = clamp(alpha, 0.0, 1.0);
  
  // Output color and bloom mask (for E12 post-processing)
  // Bloom mask stored in alpha channel intensity
  gl_FragColor = vec4(finalColor, alpha * bloomMask);
}
`;

