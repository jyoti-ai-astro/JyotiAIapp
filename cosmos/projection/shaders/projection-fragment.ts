/**
 * Projection Fragment Shader
 * 
 * Phase 2 — Section 14: QUALITY ASSURANCE + BROWSER COMPATIBILITY + STRESS TESTING
 * Sacred Geometry Projection Engine (E17)
 * 
 * 3-layer combination: Sri Yantra, Golden Ratio Spiral, Mandala Projection
 */

export const projectionFragmentShader = `
precision mediump float;

uniform float uTime;
uniform float uIntensity;
uniform float uScroll;
uniform float uBass;
uniform float uMid;
uniform float uHigh;

varying vec2 vUv;
varying vec3 vPosition;
varying float vDistance;

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

// ============================================
// LAYER 1: SRI YANTRA PROJECTION
// ============================================
float sriYantra(vec2 uv) {
  vec2 center = vec2(0.5, 0.5);
  vec2 toCenter = uv - center;
  float dist = length(toCenter);
  float angle = atan(toCenter.y, toCenter.x);
  
  // Concentric triangle structure (9 triangles)
  float yantra = 0.0;
  
  // Outer triangles (4)
  for (int i = 0; i < 4; i++) {
    float triAngle = angle + float(i) * 1.5708; // 90 degrees
    float triDist = dist * 0.8;
    float tri = abs(sin(triAngle * 3.0)) * 0.3;
    yantra += smoothstep(0.3, 0.35, triDist) * (1.0 - smoothstep(0.35, 0.4, triDist)) * tri;
  }
  
  // Inner triangles (5)
  for (int i = 0; i < 5; i++) {
    float triAngle = angle + float(i) * 1.2566; // 72 degrees
    float triDist = dist * 0.5;
    float tri = abs(sin(triAngle * 2.5)) * 0.4;
    yantra += smoothstep(0.15, 0.2, triDist) * (1.0 - smoothstep(0.2, 0.25, triDist)) * tri;
  }
  
  // Central bindu glow
  float bindu = 1.0 - smoothstep(0.0, 0.05, dist);
  yantra += bindu * 0.8;
  
  // Bass-reactive expansion (0.0 → 1.3 scale)
  float expansion = 1.0 + uBass * 0.3;
  yantra *= smoothstep(0.0, expansion, dist);
  
  // High-reactive shimmer at line intersections
  float shimmer = sin(uTime * 15.0 + dist * 20.0) * 0.5 + 0.5;
  shimmer = smoothstep(0.7, 1.0, shimmer);
  yantra += shimmer * uHigh * 0.3;
  
  // Scroll-reactive brightness
  yantra *= (0.7 + uScroll * 0.3);
  
  return yantra;
}

// ============================================
// LAYER 2: GOLDEN RATIO SPIRAL FIELD
// ============================================
float goldenSpiral(vec2 uv) {
  vec2 center = vec2(0.5, 0.5);
  vec2 toCenter = uv - center;
  float dist = length(toCenter);
  float angle = atan(toCenter.y, toCenter.x);
  
  // Phi (golden ratio) = 1.618
  float phi = 1.618;
  
  // Rotating clockwise at 0.015 speed
  float rotation = uTime * 0.015;
  angle += rotation;
  
  // Phi-based spiral pattern
  float spiralRadius = dist * phi;
  float spiralAngle = angle * phi;
  
  // Spiral line
  float spiral = abs(sin(spiralAngle - spiralRadius * 2.0));
  spiral = smoothstep(0.85, 1.0, spiral);
  
  // Mid-reactive turbulence distortion
  float turbulence = fbm(uv * 2.0 + uTime * 0.1) * uMid * 0.2;
  spiral += turbulence * 0.3;
  
  return spiral;
}

// ============================================
// LAYER 3: MANDALA PROJECTION DISK
// ============================================
float mandalaDisk(vec2 uv) {
  vec2 center = vec2(0.5, 0.5);
  vec2 toCenter = uv - center;
  float dist = length(toCenter);
  float angle = atan(toCenter.y, toCenter.x);
  
  float mandala = 0.0;
  
  // 12-segment mandala
  float segmentAngle = angle / 0.5236; // 30 degrees per segment
  float segment = abs(sin(segmentAngle * 3.14159));
  segment = smoothstep(0.9, 1.0, segment);
  
  // Radial beams (12)
  mandala += segment * 0.4;
  
  // Concentric circles (4 levels)
  for (int i = 1; i <= 4; i++) {
    float circleRadius = float(i) * 0.2;
    float circle = abs(dist - circleRadius);
    circle = 1.0 - smoothstep(0.0, 0.02, circle);
    mandala += circle * 0.2;
  }
  
  // Scroll → rotation speed (0 → 360 degrees)
  float rotation = uScroll * 6.28318; // 0 to 2π
  angle += rotation;
  
  // Recalculate segment with rotation
  segmentAngle = angle / 0.5236;
  segment = abs(sin(segmentAngle * 3.14159));
  segment = smoothstep(0.9, 1.0, segment);
  mandala += segment * 0.3;
  
  // High-reactive flicker
  float flicker = sin(uTime * 10.0 + dist * 15.0) * 0.5 + 0.5;
  flicker = smoothstep(0.4, 0.6, flicker);
  mandala *= (1.0 + flicker * uHigh * 0.5);
  
  return mandala;
}

void main() {
  vec2 uv = vUv;
  
  // ============================================
  // LAYER 1: SRI YANTRA
  // ============================================
  float yantra = sriYantra(uv);
  vec3 yantraColor = vec3(1.0, 0.90, 0.60); // Gold
  
  // ============================================
  // LAYER 2: GOLDEN RATIO SPIRAL
  // ============================================
  float spiral = goldenSpiral(uv);
  vec3 spiralColor = mix(
    vec3(1.0, 0.85, 0.50),  // Gold
    vec3(1.0, 1.0, 1.0),    // White
    spiral
  );
  
  // ============================================
  // LAYER 3: MANDALA DISK
  // ============================================
  float mandala = mandalaDisk(uv);
  vec3 mandalaColor = vec3(1.0, 0.95, 0.70); // Light gold
  
  // ============================================
  // COMBINE LAYERS (Soft Additive Blending)
  // ============================================
  vec3 finalColor = vec3(0.0);
  
  // Add Yantra
  finalColor += yantraColor * yantra * 0.4;
  
  // Add Spiral
  finalColor += spiralColor * spiral * 0.3;
  
  // Add Mandala
  finalColor += mandalaColor * mandala * 0.3;
  
  // ============================================
  // SHIMMER NOISE
  // ============================================
  float shimmer = fbm(uv * 5.0 + uTime * 0.5) * uHigh * 0.2;
  finalColor += vec3(1.0) * shimmer;
  
  // ============================================
  // BLOOM THRESHOLD MASK
  // ============================================
  float bloom = max(yantra, max(spiral, mandala));
  bloom = smoothstep(0.6, 1.0, bloom);
  
  // ============================================
  // FADE WITH DISTANCE
  // ============================================
  float dist = length(uv - vec2(0.5));
  float fade = 1.0 - smoothstep(0.4, 0.5, dist);
  
  // ============================================
  // FINAL COMPOSITION
  // ============================================
  finalColor *= uIntensity;
  finalColor *= fade;
  
  float alpha = max(yantra, max(spiral, mandala)) * fade;
  alpha = clamp(alpha, 0.0, 1.0);
  
  // Clamp color
  finalColor = clamp(finalColor, 0.0, 1.0);
  
  gl_FragColor = vec4(finalColor, alpha);
}
`;

