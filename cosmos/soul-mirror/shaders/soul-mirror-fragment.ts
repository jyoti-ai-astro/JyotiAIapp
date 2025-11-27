/**
 * Soul Mirror Fragment Shader
 * 
 * Phase 2 — Section 26: SOUL MIRROR ENGINE
 * Soul Mirror Engine (E30)
 * 
 * 3-layer soul mirror: Core Mirror Disc, Echo Reflections, Soul Glyph Reflections
 */

export const soulMirrorFragmentShader = `
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
varying float vMirrorDiscIndex;
varying float vEchoRingIndex;
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
// LAYER A: CORE MIRROR DISC
// ============================================
vec3 coreMirrorDisc(vec2 uv) {
  if (vMirrorDiscIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // Large circular reflective disc (radius ~0.7)
  float discRadius = 0.7;
  float discDist = sdCircle(p, discRadius);
  float discMask = 1.0 - smoothstep(0.0, 0.02, discDist);
  
  // Metal reflect shader (fake env reflection via radial gradient + FBM)
  vec2 radialDir = normalize(p);
  float radialAngle = atan(radialDir.y, radialDir.x);
  
  // Radial gradient for reflection
  float radialGradient = dist / discRadius;
  
  // FBM for reflective distortion
  float reflectionNoise = fbm(uv * 5.0 + uTime * 0.1);
  
  // Bass → ripples on surface: sin(dist*15.0 + time*5.0) * uBass * 0.05
  float bassRipple = sin(dist * 15.0 + uTime * 5.0) * uBass * 0.05;
  
  // Mid → reflective distortion: fbm(uv*3 + time*0.3) * uMid * 0.1
  float midDistortion = fbm(uv * 3.0 + uTime * 0.3) * uMid * 0.1;
  
  // High → highlight shimmer on edges
  float edgeShimmer = 0.0;
  if (dist > discRadius * 0.8) {
    float shimmer = fbm(uv * 10.0 + uTime * 0.5);
    shimmer = smoothstep(0.7, 1.0, shimmer);
    edgeShimmer = shimmer * uHigh * 0.3;
  }
  
  // Color: Silver-gold reflective gradient
  vec3 silverColor = vec3(0.9, 0.9, 0.95);
  vec3 goldColor = vec3(1.0, 0.85, 0.6);
  vec3 mirrorColor = mix(silverColor, goldColor, radialGradient * 0.5 + reflectionNoise * 0.3);
  
  // Add ripple and distortion
  mirrorColor += vec3(bassRipple * 0.1);
  mirrorColor += vec3(midDistortion * 0.1);
  mirrorColor += vec3(edgeShimmer);
  
  return mirrorColor * discMask;
}

// ============================================
// LAYER B: ECHO REFLECTIONS
// ============================================
vec3 echoReflections(vec2 uv) {
  if (vEchoRingIndex < 0.0) {
    return vec3(0.0);
  }
  
  vec2 center = vec2(0.5, 0.5);
  vec2 p = uv - center;
  float dist = length(p);
  
  // 3-5 echo rings behind mirror
  float ringRadius = 0.75 + vEchoRingIndex * 0.15;
  float ringThickness = 0.02;
  
  // Scroll → spacing shift: ringRadius += uScroll * 0.2
  ringRadius += uScroll * 0.2;
  
  // Draw ring
  float ringDist = sdRing(p, ringRadius, ringThickness);
  float ringMask = 1.0 - smoothstep(0.0, 0.01, ringDist);
  
  // BlessingWave → bright pulsation outward
  float pulse = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    pulse = uBlessingWaveProgress * 0.5;
  }
  
  // Rings fade based on depth
  float depthFade = 1.0 - (vEchoRingIndex / 5.0) * 0.5;
  
  // Color: White → violet halos
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  vec3 violetColor = vec3(0.8, 0.6, 1.0);
  vec3 ringColor = mix(whiteColor, violetColor, vEchoRingIndex / 5.0);
  
  return ringColor * ringMask * depthFade * (1.0 + pulse);
}

// ============================================
// LAYER C: SOUL GLYPH REFLECTIONS
// ============================================
vec3 soulGlyphReflections(vec2 uv) {
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
  
  // Glyphs fade-in on scroll > 0.35: opacity = smoothstep(0.35, 0.55, uScroll)
  float scrollOpacity = smoothstep(0.35, 0.55, uScroll);
  
  // Breath → subtle pulsation
  float breathPulse = 1.0 + uBreathStrength * 0.1;
  
  // High → shimmer flicker: fbm(uv*15 + time) * uHigh * 0.3
  float shimmer = fbm(uv * 15.0 + uTime) * uHigh * 0.3;
  shimmer = smoothstep(0.6, 1.0, shimmer);
  
  // BlessingWave → burst of glow intensity
  float blessingGlow = 0.0;
  if (uBlessingWaveProgress > 0.0) {
    blessingGlow = uBlessingWaveProgress * 0.4;
  }
  
  // Color: Gold-white with blessing glow
  vec3 glyphColor = vec3(1.0, 0.95, 0.9);
  vec3 blessingColor = vec3(1.0, 1.0, 1.0);
  glyphColor = mix(glyphColor, blessingColor, blessingGlow);
  
  return glyphColor * glyphGlow * scrollOpacity * breathPulse * (1.0 + shimmer + blessingGlow);
}

void main() {
  vec2 uv = vUv;
  
  // ============================================
  // COMBINE ALL LAYERS (Additive Blending)
  // ============================================
  vec3 finalColor = vec3(0.0);
  float bloomMask = 0.0;
  
  // Layer A: Core Mirror Disc
  vec3 layerA = coreMirrorDisc(uv);
  finalColor += layerA * 0.7;
  bloomMask = max(bloomMask, length(layerA));
  
  // Layer B: Echo Reflections
  vec3 layerB = echoReflections(uv);
  finalColor += layerB * 0.5;
  bloomMask = max(bloomMask, length(layerB));
  
  // Layer C: Soul Glyph Reflections
  vec3 layerC = soulGlyphReflections(uv);
  finalColor += layerC * 0.6;
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

