/**
 * Cosmic Starlight v1 Shader
 * 
 * Phase 3 — Section 10: COSMIC STARLIGHT ENGINE v1
 * Cosmic Starlight Engine v1 (F10)
 * 
 * Shimmering Star-Field Overlay + Micro-Twinkle Shimmer with:
 * - High-density micro star-field (procedural)
 * - Multi-layer star clusters (3 layers: micro, mid, macro)
 * - Twinkle modulation using noise + sin waves
 * - Audio-reactive twinkle (high → sparkle density, mid → twinkle amplitude)
 * - BlessingWave → full-screen starlight pulse
 * - Gold-white to blue-violet gradient per star layer
 * - Screen-blend overlay
 * - Slight parallax using mouse.x / mouse.y (optional)
 * - CameraFOV compensation
 * - Mobile fallback: reduce star count by 50%, disable parallax
 */

export const cosmicStarlightShader = {
  uniforms: {
    uTime: { value: 0 },
    uStarIntensity: { value: 0.3 },
    uTwinkleStrength: { value: 0.5 },
    uLayerDensity: { value: 1.0 },
    uBass: { value: 0 },
    uMid: { value: 0 },
    uHigh: { value: 0 },
    uBlessingWaveProgress: { value: 0 },
    uMouse: { value: [0.5, 0.5] },
    uCameraFOV: { value: 75.0 },
    uResolution: { value: [1, 1] },
    uDisableParallax: { value: 0.0 }, // 1.0 = disable parallax (mobile)
    uStarCount: { value: 200.0 },
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
    uniform float uStarIntensity;
    uniform float uTwinkleStrength;
    uniform float uLayerDensity;
    uniform float uBass;
    uniform float uMid;
    uniform float uHigh;
    uniform float uBlessingWaveProgress;
    uniform vec2 uMouse;
    uniform float uCameraFOV;
    uniform vec2 uResolution;
    uniform float uDisableParallax;
    uniform float uStarCount;
    uniform sampler2D inputTexture;
    
    varying vec2 vUv;
    
    // ============================================
    // HASH FUNCTION (for procedural stars)
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
    // PARALLAX OFFSET (Optional)
    // ============================================
    vec2 parallaxOffset(vec2 uv) {
      if (uDisableParallax > 0.5) return uv;
      
      // Slight parallax using mouse position
      vec2 mouseOffset = (uMouse - vec2(0.5, 0.5)) * 0.02;
      return uv + mouseOffset;
    }
    
    // ============================================
    // GENERATE SINGLE STAR
    // ============================================
    float generateStar(vec2 uv, vec2 starPos, float size, float brightness) {
      vec2 offset = uv - starPos;
      float dist = length(offset);
      
      // Star shape (circular with falloff)
      float star = 1.0 / (1.0 + dist * 100.0 / size);
      star = smoothstep(size * 0.02, 0.0, dist);
      
      return star * brightness;
    }
    
    // ============================================
    // TWINKLE MODULATION (Noise + Sin Waves)
    // ============================================
    float twinkleModulation(vec2 starPos, float time) {
      // Noise-based twinkle
      float noiseTwinkle = noise(starPos * 10.0 + time * 0.5);
      noiseTwinkle = noiseTwinkle * 2.0 - 1.0; // -1 to 1
      
      // Sin wave twinkle
      float sinTwinkle = sin(time * 2.0 + hash(starPos) * 6.28318) * 0.5 + 0.5;
      
      // Combine
      float twinkle = mix(sinTwinkle, noiseTwinkle * 0.5 + 0.5, 0.5);
      
      // Audio-reactive twinkle amplitude: mid → twinkle amplitude
      float twinkleAmplitude = 1.0 + uMid * 0.3;
      twinkle = mix(0.5, twinkle, twinkleAmplitude);
      
      return twinkle;
    }
    
    // ============================================
    // STAR LAYER (Micro, Mid, or Macro)
    // ============================================
    vec3 starLayer(vec2 uv, float layerId, float density, float size, vec3 colorBase) {
      vec3 stars = vec3(0.0);
      
      // Parallax offset
      vec2 parallaxUV = parallaxOffset(uv);
      
      // Generate stars for this layer
      int count = int(uStarCount * density);
      
      for (int i = 0; i < 200; i++) {
        if (i >= count) break;
        
        float id = float(i) + layerId * 1000.0;
        vec2 starPos = vec2(
          hash(vec2(id, 0.0)),
          hash(vec2(id, 1.0))
        );
        
        // Star size variation
        float starSize = size * (0.5 + hash(vec2(id, 2.0)) * 0.5);
        
        // Star brightness
        float starBrightness = hash(vec2(id, 3.0));
        starBrightness = smoothstep(0.7, 1.0, starBrightness); // Only bright stars
        
        // Twinkle modulation
        float twinkle = twinkleModulation(starPos, uTime);
        starBrightness *= twinkle;
        
        // Audio-reactive sparkle density: high → sparkle density
        float sparkleDensity = 1.0 + uHigh * 0.2;
        if (hash(vec2(id, 4.0)) > sparkleDensity * 0.3) {
          starBrightness *= 0.3; // Dim some stars
        }
        
        // Generate star
        float star = generateStar(parallaxUV, starPos, starSize, starBrightness);
        
        // Color variation (gold-white to blue-violet gradient)
        vec3 starColor = mix(
          colorBase,
          mix(colorBase, vec3(0.7, 0.6, 1.0), hash(vec2(id, 5.0))), // Blue-violet
          hash(vec2(id, 6.0)) * 0.3
        );
        
        stars += starColor * star;
      }
      
      return stars / float(count);
    }
    
    // ============================================
    // MULTI-LAYER STAR CLUSTERS
    // ============================================
    vec3 multiLayerStars(vec2 uv) {
      vec3 stars = vec3(0.0);
      
      // Layer 1: Micro stars (tiny, high density)
      vec3 microColor = vec3(1.0, 0.95, 0.9); // Gold-white
      stars += starLayer(uv, 0.0, 1.0, 0.01, microColor) * 0.4;
      
      // Layer 2: Mid stars (medium, medium density)
      vec3 midColor = vec3(1.0, 0.9, 0.8); // Gold
      stars += starLayer(uv, 1.0, 0.6, 0.015, midColor) * 0.5;
      
      // Layer 3: Macro stars (large, low density)
      vec3 macroColor = vec3(0.9, 0.85, 1.0); // Blue-violet
      stars += starLayer(uv, 2.0, 0.3, 0.02, macroColor) * 0.6;
      
      return stars * uLayerDensity;
    }
    
    // ============================================
    // BLESSING WAVE FULL-SCREEN STARLIGHT PULSE
    // ============================================
    vec3 blessingStarlightPulse(vec2 uv) {
      if (uBlessingWaveProgress <= 0.0) return vec3(0.0);
      
      // Full-screen starlight pulse
      float pulse = uBlessingWaveProgress;
      
      // Pulsing with blessing wave
      float pulseWave = sin(uTime * 3.0 + uBlessingWaveProgress * 6.28318) * 0.3 + 0.7;
      pulse *= pulseWave;
      
      // Gold-white starlight
      vec3 starlight = vec3(1.0, 0.95, 0.9) * pulse;
      
      // Add twinkling stars during pulse
      vec2 pulseUV = uv * 10.0;
      float twinkle = noise(pulseUV + uTime * 0.5);
      twinkle = smoothstep(0.7, 1.0, twinkle);
      
      starlight += twinkle * 0.3;
      
      return starlight * 0.4;
    }
    
    void main() {
      vec2 uv = vUv;
      
      // Sample input texture
      vec4 inputColor = texture2D(inputTexture, uv);
      vec3 color = inputColor.rgb;
      
      // Multi-layer star clusters
      vec3 stars = multiLayerStars(uv);
      
      // Apply twinkle strength
      stars *= uTwinkleStrength;
      
      // Apply star intensity
      stars *= uStarIntensity;
      
      // Blessing wave full-screen starlight pulse
      vec3 blessingPulse = blessingStarlightPulse(uv);
      stars += blessingPulse;
      
      // FOV compensation
      float fovFactor = uCameraFOV / 75.0;
      stars *= fovFactor;
      
      // Screen blend overlay
      // Screen blend: 1 - (1 - a) * (1 - b)
      vec3 screenBlend = 1.0 - (1.0 - color) * (1.0 - stars);
      
      // Mix with original (intensity control)
      color = mix(color, screenBlend, 0.5);
      
      // Clamp
      color = clamp(color, 0.0, 1.0);
      
      gl_FragColor = vec4(color, inputColor.a);
    }
  `,
};

