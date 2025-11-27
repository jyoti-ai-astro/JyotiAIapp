/**
 * Divine Orb Fragment Shader
 * 
 * Phase 2 — Section 5: KUNDALINI ENERGY WAVE SYSTEM
 * Orb of Divine Consciousness Engine (E10)
 * 
 * Creates 5-layer orb with:
 * - Core Light Sphere (soft radial glow)
 * - Energy Swirl Layer (sinusoidal distortion bands)
 * - Mandala Emission Layer (rotating mandala lines)
 * - Refraction Layer (glass-like distortion)
 * - Divine Spark Layer (sparkles using FBM noise)
 * - Full spherical refraction effect
 * - Bloom mask for high-energy sparkle points
 */

export const orbFragmentShader = `
precision mediump float;

uniform float uTime;
uniform float uIntensity;
uniform float uScroll;
uniform float uBass;
uniform float uMid;
uniform float uHigh;
uniform vec2 uMouse;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vWorldPosition;
varying float vDistance;
varying float vRadialDistance;

// Noise functions
float hash(float n) {
  return fract(sin(n) * 43758.5453123);
}

float hash2(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(float x) {
  float i = floor(x);
  float f = fract(x);
  return mix(hash(i), hash(i + 1.0), smoothstep(0.0, 1.0, f));
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
  for (int i = 0; i < 4; i++) {
    value += amplitude * noise2(p);
    p *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

float fbm3(vec3 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 3; i++) {
    value += amplitude * noise2(p.xy + p.z);
    p *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vec3 pos = normalize(vPosition);
  vec3 normal = normalize(vNormal);
  
  // ============================================
  // LAYER 1: CORE LIGHT SPHERE (Soft Radial Glow)
  // ============================================
  float distFromCenter = length(vPosition);
  float coreGlow = 1.0 - smoothstep(0.3, 1.0, distFromCenter);
  
  // Core colors (golden-white)
  vec3 coreColor1 = vec3(1.0, 0.95, 0.85);  // Light gold
  vec3 coreColor2 = vec3(1.0, 0.90, 0.70);  // Golden
  vec3 coreColor = mix(coreColor1, coreColor2, distFromCenter);
  
  // Bass-driven intensity
  coreColor *= (1.0 + uBass * 0.3);
  
  vec3 finalColor = coreColor * coreGlow;
  float alpha = coreGlow * 0.6;
  
  // ============================================
  // LAYER 2: ENERGY SWIRL LAYER (Sinusoidal Distortion Bands)
  // ============================================
  float swirlAngle = atan(pos.y, pos.x);
  float swirlDist = length(pos.xy);
  float swirl = sin(swirlDist * 8.0 - uTime * 2.0 + swirlAngle * 3.0);
  swirl = smoothstep(0.3, 0.7, swirl);
  
  // Swirl colors (violet-gold)
  vec3 swirlColor1 = vec3(0.80, 0.60, 1.0);  // Violet
  vec3 swirlColor2 = vec3(1.0, 0.85, 0.50);  // Gold
  vec3 swirlColor = mix(swirlColor1, swirlColor2, swirl);
  
  // Mid-driven intensity
  swirlColor *= (1.0 + uMid * 0.2);
  
  finalColor += swirlColor * swirl * 0.4;
  alpha += swirl * 0.2;
  
  // ============================================
  // LAYER 3: MANDALA EMISSION LAYER (Rotating Mandala Lines)
  // ============================================
  // 16-segment mandala
  float segments = 16.0;
  float angle = atan(pos.y, pos.x);
  float segmentAngle = angle / (3.14159 * 2.0) * segments;
  float segmentLocal = fract(segmentAngle);
  
  // Rotating mandala lines
  float mandalaRotation = uTime * 0.5;
  float rotatedAngle = angle + mandalaRotation;
  float rotatedSegment = (rotatedAngle / (3.14159 * 2.0) * segments);
  float rotatedLocal = fract(rotatedSegment);
  
  float mandalaLine = smoothstep(0.02, 0.0, rotatedLocal);
  mandalaLine += smoothstep(0.02, 0.0, 1.0 - rotatedLocal);
  
  // Concentric circles
  float circleCount = 6.0;
  float circleIndex = floor(distFromCenter * circleCount);
  float circleLocal = fract(distFromCenter * circleCount);
  float circleLine = smoothstep(0.015, 0.0, circleLocal);
  
  float mandalaPattern = max(mandalaLine, circleLine);
  
  // Mandala colors (gold-white)
  vec3 mandalaColor = vec3(1.0, 0.92, 0.75);
  
  finalColor += mandalaColor * mandalaPattern * 0.5;
  alpha += mandalaPattern * 0.3;
  
  // ============================================
  // LAYER 4: REFRACTION LAYER (Glass-like Distortion)
  // ============================================
  // Full spherical refraction effect
  vec3 refractedNormal = normal;
  
  // Refraction distortion
  vec3 refractionDistortion = vec3(
    fbm(pos.xy * 2.0 + uTime * 0.3),
    fbm(pos.yz * 2.0 + uTime * 0.3 + 100.0),
    fbm(pos.zx * 2.0 + uTime * 0.3 + 200.0)
  ) * 0.1;
  refractedNormal += refractionDistortion;
  refractedNormal = normalize(refractedNormal);
  
  // Refraction color (subtle blue-white)
  vec3 refractionColor = vec3(0.90, 0.95, 1.0);
  
  // Refraction intensity based on angle
  float fresnel = pow(1.0 - dot(normalize(vWorldPosition - vec3(0.0)), refractedNormal), 2.0);
  fresnel = smoothstep(0.3, 0.7, fresnel);
  
  // Mid-driven refraction intensity
  fresnel *= (1.0 + uMid * 0.3);
  
  finalColor += refractionColor * fresnel * 0.3;
  alpha += fresnel * 0.2;
  
  // ============================================
  // LAYER 5: DIVINE SPARK LAYER (Sparkles using FBM Noise)
  // ============================================
  // High-frequency sparkles
  vec3 sparkPos = pos * 5.0;
  float sparkle = fbm3(sparkPos + uTime * 0.5);
  sparkle = smoothstep(0.7, 1.0, sparkle);
  
  // High-driven shimmer sparkles
  float shimmer = sin(uTime * 15.0 + sparkPos.x * 10.0 + sparkPos.y * 10.0) * 0.5 + 0.5;
  shimmer = smoothstep(0.6, 1.0, shimmer);
  sparkle *= shimmer;
  sparkle *= uHigh;
  
  // Sparkle colors (white-gold)
  vec3 sparkleColor = vec3(1.0, 1.0, 0.95);
  
  finalColor += sparkleColor * sparkle * 1.0;
  
  // Bloom mask for high-energy sparkle points
  float bloom = smoothstep(0.8, 1.0, sparkle);
  bloom *= (1.0 + uHigh * 0.5);
  alpha += bloom * 0.4;
  
  // ============================================
  // FINAL COMPOSITION
  // ============================================
  // Scroll affects overall intensity
  finalColor *= (0.8 + uScroll * 0.2);
  alpha *= (0.8 + uScroll * 0.2);
  
  // Intensity multiplier
  finalColor *= uIntensity;
  alpha *= uIntensity;
  
  // Clamp
  finalColor = clamp(finalColor, 0.0, 1.0);
  alpha = clamp(alpha, 0.0, 1.0);
  
  gl_FragColor = vec4(finalColor, alpha);
}
`;

