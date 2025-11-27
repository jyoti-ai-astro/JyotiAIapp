/**
 * Divine Compass Fragment Shader
 * 
 * Phase 2 — Section 27: DIVINE COMPASS ENGINE
 * Divine Compass Engine (E31)
 * 
 * 3-layer divine compass: Outer Sacred Compass Ring, Inner Star Path, Destiny Arrow
 */

export const compassFragmentShader = `
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
varying float vCompassRingIndex;
varying float vStarIndex;
varying float vArrowIndex;
varying float vGlyphIndex;
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

float sdRing(vec2 p, float r, float thickness) {
  return abs(length(p) - r) - thickness;
}

// ============================================
// LAYER A: OUTER SACRED COMPASS RING
// ============================================
vec3 outerCompassRing(vec2 uv) {
  if (vCompassRingIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // 8-direction divine compass ring
  float ringRadius = 0.5;
  float ringThickness = 0.02;
  
  // Draw ring
  float ringDist = sdRing(p, ringRadius, ringThickness);
  float ringMask = 1.0 - smoothstep(0.0, 0.01, ringDist);
  
  // Draw cardinal lines (N, E, S, W)
  float angle = atan(p.y, p.x);
  float cardinalAngle = mod(angle, 1.5708); // π/2
  float cardinalDist = abs(sin(cardinalAngle * 4.0)) * dist;
  float cardinalMask = 1.0 - smoothstep(0.0, 0.01, abs(cardinalDist - ringRadius));
  cardinalMask *= step(0.0, dist) * step(dist, ringRadius * 1.1);
  
  // High → shimmer on glyphs
  float shimmer = fbm(uv * 10.0 + uTime * 0.5);
  shimmer = smoothstep(0.7, 1.0, shimmer);
  shimmer *= uHigh * 0.2;
  
  // Color: Gold → White gradient
  vec3 goldColor = vec3(1.0, 0.85, 0.5);
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  float gradientT = dist / ringRadius;
  vec3 ringColor = mix(goldColor, whiteColor, gradientT);
  
  return ringColor * max(ringMask, cardinalMask) * (1.0 + shimmer);
}

// ============================================
// LAYER A: DIRECTION GLYPHS
// ============================================
vec3 directionGlyphs(vec2 uv) {
  if (vGlyphIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // Small glyphs
  float glyphRadius = 0.04;
  float glyphDist = sdCircle(p, glyphRadius);
  float glyphGlow = 1.0 - smoothstep(0.0, glyphRadius * 2.0, glyphDist);
  
  // High → shimmer on glyphs
  float shimmer = fbm(uv * 15.0 + uTime) * uHigh * 0.3;
  shimmer = smoothstep(0.6, 1.0, shimmer);
  
  // Color: Gold-white
  vec3 glyphColor = vec3(1.0, 0.9, 0.7);
  
  return glyphColor * glyphGlow * (1.0 + shimmer);
}

// ============================================
// LAYER B: INNER STAR PATH
// ============================================
vec3 innerStarPath(vec2 uv) {
  if (vStarIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  float angle = atan(p.y, p.x);
  
  // 12-point star mandala
  float starRadius = 0.35;
  
  // Scroll → star contraction: radius*(1.0 - uScroll * 0.2)
  starRadius *= (1.0 - uScroll * 0.2);
  
  // Star shape (12 points)
  float starAngle = angle * 12.0 / 6.28318; // Normalize to 0-12
  float starPoint = mod(starAngle, 1.0);
  float starDist = dist / starRadius;
  
  // Draw star points
  float starMask = 0.0;
  if (starDist < 1.0) {
    float pointMask = 1.0 - smoothstep(0.0, 0.1, abs(starPoint - 0.5) * 2.0);
    starMask = pointMask * (1.0 - smoothstep(0.7, 1.0, starDist));
  }
  
  // BlessingWave → star flash pulse
  float flashPulse = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    flashPulse = uBlessingWaveProgress * 0.5;
  }
  
  // Mid → turbulence jitter: fbm(uv*5 + time*0.3)*uMid*0.1
  float midJitter = fbm(uv * 5.0 + uTime * 0.3) * uMid * 0.1;
  
  // Color: White-violet spectral gradient
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  float gradientT = dist / starRadius;
  vec3 starColor = mix(whiteColor, violetColor, gradientT * 0.5);
  
  return starColor * starMask * (1.0 + flashPulse + midJitter);
}

// ============================================
// LAYER C: DESTINY ARROW
// ============================================
vec3 destinyArrow(vec2 uv) {
  if (vArrowIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // Glowing arrow pointer
  float arrowLength = 0.3;
  float arrowWidth = 0.02;
  
  // Arrow shape (triangle pointing outward)
  float arrowDist = dist / arrowLength;
  float arrowMask = 0.0;
  
  if (arrowDist < 1.0) {
    // Arrow head
    float headSize = 0.08;
    float headDist = dist / headSize;
    if (headDist < 1.0) {
      arrowMask = 1.0 - smoothstep(0.0, 0.3, headDist);
    }
    
    // Arrow shaft
    float shaftWidth = arrowWidth;
    float shaftDist = abs(p.x) / shaftWidth;
    if (shaftDist < 1.0 && dist > headSize) {
      arrowMask = max(arrowMask, 1.0 - smoothstep(0.0, 0.5, shaftDist));
    }
  }
  
  // Breath → pulse scale (already in vertex)
  
  // BlessingWave → arrow glow burst
  float glowBurst = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    glowBurst = uBlessingWaveProgress * 0.6;
  }
  
  // Color: Bright gold/white
  vec3 goldColor = vec3(1.0, 0.9, 0.6);
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 arrowColor = mix(goldColor, whiteColor, glowBurst);
  
  return arrowColor * arrowMask * (1.0 + glowBurst);
}

void main() {
  vec2 uv = vUv;
  
  // ============================================
  // COMBINE ALL LAYERS (Additive Blending)
  // ============================================
  vec3 finalColor = vec3(0.0);
  float bloomMask = 0.0;
  
  // Layer A: Outer Sacred Compass Ring
  vec3 layerA = outerCompassRing(uv);
  finalColor += layerA * 0.7;
  bloomMask = max(bloomMask, length(layerA));
  
  // Layer A: Direction Glyphs
  vec3 layerAGlyphs = directionGlyphs(uv);
  finalColor += layerAGlyphs * 0.6;
  bloomMask = max(bloomMask, length(layerAGlyphs));
  
  // Layer B: Inner Star Path
  vec3 layerB = innerStarPath(uv);
  finalColor += layerB * 0.6;
  bloomMask = max(bloomMask, length(layerB));
  
  // Layer C: Destiny Arrow
  vec3 layerC = destinyArrow(uv);
  finalColor += layerC * 0.8;
  bloomMask = max(bloomMask, length(layerC));
  
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

