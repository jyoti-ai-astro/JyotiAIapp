/**
 * Cosmic BloomBoost v1 Shader
 * 
 * Phase 3 — Section 11: COSMIC BLOOMBOOST ENGINE v1
 * Cosmic BloomBoost Engine v1 (F11)
 * 
 * Secondary Additive Bloom Enhancer for Ultra-Bright Highlights with:
 * - Secondary bright extraction (threshold > primary bloom)
 * - Additive glow with gold-white high-energy tint
 * - Audio-reactive bloom boost (bass → size, high → intensity)
 * - BlessingWave → explosive white-gold burst
 * - Fine-grain noise shimmer to avoid banding
 * - Screen-space radial shaping (lens-based)
 * - CameraFOV compensation
 * - Mobile fallback: reduce glow radius by 50%, lower threshold
 */

export const cosmicBloomBoostShader = {
  uniforms: {
    uTime: { value: 0 },
    uBoostIntensity: { value: 0.4 },
    uBoostRadius: { value: 0.2 },
    uThreshold: { value: 0.95 },
    uBass: { value: 0 },
    uMid: { value: 0 },
    uHigh: { value: 0 },
    uBlessingWaveProgress: { value: 0 },
    uCameraFOV: { value: 75.0 },
    uResolution: { value: [1, 1] },
  },

  vertexShader: `
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    precision highp float;
    
    uniform float uTime;
    uniform float uBoostIntensity;
    uniform float uBoostRadius;
    uniform float uThreshold;
    uniform float uBass;
    uniform float uMid;
    uniform float uHigh;
    uniform float uBlessingWaveProgress;
    uniform float uCameraFOV;
    uniform vec2 uResolution;
    uniform sampler2D inputTexture;
    
    varying vec2 vUv;
    
    // ============================================
    // HASH FUNCTION (for noise)
    // ============================================
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }
    
    // ============================================
    // NOISE FUNCTION
    // ============================================
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }
    
    // ============================================
    // GAUSSIAN BLUR (for glow)
    // ============================================
    vec4 gaussianBlur(sampler2D tex, vec2 uv, vec2 direction, float radius) {
      vec4 color = vec4(0.0);
      float weights[9];
      weights[0] = 0.01621622;
      weights[1] = 0.05405405;
      weights[2] = 0.12162162;
      weights[3] = 0.19459459;
      weights[4] = 0.22702703;
      weights[5] = 0.19459459;
      weights[6] = 0.12162162;
      weights[7] = 0.05405405;
      weights[8] = 0.01621622;
      
      vec2 texelSize = 1.0 / uResolution;
      vec2 offset = direction * texelSize * radius;
      
      for (int i = 0; i < 9; i++) {
        float weight = weights[i];
        vec2 sampleUV = uv + offset * (float(i) - 4.0);
        color += texture2D(tex, sampleUV) * weight;
      }
      
      return color;
    }
    
    // ============================================
    // SECONDARY BRIGHT EXTRACTION (Threshold > Primary Bloom)
    // ============================================
    float extractBrightness(vec4 color) {
      float luminance = dot(color.rgb, vec3(0.299, 0.587, 0.114));
      return max(0.0, luminance - uThreshold);
    }
    
    // ============================================
    // SCREEN-SPACE RADIAL SHAPING (Lens-Based)
    // ============================================
    float radialShape(vec2 uv) {
      vec2 center = vec2(0.5, 0.5);
      vec2 offset = uv - center;
      float distance = length(offset);
      
      // Lens-based radial falloff
      float radial = 1.0 / (1.0 + distance * 2.0);
      radial = smoothstep(0.0, 1.0, radial);
      
      return radial;
    }
    
    // ============================================
    // ADDITIVE GLOW WITH GOLD-WHITE HIGH-ENERGY TINT
    // ============================================
    vec3 additiveGlow(vec2 uv, float brightness) {
      if (brightness <= 0.0) return vec3(0.0);
      
      // Audio-reactive glow radius: bass → size
      float glowRadius = uBoostRadius * (1.0 + uBass * 0.4);
      
      // FOV compensation
      float fovFactor = uCameraFOV / 75.0;
      glowRadius *= fovFactor;
      
      // Blur bright areas
      vec4 blurH = gaussianBlur(inputTexture, uv, vec2(1.0, 0.0), glowRadius);
      vec4 blurV = gaussianBlur(inputTexture, uv, vec2(0.0, 1.0), glowRadius);
      vec4 blurred = (blurH + blurV) * 0.5;
      
      // Extract brightness from blurred
      float blurredBrightness = extractBrightness(blurred);
      
      // Gold-white high-energy tint
      vec3 goldWhite = vec3(1.0, 0.98, 0.92);
      
      // Apply radial shaping
      float radial = radialShape(uv);
      
      // Audio-reactive intensity: high → intensity
      float intensity = uBoostIntensity * (1.0 + uHigh * 0.3);
      
      return goldWhite * blurredBrightness * brightness * radial * intensity;
    }
    
    // ============================================
    // FINE-GRAIN NOISE SHIMMER (Avoid Banding)
    // ============================================
    float fineGrainShimmer(vec2 uv) {
      vec2 noiseUV = uv * uResolution * 2.0;
      float shimmer = noise(noiseUV + uTime * 0.1);
      shimmer = shimmer * 2.0 - 1.0; // -1 to 1
      
      // Very fine grain to avoid banding
      return shimmer * 0.02;
    }
    
    // ============================================
    // BLESSING WAVE EXPLOSIVE WHITE-GOLD BURST
    // ============================================
    vec3 blessingExplosiveBurst(vec2 uv) {
      if (uBlessingWaveProgress <= 0.0) return vec3(0.0);
      
      // Sample input
      vec4 inputColor = texture2D(inputTexture, uv);
      float brightness = extractBrightness(inputColor);
      
      // Explosive burst
      float burst = uBlessingWaveProgress;
      
      // Pulsing with blessing wave
      float pulse = sin(uTime * 4.0 + uBlessingWaveProgress * 6.28318) * 0.3 + 0.7;
      burst *= pulse;
      
      // Radial expansion
      vec2 center = vec2(0.5, 0.5);
      vec2 offset = uv - center;
      float distance = length(offset);
      
      // Explosive radial pattern
      float radialBurst = 1.0 / (1.0 + distance * 5.0);
      radialBurst = smoothstep(0.3, 1.0, radialBurst);
      burst *= radialBurst;
      
      // White-gold burst
      vec3 whiteGold = vec3(1.0, 0.95, 0.85);
      
      return whiteGold * burst * brightness * 0.6;
    }
    
    void main() {
      vec2 uv = vUv;
      
      // Sample input texture
      vec4 inputColor = texture2D(inputTexture, uv);
      vec3 color = inputColor.rgb;
      
      // Extract brightness (secondary threshold > primary bloom)
      float brightness = extractBrightness(inputColor);
      
      // Additive glow with gold-white high-energy tint
      vec3 glow = additiveGlow(uv, brightness);
      
      // Fine-grain noise shimmer to avoid banding
      float shimmer = fineGrainShimmer(uv);
      color += shimmer;
      
      // Blessing wave explosive white-gold burst
      vec3 blessingBurst = blessingExplosiveBurst(uv);
      
      // Combine all effects (additive)
      color += glow + blessingBurst;
      
      // Clamp
      color = clamp(color, 0.0, 1.0);
      
      gl_FragColor = vec4(color, inputColor.a);
    }
  `,
};

