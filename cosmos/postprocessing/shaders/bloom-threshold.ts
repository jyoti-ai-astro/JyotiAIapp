/**
 * Bloom Threshold Shader
 * 
 * Phase 2 — Section 5: KUNDALINI ENERGY WAVE SYSTEM
 * Celestial Lens & Bloom Engine (E12)
 * 
 * Selective bloom thresholding based on masks from cosmic layers
 */

export const bloomThresholdShader = `
precision highp float;

uniform sampler2D inputTexture;
uniform float uThreshold;
uniform float uBass;
uniform float uMid;
uniform float uHigh;

varying vec2 vUv;

// ACES tone mapping helper
vec3 acesFilm(vec3 x) {
  float a = 2.51;
  float b = 0.03;
  float c = 2.43;
  float d = 0.59;
  float e = 0.14;
  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}

void main() {
  vec4 color = texture2D(inputTexture, vUv);
  
  // Extract luminance
  float luminance = dot(color.rgb, vec3(0.299, 0.587, 0.114));
  
  // Base threshold
  float threshold = uThreshold;
  
  // Bass → Bloom Strength Boost (+0.1 to +0.4)
  threshold -= (0.1 + uBass * 0.3);
  
  // Extract bright areas
  float bloom = max(0.0, luminance - threshold);
  bloom = smoothstep(0.0, 1.0, bloom);
  
  // Mid → Bloom Radius Modulation (affects extraction)
  bloom *= (1.0 + uMid * 0.2);
  
  // High → Sparkle Bloom Layer (adds glitter)
  float sparkle = sin(vUv.x * 20.0 + vUv.y * 20.0) * 0.5 + 0.5;
  sparkle = smoothstep(0.7, 1.0, sparkle);
  sparkle *= uHigh;
  bloom += sparkle * 0.3;
  
  // Output bloom mask
  gl_FragColor = vec4(color.rgb * bloom, bloom);
}
`;

