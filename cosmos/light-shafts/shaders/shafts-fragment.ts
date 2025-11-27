/**
 * Light Shafts Fragment Shader
 * 
 * Phase 2 — Section 5: KUNDALINI ENERGY WAVE SYSTEM
 * Celestial Light Shafts Engine (E11)
 * 
 * Creates light shaft colors with:
 * - Volumetric light banding (noise-based)
 * - Audio-reactive glow (bass expands, high sparkles)
 * - Scroll-reactive angle shift
 * - Depth fade (beams fade into distance)
 * - Bloom mask
 * - Color ramp: Gold → White → Violet
 */

export const shaftsFragmentShader = `
precision mediump float;

uniform float uTime;
uniform float uIntensity;
uniform float uScroll;
uniform float uBass;
uniform float uMid;
uniform float uHigh;
uniform float uShaftType;  // 0: Solar God-Rays, 1: Divine Beams, 2: Cross-Directional

varying vec2 vUv;
varying vec3 vPosition;
varying float vDistance;
varying float vBeamCoord;
varying float vVolumetricDensity;

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
  for (int i = 0; i < 3; i++) {
    value += amplitude * noise2(p);
    p *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vec2 uv = vUv;
  float dist = vDistance;
  float beamCoord = vBeamCoord;
  
  // ============================================
  // TYPE A: SOLAR GOD-RAYS (Broad, Slow-Moving)
  // ============================================
  if (uShaftType < 0.5) {
    // Broad shafts from center
    float angle = atan(vPosition.y, vPosition.x);
    
    // Volumetric light banding (noise-based)
    float banding = noise(beamCoord * 2.0 + uTime * 0.3);
    banding = smoothstep(0.3, 0.7, banding);
    banding += fbm(vec2(beamCoord * 0.5, angle) + uTime * 0.2) * 0.3;
    
    // Mid turbulence for volumetric density
    banding *= (1.0 + vVolumetricDensity);
    
    // Beam falloff (radial)
    float beamFalloff = 1.0 - smoothstep(0.2, 1.0, length(vPosition.xy));
    
    // Color ramp: Gold → White → Violet
    vec3 gold = vec3(1.0, 0.85, 0.50);
    vec3 white = vec3(1.0, 1.0, 1.0);
    vec3 violet = vec3(0.80, 0.60, 1.0);
    
    float colorMix1 = smoothstep(0.0, 0.5, beamCoord);
    float colorMix2 = smoothstep(0.5, 1.0, beamCoord);
    vec3 shaftColor = mix(gold, white, colorMix1);
    shaftColor = mix(shaftColor, violet, colorMix2);
    
    // Audio-reactive glow (bass expands)
    float glow = banding * beamFalloff;
    glow *= (1.0 + uBass * 0.4);
    
    // High sparkles
    float sparkles = sin(uTime * 12.0 + beamCoord * 10.0) * 0.5 + 0.5;
    sparkles = smoothstep(0.6, 1.0, sparkles);
    sparkles *= uHigh;
    shaftColor += vec3(1.0) * sparkles * 0.5;
    
    // Depth fade
    float depthFade = 1.0 - smoothstep(5.0, 15.0, dist);
    glow *= depthFade;
    
    vec3 finalColor = shaftColor * glow * uIntensity;
    float alpha = glow * 0.5 * uIntensity;
    
    // Bloom mask
    float bloom = smoothstep(0.7, 1.0, glow);
    bloom *= (1.0 + uBass * 0.3);
    alpha += bloom * 0.3;
    
    gl_FragColor = vec4(finalColor, alpha);
    return;
  }
  
  // ============================================
  // TYPE B: DIVINE LIGHT BEAMS (Long, Thin from Top)
  // ============================================
  else if (uShaftType < 1.5) {
    // Long, thin beams from top
    float beamAngle = vPosition.x * 0.5;
    float beamDist = vPosition.y;
    
    // Volumetric light banding (noise-based)
    float banding = noise(beamDist * 3.0 + uTime * 0.4);
    banding = smoothstep(0.4, 0.6, banding);
    banding += fbm(vec2(beamAngle, beamDist * 0.3) + uTime * 0.25) * 0.4;
    
    // Mid turbulence for volumetric density
    banding *= (1.0 + vVolumetricDensity);
    
    // Beam falloff (thin vertical)
    float beamFalloff = 1.0 - smoothstep(0.1, 0.5, abs(vPosition.x));
    
    // Color ramp: Gold → White → Violet
    vec3 gold = vec3(1.0, 0.88, 0.55);
    vec3 white = vec3(1.0, 1.0, 1.0);
    vec3 violet = vec3(0.75, 0.65, 1.0);
    
    float colorMix1 = smoothstep(0.0, 0.4, beamDist);
    float colorMix2 = smoothstep(0.4, 1.0, beamDist);
    vec3 shaftColor = mix(gold, white, colorMix1);
    shaftColor = mix(shaftColor, violet, colorMix2);
    
    // Audio-reactive glow (bass expands)
    float glow = banding * beamFalloff;
    glow *= (1.0 + uBass * 0.5);
    
    // High sparkles
    float sparkles = sin(uTime * 15.0 + beamDist * 12.0) * 0.5 + 0.5;
    sparkles = smoothstep(0.7, 1.0, sparkles);
    sparkles *= uHigh;
    shaftColor += vec3(1.0) * sparkles * 0.6;
    
    // Depth fade
    float depthFade = 1.0 - smoothstep(8.0, 20.0, dist);
    glow *= depthFade;
    
    vec3 finalColor = shaftColor * glow * uIntensity;
    float alpha = glow * 0.6 * uIntensity;
    
    // Bloom mask
    float bloom = smoothstep(0.6, 1.0, glow);
    bloom *= (1.0 + uBass * 0.4);
    alpha += bloom * 0.4;
    
    gl_FragColor = vec4(finalColor, alpha);
    return;
  }
  
  // ============================================
  // TYPE C: CROSS-DIRECTIONAL AURA SHAFTS (X-shaped)
  // ============================================
  else {
    // X-shaped beams
    float angle = atan(vPosition.y, vPosition.x);
    float dist = length(vPosition.xy);
    
    // X-pattern (4 directions)
    float xAngle = mod(angle + 3.14159 * 0.25, 3.14159 * 0.5) - 3.14159 * 0.25;
    
    // Volumetric light banding (noise-based)
    float banding = noise(beamCoord * 2.5 + uTime * 0.35);
    banding = smoothstep(0.35, 0.65, banding);
    banding += fbm(vec2(xAngle * 2.0, beamCoord * 0.4) + uTime * 0.28) * 0.35;
    
    // Mid turbulence for volumetric density
    banding *= (1.0 + vVolumetricDensity);
    
    // Beam falloff (X-pattern)
    float xFalloff = 1.0 - smoothstep(0.15, 0.6, abs(xAngle));
    float radialFalloff = 1.0 - smoothstep(0.3, 1.0, dist);
    float beamFalloff = xFalloff * radialFalloff;
    
    // Color ramp: Gold → White → Violet
    vec3 gold = vec3(1.0, 0.90, 0.60);
    vec3 white = vec3(1.0, 1.0, 1.0);
    vec3 violet = vec3(0.85, 0.70, 1.0);
    
    float colorMix1 = smoothstep(0.0, 0.45, beamCoord);
    float colorMix2 = smoothstep(0.45, 1.0, beamCoord);
    vec3 shaftColor = mix(gold, white, colorMix1);
    shaftColor = mix(shaftColor, violet, colorMix2);
    
    // Audio-reactive glow (bass expands)
    float glow = banding * beamFalloff;
    glow *= (1.0 + uBass * 0.45);
    
    // High sparkles
    float sparkles = sin(uTime * 18.0 + beamCoord * 15.0) * 0.5 + 0.5;
    sparkles = smoothstep(0.65, 1.0, sparkles);
    sparkles *= uHigh;
    shaftColor += vec3(1.0) * sparkles * 0.7;
    
    // Depth fade
    float depthFade = 1.0 - smoothstep(6.0, 18.0, dist);
    glow *= depthFade;
    
    vec3 finalColor = shaftColor * glow * uIntensity;
    float alpha = glow * 0.55 * uIntensity;
    
    // Bloom mask
    float bloom = smoothstep(0.65, 1.0, glow);
    bloom *= (1.0 + uBass * 0.35);
    alpha += bloom * 0.35;
    
    // Clamp
    finalColor = clamp(finalColor, 0.0, 1.0);
    alpha = clamp(alpha, 0.0, 1.0);
    
    gl_FragColor = vec4(finalColor, alpha);
  }
}
`;

