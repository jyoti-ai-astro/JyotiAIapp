/**
 * Cosmic Glare v1 Shader
 * 
 * Phase 3 — Section 4: COSMIC GLARE ENGINE v1
 * Cosmic Glare Engine v1 (F4)
 * 
 * Anamorphic Streaks + Starburst Halo + Blessing Flare with:
 * - Horizontal anamorphic streaks (bright-pixel extraction)
 * - Vertical streak secondary pass
 * - Starburst pattern using angular convolution
 * - BlessingWave flare burst (white-gold)
 * - Audio-reactive glare boost (bass → streak length, high → shimmer)
 * - CameraFOV scaling
 * - Mask from bloom-layer alpha
 */

export const cosmicGlareShader = {
  uniforms: {
    uTime: { value: 0 },
    uIntensity: { value: 1.0 },
    uBass: { value: 0 },
    uMid: { value: 0 },
    uHigh: { value: 0 },
    uBlessingWaveProgress: { value: 0 },
    uCameraFOV: { value: 75.0 },
    uStreakLength: { value: 0.5 },
    uStarStrength: { value: 1.0 },
    uResolution: { value: [1, 1] },
    uKernelSize: { value: 15 },
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
    uniform float uBass;
    uniform float uMid;
    uniform float uHigh;
    uniform float uBlessingWaveProgress;
    uniform float uCameraFOV;
    uniform float uStreakLength;
    uniform float uStarStrength;
    uniform vec2 uResolution;
    uniform float uKernelSize;
    uniform sampler2D inputTexture;
    
    varying vec2 vUv;
    
    // ============================================
    // BRIGHT PIXEL EXTRACTION
    // ============================================
    float extractBrightness(vec4 color) {
      float luminance = dot(color.rgb, vec3(0.299, 0.587, 0.114));
      return max(0.0, luminance - 0.7);
    }
    
    // ============================================
    // HORIZONTAL ANAMORPHIC STREAK
    // ============================================
    vec3 horizontalStreak(sampler2D tex, vec2 uv, float length) {
      vec3 streak = vec3(0.0);
      float totalWeight = 0.0;
      
      // Audio-reactive streak length: bass → longer streaks
      float streakLength = length * (1.0 + uBass * 0.5);
      
      // FOV scaling
      float fovFactor = uCameraFOV / 75.0;
      streakLength *= fovFactor;
      
      vec2 texelSize = 1.0 / uResolution;
      int samples = int(uKernelSize);
      
      // Sample horizontally (anamorphic streak)
      for (int i = 0; i < 15; i++) {
        if (i >= samples) break;
        
        float offset = float(i) - float(samples) * 0.5;
        vec2 sampleUV = uv + vec2(offset * streakLength * texelSize.x, 0.0);
        
        if (sampleUV.x < 0.0 || sampleUV.x > 1.0) continue;
        
        vec4 sampleColor = texture2D(tex, sampleUV);
        float brightness = extractBrightness(sampleColor);
        
        // Decay with distance
        float weight = 1.0 / (1.0 + abs(offset) * 0.1);
        streak += sampleColor.rgb * brightness * weight;
        totalWeight += weight;
      }
      
      if (totalWeight > 0.0) {
        streak /= totalWeight;
      }
      
      return streak;
    }
    
    // ============================================
    // VERTICAL STREAK (Secondary Pass)
    // ============================================
    vec3 verticalStreak(sampler2D tex, vec2 uv, float length) {
      vec3 streak = vec3(0.0);
      float totalWeight = 0.0;
      
      float streakLength = length * (1.0 + uMid * 0.3);
      float fovFactor = uCameraFOV / 75.0;
      streakLength *= fovFactor;
      
      vec2 texelSize = 1.0 / uResolution;
      int samples = int(uKernelSize);
      
      // Sample vertically
      for (int i = 0; i < 15; i++) {
        if (i >= samples) break;
        
        float offset = float(i) - float(samples) * 0.5;
        vec2 sampleUV = uv + vec2(0.0, offset * streakLength * texelSize.y);
        
        if (sampleUV.y < 0.0 || sampleUV.y > 1.0) continue;
        
        vec4 sampleColor = texture2D(tex, sampleUV);
        float brightness = extractBrightness(sampleColor);
        
        float weight = 1.0 / (1.0 + abs(offset) * 0.1);
        streak += sampleColor.rgb * brightness * weight;
        totalWeight += weight;
      }
      
      if (totalWeight > 0.0) {
        streak /= totalWeight;
      }
      
      return streak;
    }
    
    // ============================================
    // STARBURST PATTERN (Angular Convolution)
    // ============================================
    vec3 starburst(sampler2D tex, vec2 uv) {
      vec3 star = vec3(0.0);
      float totalWeight = 0.0;
      
      vec2 center = vec2(0.5, 0.5);
      vec2 offset = uv - center;
      float angle = atan(offset.y, offset.x);
      float distance = length(offset);
      
      // Angular convolution (8-point star)
      int rays = 8;
      float rayAngle = 6.28318 / float(rays);
      
      for (int i = 0; i < 8; i++) {
        float rayAngleOffset = float(i) * rayAngle;
        vec2 rayDir = vec2(cos(angle + rayAngleOffset), sin(angle + rayAngleOffset));
        
        // Sample along ray
        float rayLength = distance * 0.3;
        vec2 sampleUV = center + rayDir * rayLength;
        
        if (sampleUV.x < 0.0 || sampleUV.x > 1.0 || sampleUV.y < 0.0 || sampleUV.y > 1.0) continue;
        
        vec4 sampleColor = texture2D(tex, sampleUV);
        float brightness = extractBrightness(sampleColor);
        
        // Angular falloff
        float angleDiff = abs(mod(angle - rayAngleOffset + 3.14159, 6.28318) - 3.14159);
        float weight = 1.0 / (1.0 + angleDiff * 10.0);
        
        star += sampleColor.rgb * brightness * weight;
        totalWeight += weight;
      }
      
      if (totalWeight > 0.0) {
        star /= totalWeight;
      }
      
      return star;
    }
    
    // ============================================
    // BLESSING FLARE BURST (White-Gold)
    // ============================================
    vec3 blessingFlare(vec2 uv) {
      if (uBlessingWaveProgress <= 0.0) return vec3(0.0);
      
      vec2 center = vec2(0.5, 0.5);
      vec2 offset = uv - center;
      float distance = length(offset);
      
      // Radial flare burst
      float flare = 1.0 - smoothstep(0.0, 0.8, distance);
      
      // Pulsing with blessing wave
      float pulse = sin(uTime * 3.0 + uBlessingWaveProgress * 6.28318) * 0.5 + 0.5;
      flare *= pulse * uBlessingWaveProgress;
      
      // White-gold color
      vec3 whiteGold = mix(vec3(1.0, 1.0, 1.0), vec3(1.0, 0.8, 0.3), uBlessingWaveProgress);
      
      return whiteGold * flare * 2.0;
    }
    
    // ============================================
    // HIGH FREQUENCY SHIMMER
    // ============================================
    float calculateShimmer(vec2 uv) {
      // High → shimmer effect
      if (uHigh <= 0.0) return 0.0;
      
      float shimmer = sin(uv.x * 50.0 + uv.y * 50.0 + uTime * 5.0) * 0.5 + 0.5;
      shimmer = smoothstep(0.7, 1.0, shimmer);
      shimmer *= uHigh;
      
      return shimmer * 0.3;
    }
    
    void main() {
      vec2 uv = vUv;
      
      // Sample input texture
      vec4 inputColor = texture2D(inputTexture, uv);
      
      // Extract brightness for mask
      float brightness = extractBrightness(inputColor);
      
      // Horizontal anamorphic streak
      vec3 hStreak = horizontalStreak(inputTexture, uv, uStreakLength);
      
      // Vertical streak (secondary)
      vec3 vStreak = verticalStreak(inputTexture, uv, uStreakLength * 0.5);
      
      // Starburst pattern
      vec3 star = starburst(inputTexture, uv) * uStarStrength;
      
      // Blessing flare burst
      vec3 flare = blessingFlare(uv);
      
      // High frequency shimmer
      float shimmer = calculateShimmer(uv);
      
      // Combine all glare effects
      vec3 glare = hStreak + vStreak * 0.5 + star + flare;
      glare *= brightness; // Mask by brightness
      glare *= uIntensity;
      
      // Add shimmer
      glare += inputColor.rgb * shimmer;
      
      // Composite with input
      vec3 finalColor = inputColor.rgb + glare;
      
      // Clamp
      finalColor = clamp(finalColor, 0.0, 1.0);
      
      gl_FragColor = vec4(finalColor, inputColor.a);
    }
  `,
};

// ============================================
// HORIZONTAL STREAK PASS (for 2-pass pipeline)
// ============================================
export const horizontalStreakShader = {
  uniforms: {
    uInputTexture: { value: null },
    uStreakLength: { value: 0.5 },
    uBass: { value: 0 },
    uCameraFOV: { value: 75.0 },
    uResolution: { value: [1, 1] },
    uKernelSize: { value: 15 },
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
    uniform float uStreakLength;
    uniform float uBass;
    uniform float uCameraFOV;
    uniform vec2 uResolution;
    uniform float uKernelSize;
    
    varying vec2 vUv;
    
    float extractBrightness(vec4 color) {
      float luminance = dot(color.rgb, vec3(0.299, 0.587, 0.114));
      return max(0.0, luminance - 0.7);
    }
    
    void main() {
      vec3 streak = vec3(0.0);
      float totalWeight = 0.0;
      
      float streakLength = uStreakLength * (1.0 + uBass * 0.5);
      float fovFactor = uCameraFOV / 75.0;
      streakLength *= fovFactor;
      
      vec2 texelSize = 1.0 / uResolution;
      int samples = int(uKernelSize);
      
      for (int i = 0; i < 15; i++) {
        if (i >= samples) break;
        
        float offset = float(i) - float(samples) * 0.5;
        vec2 sampleUV = vUv + vec2(offset * streakLength * texelSize.x, 0.0);
        
        if (sampleUV.x < 0.0 || sampleUV.x > 1.0) continue;
        
        vec4 sampleColor = texture2D(uInputTexture, sampleUV);
        float brightness = extractBrightness(sampleColor);
        
        float weight = 1.0 / (1.0 + abs(offset) * 0.1);
        streak += sampleColor.rgb * brightness * weight;
        totalWeight += weight;
      }
      
      if (totalWeight > 0.0) {
        streak /= totalWeight;
      }
      
      gl_FragColor = vec4(streak, 1.0);
    }
  `,
};

// ============================================
// VERTICAL STREAK PASS (for 2-pass pipeline)
// ============================================
export const verticalStreakShader = {
  uniforms: {
    uInputTexture: { value: null },
    uStreakLength: { value: 0.5 },
    uMid: { value: 0 },
    uCameraFOV: { value: 75.0 },
    uResolution: { value: [1, 1] },
    uKernelSize: { value: 15 },
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
    uniform float uStreakLength;
    uniform float uMid;
    uniform float uCameraFOV;
    uniform vec2 uResolution;
    uniform float uKernelSize;
    
    varying vec2 vUv;
    
    float extractBrightness(vec4 color) {
      float luminance = dot(color.rgb, vec3(0.299, 0.587, 0.114));
      return max(0.0, luminance - 0.7);
    }
    
    void main() {
      vec3 streak = vec3(0.0);
      float totalWeight = 0.0;
      
      float streakLength = uStreakLength * (1.0 + uMid * 0.3);
      float fovFactor = uCameraFOV / 75.0;
      streakLength *= fovFactor;
      
      vec2 texelSize = 1.0 / uResolution;
      int samples = int(uKernelSize);
      
      for (int i = 0; i < 15; i++) {
        if (i >= samples) break;
        
        float offset = float(i) - float(samples) * 0.5;
        vec2 sampleUV = vUv + vec2(0.0, offset * streakLength * texelSize.y);
        
        if (sampleUV.y < 0.0 || sampleUV.y > 1.0) continue;
        
        vec4 sampleColor = texture2D(uInputTexture, sampleUV);
        float brightness = extractBrightness(sampleColor);
        
        float weight = 1.0 / (1.0 + abs(offset) * 0.1);
        streak += sampleColor.rgb * brightness * weight;
        totalWeight += weight;
      }
      
      if (totalWeight > 0.0) {
        streak /= totalWeight;
      }
      
      gl_FragColor = vec4(streak, 1.0);
    }
  `,
};

