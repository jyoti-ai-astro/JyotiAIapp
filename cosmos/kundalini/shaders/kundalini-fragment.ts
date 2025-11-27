/**
 * Kundalini Fragment Shader
 * 
 * Phase 2 — Section 5: KUNDALINI ENERGY WAVE SYSTEM
 */

export const kundaliniFragmentShader = `
precision mediump float;

uniform float uTime;
uniform float uBreath;
uniform float uBass;
uniform float uMid;
uniform float uHigh;
uniform float uScroll;
uniform vec2 uMouse;
uniform float uIntensity;
uniform float uChakraPulse;

varying vec2 vUv;
varying vec3 vPosition;
varying float vWaveHeight;
varying float vChakraIntensity;

// Noise functions (same as vertex)
vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
  return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v) {
  const vec2  C = vec2(1.0/6.0, 1.0/3.0);
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

float fbm(vec3 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 4; i++) {
    value += amplitude * snoise(p);
    p *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vec2 uv = vUv;
  
  // ============================================
  // LAYER 1: BASE COSMIC GRADIENT (indigo→violet→pink)
  // ============================================
  vec3 indigo = vec3(0.18, 0.08, 0.45);   // Mystic Violet
  vec3 violet = vec3(0.45, 0.20, 0.75);   // Sacred Purple
  vec3 pink = vec3(0.75, 0.35, 0.85);
  
  float gradientMix = uv.y * 0.5 + 0.5;
  vec3 baseColor = mix(indigo, violet, gradientMix);
  baseColor = mix(baseColor, pink, gradientMix * 0.3);
  
  // uScroll shifts color spectrum
  baseColor = mix(baseColor, vec3(baseColor.b, baseColor.r, baseColor.g), uScroll * 0.2);
  
  // ============================================
  // LAYER 2: CHAKRA ENERGY RIBBONS (7 colors)
  // ============================================
  // Chakra positions (normalized Y: -1 to 1)
  float chakraY = uv.y * 2.0 - 1.0;  // -1 to 1
  
  // 7 chakra colors
  vec3 chakraColors[7];
  chakraColors[0] = vec3(1.0, 0.42, 0.42);   // Root - Red
  chakraColors[1] = vec3(1.0, 0.60, 0.40);   // Sacral - Orange
  chakraColors[2] = vec3(1.0, 0.85, 0.40);    // Solar - Yellow
  chakraColors[3] = vec3(0.60, 1.0, 0.80);   // Heart - Green
  chakraColors[4] = vec3(0.40, 0.80, 1.0);   // Throat - Blue
  chakraColors[5] = vec3(0.60, 0.40, 1.0);   // Third Eye - Indigo
  chakraColors[6] = vec3(1.0, 0.60, 1.0);    // Crown - Violet
  
  // Chakra Y positions (normalized -1 to 1)
  float chakraPositions[7];
  chakraPositions[0] = -0.8;  // Root
  chakraPositions[1] = -0.5;  // Sacral
  chakraPositions[2] = -0.2;  // Solar
  chakraPositions[3] = 0.1;   // Heart
  chakraPositions[4] = 0.4;   // Throat
  chakraPositions[5] = 0.7;   // Third Eye
  chakraPositions[6] = 1.0;   // Crown
  
  vec3 chakraRibbon = vec3(0.0);
  float chakraStrength = 0.0;
  
  for (int i = 0; i < 7; i++) {
    float dist = abs(chakraY - chakraPositions[i]);
    float ribbon = sin(dist * 8.0 - uTime * 3.0 + float(i) * 0.5);
    ribbon = smoothstep(0.7, 1.0, ribbon);
    
    float influence = exp(-dist * 5.0);
    chakraRibbon += chakraColors[i] * ribbon * influence * 0.3;
    chakraStrength += influence;
  }
  
  // uChakraPulse intensifies chakra colors
  chakraRibbon *= (1.0 + uChakraPulse * 0.5);
  
  // ============================================
  // LAYER 3: GOLD KUNDALINI SERPENTS (sine-based)
  // ============================================
  // Dual serpents (Ida & Pingala)
  float serpent1 = sin(uv.y * 4.4 + uTime * 2.8) * 0.5 + 0.5;
  float serpent2 = sin(uv.y * 4.4 + uTime * 2.8 + 3.14159) * 0.5 + 0.5;
  
  vec3 gold1 = vec3(1.0, 0.80, 0.40);   // #FFCC66 - base gold
  vec3 gold2 = vec3(1.0, 0.85, 0.56);   // #FFD98E - highlight
  vec3 gold3 = vec3(1.0, 0.72, 0.30);   // #FFB84D - deep gold
  
  vec3 serpentColor = mix(gold1, gold2, serpent1);
  serpentColor = mix(serpentColor, gold3, serpent2 * 0.3);
  
  // uBass intensifies gold serpents
  serpentColor *= (1.0 + uBass * 0.4);
  
  float serpentAlpha = (serpent1 + serpent2) * 0.3;
  
  // ============================================
  // LAYER 4: NOISE-BASED BLOOM MASK
  // ============================================
  float noise = fbm(vPosition * 0.2 + uTime * 0.1);
  float bloomMask = smoothstep(0.5, 0.8, noise);
  bloomMask *= vWaveHeight * 2.0;
  
  // ============================================
  // LAYER 5: SOFT LUMINOSITY MAPPING
  // ============================================
  // Combine all layers
  vec3 finalColor = baseColor;
  
  // Add chakra ribbons
  finalColor += chakraRibbon * chakraStrength;
  
  // Add gold serpents (additive)
  finalColor += serpentColor * serpentAlpha;
  
  // Luminosity mapping
  float luminance = dot(finalColor, vec3(0.299, 0.587, 0.114));
  finalColor = mix(finalColor, vec3(luminance), 0.1);
  
  // ============================================
  // COLOR GRADING
  // ============================================
  // Increase saturation slightly
  finalColor = mix(vec3(luminance), finalColor, 1.1);
  
  // ============================================
  // BLOOM CONTRIBUTION MASK
  // ============================================
  // Store bloom in alpha for post-processing
  float bloomContribution = bloomMask * 0.5;
  
  // ============================================
  // SMOOTH ALPHA FADE
  // ============================================
  float alpha = 0.6;
  alpha *= (0.8 + vWaveHeight * 0.2);
  alpha *= (1.0 + uChakraPulse * 0.2);
  alpha *= uIntensity;
  
  // Edge fade
  float edgeFade = 1.0 - smoothstep(0.0, 0.1, min(uv.x, 1.0 - uv.x));
  edgeFade *= 1.0 - smoothstep(0.0, 0.1, min(uv.y, 1.0 - uv.y));
  alpha *= edgeFade;
  
  // Clamp
  finalColor = clamp(finalColor, 0.0, 1.0);
  alpha = clamp(alpha, 0.0, 1.0);
  
  gl_FragColor = vec4(finalColor, alpha);
}
`;

