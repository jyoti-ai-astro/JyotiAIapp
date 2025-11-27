/**
 * Energy Ribbon Fragment Shader
 * 
 * Phase 2 — Section 5 Extension: ENERGY RIBBON ENGINE (E5)
 * 
 * Creates golden serpent ribbons with:
 * - Gold → Pink → Violet gradient
 * - Noise-based glow
 * - Additive blending
 * - Bloom mask
 */

export const ribbonFragmentShader = `
precision mediump float;

uniform float uTime;
uniform float uIntensity;
uniform float uBass;
uniform float uHigh;

varying float vNoise;
varying float vPos;
varying vec2 vUv;

void main() {
  // ============================================
  // GOLD → PINK → VIOLET GRADIENT
  // ============================================
  vec3 gold = vec3(1.0, 0.82, 0.2);      // #FFD133 - Gold
  vec3 pink = vec3(1.0, 0.40, 0.75);     // #FF66BF - Pink
  vec3 violet = vec3(0.75, 0.40, 1.0);   // #BF66FF - Violet
  
  // Animated gradient based on position and time
  float gradientMix = smoothstep(0.0, 1.0, fract(vPos * 0.1 + uTime * 0.05));
  
  // Gold → Pink
  vec3 col = mix(gold, pink, gradientMix);
  
  // Pink → Violet (for second half)
  float violetMix = smoothstep(0.5, 1.0, gradientMix);
  col = mix(col, violet, violetMix * 0.5);
  
  // ============================================
  // NOISE GLOW
  // ============================================
  col += vNoise * 0.2;
  
  // ============================================
  // AUDIO-REACTIVE PULSE
  // ============================================
  // Bass intensifies glow
  col *= (1.0 + uBass * 0.3);
  
  // High frequencies add shimmer
  float shimmer = sin(uTime * 5.0 + vPos * 0.5) * 0.1;
  col += shimmer * uHigh;
  
  // ============================================
  // BLOOM MASK (for post-processing)
  // ============================================
  float bloom = smoothstep(0.7, 1.0, length(col));
  bloom *= (1.0 + uBass * 0.2);
  
  // ============================================
  // INTENSITY & ALPHA
  // ============================================
  col *= uIntensity;
  
  // Edge fade for smooth blending
  float edgeFade = 1.0 - smoothstep(0.0, 0.1, min(vUv.x, 1.0 - vUv.x));
  float alpha = 0.8 * edgeFade * uIntensity;
  
  // Add bloom contribution to alpha
  alpha += bloom * 0.3;
  
  // Clamp
  col = clamp(col, 0.0, 1.0);
  alpha = clamp(alpha, 0.0, 1.0);
  
  gl_FragColor = vec4(col, alpha);
}
`;

