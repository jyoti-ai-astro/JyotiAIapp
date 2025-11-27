/**
 * Cosmic GrainOverlay v1 Shader
 * 
 * Phase 3 — Section 9: COSMIC GRAINOVERLAY ENGINE v1
 * Cosmic GrainOverlay Engine v1 (F9)
 * 
 * Ultra-Fine Film Grain + Cosmic Dust Overlay with:
 * - Ultra-fine high-frequency luma grain (different from F6)
 * - Ultra-fine chroma dot grain (very tiny, <1px shimmer)
 * - Cosmic dust speckles (light specks drifting subtly)
 * - Gold-white micro particles drifting
 * - Audio-reactive shimmer (high → spark density, mid → drift speed)
 * - BlessingWave → gold shimmer burst
 * - Alpha overlay: additive + screen blend
 * - CameraFOV compensation
 * - Mobile fallback: disable chroma noise, reduce dust count by 50%
 */

export const cosmicGrainOverlayShader = {
  uniforms: {
    uTime: { value: 0 },
    uIntensity: { value: 1.0 },
    uOverlayIntensity: { value: 0.08 },
    uDustDensity: { value: 0.5 },
    uShimmerStrength: { value: 0.1 },
    uBass: { value: 0 },
    uMid: { value: 0 },
    uHigh: { value: 0 },
    uBlessingWaveProgress: { value: 0 },
    uCameraFOV: { value: 75.0 },
    uResolution: { value: [1, 1] },
    uDisableChroma: { value: 0.0 }, // 1.0 = disable chroma noise (mobile)
    uDustCount: { value: 50.0 },
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
    uniform float uIntensity;
    uniform float uOverlayIntensity;
    uniform float uDustDensity;
    uniform float uShimmerStrength;
    uniform float uBass;
    uniform float uMid;
    uniform float uHigh;
    uniform float uBlessingWaveProgress;
    uniform float uCameraFOV;
    uniform vec2 uResolution;
    uniform float uDisableChroma;
    uniform float uDustCount;
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
    // ULTRA-FINE HIGH-FREQUENCY LUMA GRAIN
    // ============================================
    float ultraFineLumaGrain(vec2 uv) {
      // Very high frequency grain (different from F6)
      vec2 grainUV = uv * uResolution * 4.0; // 4x resolution for ultra-fine
      float grain = noise(grainUV + uTime * 0.05);
      grain = grain * 2.0 - 1.0; // -1 to 1
      
      // FOV compensation
      float fovFactor = uCameraFOV / 75.0;
      
      return grain * uOverlayIntensity * fovFactor;
    }
    
    // ============================================
    // ULTRA-FINE CHROMA DOT GRAIN (<1px shimmer)
    // ============================================
    vec3 ultraFineChromaGrain(vec2 uv) {
      if (uDisableChroma > 0.5) return vec3(0.0);
      
      // Very tiny chroma dots (<1px)
      vec2 dotUV = uv * uResolution * 8.0; // 8x resolution for <1px dots
      
      // Separate noise for each channel
      float rDot = noise(dotUV + vec2(0.0, uTime * 0.02));
      float gDot = noise(dotUV + vec2(1.0, uTime * 0.02));
      float bDot = noise(dotUV + vec2(2.0, uTime * 0.02));
      
      rDot = rDot * 2.0 - 1.0;
      gDot = gDot * 2.0 - 1.0;
      bDot = bDot * 2.0 - 1.0;
      
      // Very subtle chroma shimmer
      return vec3(rDot, gDot, bDot) * uShimmerStrength * 0.3;
    }
    
    // ============================================
    // COSMIC DUST SPECKLES (Light Specks Drifting)
    // ============================================
    float cosmicDustSpeckles(vec2 uv) {
      // Audio-reactive drift speed: mid → drift speed
      float driftSpeed = 1.0 + uMid * 0.3;
      
      // Drifting dust particles
      vec2 driftUV = uv + vec2(sin(uTime * 0.1 * driftSpeed), cos(uTime * 0.15 * driftSpeed)) * 0.01;
      vec2 dustUV = driftUV * uResolution * 0.5;
      
      // Generate dust particles
      float dust = 0.0;
      int count = int(uDustCount);
      
      for (int i = 0; i < 50; i++) {
        if (i >= count) break;
        
        float id = float(i);
        vec2 dustPos = vec2(
          hash(vec2(id, 0.0)),
          hash(vec2(id, 1.0))
        );
        
        vec2 dustOffset = dustUV - dustPos * uResolution;
        float dustDist = length(dustOffset);
        
        // Tiny dust speckles
        float speckle = 1.0 / (1.0 + dustDist * 100.0);
        speckle = smoothstep(0.02, 0.0, dustDist);
        
        dust += speckle;
      }
      
      // Normalize by count
      dust /= float(count);
      
      return dust * uDustDensity * 0.3;
    }
    
    // ============================================
    // GOLD-WHITE MICRO PARTICLES DRIFTING
    // ============================================
    vec3 goldWhiteParticles(vec2 uv) {
      // Audio-reactive drift speed: mid → drift speed
      float driftSpeed = 1.0 + uMid * 0.2;
      
      // Drifting particles
      vec2 driftUV = uv + vec2(cos(uTime * 0.08 * driftSpeed), sin(uTime * 0.12 * driftSpeed)) * 0.005;
      vec2 particleUV = driftUV * uResolution * 0.3;
      
      // Generate gold-white particles
      vec3 particles = vec3(0.0);
      int count = int(uDustCount);
      
      for (int i = 0; i < 50; i++) {
        if (i >= count) break;
        
        float id = float(i + 50.0);
        vec2 particlePos = vec2(
          hash(vec2(id, 0.0)),
          hash(vec2(id, 1.0))
        );
        
        vec2 particleOffset = particleUV - particlePos * uResolution;
        float particleDist = length(particleOffset);
        
        // Micro particles
        float particle = 1.0 / (1.0 + particleDist * 150.0);
        particle = smoothstep(0.015, 0.0, particleDist);
        
        // Gold-white color
        vec3 goldWhite = mix(vec3(1.0, 1.0, 1.0), vec3(1.0, 0.9, 0.7), hash(vec2(id, 2.0)));
        
        particles += goldWhite * particle;
      }
      
      // Normalize by count
      particles /= float(count);
      
      return particles * uDustDensity * 0.2;
    }
    
    // ============================================
    // AUDIO-REACTIVE SHIMMER (High → Spark Density)
    // ============================================
    float audioReactiveShimmer(vec2 uv) {
      // High → spark density
      if (uHigh <= 0.0) return 0.0;
      
      vec2 shimmerUV = uv * uResolution * 6.0;
      float shimmer = noise(shimmerUV + uTime * 0.1);
      
      // Spark density based on high frequency
      shimmer = smoothstep(0.8, 1.0, shimmer);
      shimmer *= uHigh;
      
      return shimmer * uShimmerStrength;
    }
    
    // ============================================
    // BLESSING WAVE GOLD SHIMMER BURST
    // ============================================
    vec3 blessingGoldShimmer(vec2 uv) {
      if (uBlessingWaveProgress <= 0.0) return vec3(0.0);
      
      vec2 shimmerUV = uv * uResolution * 5.0;
      float shimmer = noise(shimmerUV + uTime * 0.2);
      
      // Gold shimmer burst
      shimmer = smoothstep(0.7, 1.0, shimmer);
      shimmer *= uBlessingWaveProgress;
      
      // Gold color
      vec3 gold = vec3(1.0, 0.9, 0.6);
      
      return gold * shimmer * 0.4;
    }
    
    void main() {
      vec2 uv = vUv;
      
      // Sample input texture
      vec4 inputColor = texture2D(inputTexture, uv);
      vec3 color = inputColor.rgb;
      
      // Ultra-fine high-frequency luma grain
      float lumaGrain = ultraFineLumaGrain(uv);
      color += lumaGrain;
      
      // Ultra-fine chroma dot grain
      vec3 chromaGrain = ultraFineChromaGrain(uv);
      color += chromaGrain;
      
      // Cosmic dust speckles
      float dust = cosmicDustSpeckles(uv);
      color += dust;
      
      // Gold-white micro particles
      vec3 particles = goldWhiteParticles(uv);
      color += particles;
      
      // Audio-reactive shimmer
      float shimmer = audioReactiveShimmer(uv);
      color += shimmer;
      
      // Blessing wave gold shimmer burst
      vec3 blessingShimmer = blessingGoldShimmer(uv);
      color += blessingShimmer;
      
      // Apply intensity
      color = mix(inputColor.rgb, color, uIntensity);
      
      // Clamp
      color = clamp(color, 0.0, 1.0);
      
      gl_FragColor = vec4(color, inputColor.a);
    }
  `,
};

