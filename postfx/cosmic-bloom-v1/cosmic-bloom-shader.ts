/**
 * Cosmic Bloom v1 Shader
 * 
 * Phase 3 — Section 1: COSMIC BLOOM ENGINE v1
 * Cosmic Bloom Engine v1 (F1)
 * 
 * 7-stage Gaussian pyramid bloom with:
 * - High-brightness extraction
 * - Temporal shimmer from uTime, uHigh
 * - BlessingWave white-gold flash integration
 * - FOV warp compatibility
 * - Alpha-based bloom mask support
 */

export const cosmicBloomShader = {
  uniforms: {
    uTime: { value: 0 },
    uHigh: { value: 0 },
    uMid: { value: 0 },
    uBass: { value: 0 },
    uThreshold: { value: 0.85 },
    uIntensity: { value: 1.0 },
    uBlessingWaveProgress: { value: 0 },
    uFOV: { value: 75.0 },
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
    uniform float uHigh;
    uniform float uMid;
    uniform float uBass;
    uniform float uThreshold;
    uniform float uIntensity;
    uniform float uBlessingWaveProgress;
    uniform float uFOV;
    uniform vec2 uResolution;
    
    // ============================================
    // GAUSSIAN BLUR KERNEL (9-tap)
    // ============================================
    vec4 gaussianBlur(sampler2D tex, vec2 uv, vec2 direction) {
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
      vec2 offset = direction * texelSize;
      
      for (int i = 0; i < 9; i++) {
        float weight = weights[i];
        vec2 sampleUV = uv + offset * (float(i) - 4.0);
        color += texture2D(tex, sampleUV) * weight;
      }
      
      return color;
    }
    
    // ============================================
    // HIGH-BRIGHTNESS EXTRACTION
    // ============================================
    vec4 extractBrightness(vec4 color) {
      // Extract luminance
      float luminance = dot(color.rgb, vec3(0.299, 0.587, 0.114));
      
      // Base threshold
      float threshold = uThreshold;
      
      // Bass → Bloom Strength Boost
      threshold -= (0.1 + uBass * 0.3);
      
      // Extract bright areas
      float bloom = max(0.0, luminance - threshold);
      bloom = smoothstep(0.0, 1.0, bloom);
      
      // Mid → Bloom Radius Modulation
      bloom *= (1.0 + uMid * 0.2);
      
      // High → Sparkle Bloom Layer
      float sparkle = sin(uv.x * 20.0 + uv.y * 20.0 + uTime * 2.0) * 0.5 + 0.5;
      sparkle = smoothstep(0.7, 1.0, sparkle);
      sparkle *= uHigh;
      bloom += sparkle * 0.3;
      
      // Temporal shimmer from uTime, uHigh
      float temporalShimmer = sin(uTime * 3.0 + uv.x * 10.0 + uv.y * 10.0) * 0.1 + 1.0;
      temporalShimmer *= (1.0 + uHigh * 0.2);
      bloom *= temporalShimmer;
      
      // BlessingWave white-gold flash integration
      float blessingFlash = 0.0;
      if (uBlessingWaveProgress > 0.0) {
        blessingFlash = uBlessingWaveProgress * 0.8;
        // White-gold flash color
        vec3 whiteGold = mix(vec3(1.0, 1.0, 1.0), vec3(1.0, 0.8, 0.3), uBlessingWaveProgress);
        color.rgb = mix(color.rgb, whiteGold, blessingFlash * 0.5);
      }
      
      // Use alpha channel as bloom mask (from CelestialCrest layer 28)
      float alphaMask = color.a;
      bloom *= alphaMask;
      
      return vec4(color.rgb * bloom, bloom);
    }
    
    // ============================================
    // FOV WARP COMPATIBILITY
    // ============================================
    vec2 applyFOVWarp(vec2 uv) {
      float fovFactor = uFOV / 75.0;
      vec2 center = vec2(0.5, 0.5);
      vec2 offset = uv - center;
      offset *= 1.0 + (fovFactor - 1.0) * 0.05;
      return center + offset;
    }
    
    void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
      // Extract brightness for bloom (using inputColor directly)
      vec4 bloomColor = extractBrightness(inputColor);
      
      // Composite bloom (additive blending)
      vec3 finalColor = inputColor.rgb + bloomColor.rgb * uIntensity;
      
      // Clamp
      finalColor = clamp(finalColor, 0.0, 1.0);
      
      outputColor = vec4(finalColor, inputColor.a);
    }
  `,
};

// ============================================
// DOWNSAMPLE SHADER (for pyramid)
// ============================================
export const downsampleShader = {
  uniforms: {
    uInputTexture: { value: null },
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
    
    uniform sampler2D uInputTexture;
    uniform vec2 uResolution;
    
    varying vec2 vUv;
    
    void main() {
      vec2 texelSize = 1.0 / uResolution;
      vec4 color = vec4(0.0);
      
      // 4-tap box filter for downsampling
      color += texture2D(uInputTexture, vUv + vec2(-0.5, -0.5) * texelSize) * 0.25;
      color += texture2D(uInputTexture, vUv + vec2(0.5, -0.5) * texelSize) * 0.25;
      color += texture2D(uInputTexture, vUv + vec2(-0.5, 0.5) * texelSize) * 0.25;
      color += texture2D(uInputTexture, vUv + vec2(0.5, 0.5) * texelSize) * 0.25;
      
      gl_FragColor = color;
    }
  `,
};

// ============================================
// UPSAMPLE SHADER (for pyramid)
// ============================================
export const upsampleShader = {
  uniforms: {
    uInputTexture: { value: null },
    uPreviousTexture: { value: null },
    uResolution: { value: [1, 1] },
    uIntensity: { value: 1.0 },
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
    
    uniform sampler2D uInputTexture;
    uniform sampler2D uPreviousTexture;
    uniform vec2 uResolution;
    uniform float uIntensity;
    
    varying vec2 vUv;
    
    // Gaussian blur for upsampling
    vec4 gaussianBlur(sampler2D tex, vec2 uv, vec2 direction) {
      vec4 color = vec4(0.0);
      float weights[5];
      weights[0] = 0.2270270270;
      weights[1] = 0.1945945946;
      weights[2] = 0.1216216216;
      weights[3] = 0.0540540541;
      weights[4] = 0.0162162162;
      
      vec2 texelSize = 1.0 / uResolution;
      vec2 offset = direction * texelSize;
      
      for (int i = 0; i < 5; i++) {
        float weight = weights[i];
        vec2 sampleUV = uv + offset * (float(i) - 2.0);
        color += texture2D(tex, sampleUV) * weight;
        if (i > 0) {
          sampleUV = uv - offset * float(i);
          color += texture2D(tex, sampleUV) * weight;
        }
      }
      
      return color;
    }
    
    void main() {
      // Sample current level
      vec4 current = texture2D(uInputTexture, vUv);
      
      // Sample and blur previous (higher resolution) level
      vec4 previous = gaussianBlur(uPreviousTexture, vUv, vec2(1.0, 0.0));
      previous += gaussianBlur(uPreviousTexture, vUv, vec2(0.0, 1.0));
      previous *= 0.5;
      
      // Combine with intensity
      vec4 result = current + previous * uIntensity;
      
      gl_FragColor = result;
    }
  `,
};

