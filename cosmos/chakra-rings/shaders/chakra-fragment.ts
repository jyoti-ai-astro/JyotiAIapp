/**
 * Chakra Ring Fragment Shader
 * 
 * Phase 2 — Section 5: KUNDALINI ENERGY WAVE SYSTEM
 * Chakra Glow Rings Engine (E6)
 * 
 * Creates glow rings with:
 * - Chakra-specific colors
 * - Glow + bloom mask
 * - Pulse animation
 * - Scroll-reactive intensity
 */

export const chakraFragmentShader = `
precision mediump float;

uniform float uTime;
uniform float uIntensity;
uniform float uScroll;
uniform float uBass;
uniform float uChakraPulse;
uniform vec3 uChakraColor;

varying vec2 vUv;
varying vec3 vPosition;
varying float vDistance;
varying float vPulse;

void main() {
  vec2 uv = vUv;
  
  // ============================================
  // RING SHAPE (circular gradient)
  // ============================================
  // Distance from center of ring
  float distFromCenter = abs(uv.y - 0.5) * 2.0;
  
  // Ring glow (soft falloff)
  float ringGlow = 1.0 - smoothstep(0.3, 1.0, distFromCenter);
  
  // ============================================
  // PULSE ANIMATION
  // ============================================
  float pulse = vPulse;
  ringGlow *= (0.7 + pulse * 0.3);
  
  // ============================================
  // CHAKRA COLOR
  // ============================================
  vec3 chakraColor = uChakraColor;
  
  // Chakra pulse intensifies color
  chakraColor *= (1.0 + uChakraPulse * 0.4);
  
  // ============================================
  // GLOW + BLOOM MASK
  // ============================================
  // Inner glow (brighter center)
  float innerGlow = 1.0 - smoothstep(0.0, 0.5, distFromCenter);
  innerGlow *= pulse;
  
  // Outer glow (soft halo)
  float outerGlow = smoothstep(0.7, 1.0, distFromCenter);
  
  // Combined glow
  float totalGlow = ringGlow + innerGlow * 0.5 + outerGlow * 0.3;
  
  // Bloom mask for post-processing
  float bloomMask = smoothstep(0.6, 1.0, totalGlow);
  bloomMask *= (1.0 + uBass * 0.3);
  
  // ============================================
  // COLOR COMPOSITION
  // ============================================
  vec3 finalColor = chakraColor * totalGlow;
  
  // Add white highlight at peak
  finalColor += vec3(1.0) * innerGlow * 0.3;
  
  // ============================================
  // SCROLL-REACTIVE INTENSITY
  // ============================================
  float scrollIntensity = 0.5 + uScroll * 0.5;
  finalColor *= scrollIntensity;
  
  // ============================================
  // BASS-DRIVEN BRIGHTNESS
  // ============================================
  finalColor *= (1.0 + uBass * 0.4);
  
  // ============================================
  // ALPHA CALCULATION
  // ============================================
  float alpha = totalGlow * uIntensity;
  alpha *= scrollIntensity;
  alpha *= (0.6 + pulse * 0.4);
  
  // Edge fade
  float edgeFade = 1.0 - smoothstep(0.0, 0.1, min(uv.x, 1.0 - uv.x));
  alpha *= edgeFade;
  
  // Clamp
  finalColor = clamp(finalColor, 0.0, 1.0);
  alpha = clamp(alpha, 0.0, 1.0);
  
  gl_FragColor = vec4(finalColor, alpha);
}
`;

