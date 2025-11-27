/**
 * Lens Dirt Fragment Shader
 * 
 * Phase 2 — Section 5: KUNDALINI ENERGY WAVE SYSTEM
 * Celestial Lens & Bloom Engine (E12)
 * 
 * Subtle spiritual dust texture shader
 */

export const lensDirtFragmentShader = `
precision highp float;

uniform sampler2D inputTexture;
uniform float uTime;
uniform float uIntensity;
uniform float uScroll;
uniform float uHigh;

varying vec2 vUv;

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
  for (int i = 0; i < 4; i++) {
    value += amplitude * noise2(p);
    p *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vec4 color = texture2D(inputTexture, vUv);
  
  // Spiritual dust texture
  vec2 dustUV = vUv * 2.0;
  float dust = fbm(dustUV + uTime * 0.1);
  dust = smoothstep(0.3, 0.7, dust);
  
  // Subtle dust overlay
  float dustAlpha = dust * 0.15;
  
  // Alpha driven by intensity, scroll, and high
  dustAlpha *= uIntensity;
  dustAlpha *= (0.5 + uScroll * 0.5);
  dustAlpha *= (0.7 + uHigh * 0.3);
  
  // Dust color (warm, spiritual)
  vec3 dustColor = vec3(0.95, 0.90, 0.85);
  
  // Multiply blend mode
  vec3 finalColor = color.rgb * (1.0 - dustAlpha) + color.rgb * dustColor * dustAlpha;
  
  gl_FragColor = vec4(finalColor, color.a);
}
`;

