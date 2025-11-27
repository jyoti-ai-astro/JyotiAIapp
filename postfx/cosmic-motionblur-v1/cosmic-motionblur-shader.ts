/**
 * Cosmic MotionBlur v1 Shader
 * 
 * Phase 3 — Section 12: COSMIC MOTIONBLUR ENGINE v1
 * Cosmic MotionBlur Engine v1 (F12)
 * 
 * Screen-Space Velocity Blur + Radial Acceleration Blur with:
 * - Screen-space velocity blur (approx motion vectors using previous frame UV offset)
 * - Radial acceleration blur (scroll + blessing wave)
 * - Audio-reactive smear (bass → length, high → jitter)
 * - BlessingWave → explosive radial burst blur
 * - Mouse-swipe directional smear
 * - CameraFOV compensation
 * - Depth-aware blur (optional: reduce blur in near areas)
 * - Mobile fallback: reduce kernel samples by 50%, disable depth-aware blur
 */

export const cosmicMotionBlurShader = {
  uniforms: {
    uTime: { value: 0 },
    uBlurStrength: { value: 0.5 },
    uRadialStrength: { value: 0.3 },
    uVelocityFactor: { value: 1.0 },
    uSampleCount: { value: 16.0 },
    uBass: { value: 0 },
    uMid: { value: 0 },
    uHigh: { value: 0 },
    uScrollVelocity: { value: [0.0, 0.0] },
    uMouseVelocity: { value: [0.0, 0.0] },
    uBlessingWaveProgress: { value: 0 },
    uCameraFOV: { value: 75.0 },
    uResolution: { value: [1, 1] },
    uDisableDepthAware: { value: 0.0 }, // 1.0 = disable depth-aware blur (mobile)
  },

  vertexShader: ``,

  fragmentShader: `
    precision highp float;
    
    uniform float uTime;
    uniform float uBlurStrength;
    uniform float uRadialStrength;
    uniform float uVelocityFactor;
    uniform float uSampleCount;
    uniform float uBass;
    uniform float uMid;
    uniform float uHigh;
    uniform vec2 uScrollVelocity;
    uniform vec2 uMouseVelocity;
    uniform float uBlessingWaveProgress;
    uniform float uCameraFOV;
    uniform vec2 uResolution;
    uniform float uDisableDepthAware;
    
    // ============================================
    // HASH FUNCTION (for jitter)
    // ============================================
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }
    
    // ============================================
    // DEPTH-AWARE BLUR REDUCTION (Optional)
    // ============================================
    float depthAwareFactor(vec2 uv, vec4 inputColor) {
      if (uDisableDepthAware > 0.5) return 1.0;
      
      // Sample input to approximate depth (brighter = further)
      float luminance = dot(inputColor.rgb, vec3(0.299, 0.587, 0.114));
      
      // Reduce blur in near areas (darker = near)
      float depthFactor = smoothstep(0.3, 0.7, luminance);
      
      return depthFactor;
    }
    
    // ============================================
    // SCREEN-SPACE VELOCITY BLUR
    // ============================================
    vec3 velocityBlur(vec2 uv, vec2 velocity, vec4 inputColor) {
      vec3 color = vec3(0.0);
      float totalWeight = 0.0;
      
      // Audio-reactive smear length: bass → length
      float smearLength = uBlurStrength * (1.0 + uBass * 0.5);
      
      // Audio-reactive jitter: high → jitter
      float jitter = uHigh * 0.1;
      
      // FOV compensation
      float fovFactor = uCameraFOV / 75.0;
      smearLength *= fovFactor;
      
      // Depth-aware factor
      float depthFactor = depthAwareFactor(uv, inputColor);
      smearLength *= depthFactor;
      
      // Sample along velocity vector
      int samples = int(uSampleCount);
      for (int i = 0; i < 32; i++) {
        if (i >= samples) break;
        
        float t = float(i) / float(samples - 1);
        t = t * 2.0 - 1.0; // -1 to 1
        
        // Jitter offset
        vec2 jitterOffset = vec2(
          hash(uv + vec2(float(i), 0.0)) - 0.5,
          hash(uv + vec2(0.0, float(i))) - 0.5
        ) * jitter;
        
        // Sample position
        vec2 sampleUV = uv + velocity * t * smearLength * uVelocityFactor + jitterOffset;
        
        // Clamp to valid UV range
        if (sampleUV.x < 0.0 || sampleUV.x > 1.0 || sampleUV.y < 0.0 || sampleUV.y > 1.0) {
          continue;
        }
        
        // Sample with weight (center-weighted)
        float weight = 1.0 - abs(t);
        weight = smoothstep(0.0, 1.0, weight);
        
        vec4 sampleColor = texture(inputBuffer, sampleUV);
        color += sampleColor.rgb * weight;
        totalWeight += weight;
      }
      
      if (totalWeight > 0.0) {
        color /= totalWeight;
      } else {
        color = inputColor.rgb;
      }
      
      return color;
    }
    
    // ============================================
    // RADIAL ACCELERATION BLUR (Scroll + Blessing Wave)
    // ============================================
    vec3 radialBlur(vec2 uv, vec4 inputColor) {
      vec3 color = vec3(0.0);
      float totalWeight = 0.0;
      
      vec2 center = vec2(0.5, 0.5);
      vec2 offset = uv - center;
      float distance = length(offset);
      
      // Scroll velocity radial component
      float scrollRadial = length(uScrollVelocity);
      
      // Blessing wave radial component
      float blessingRadial = uBlessingWaveProgress * 0.5;
      
      // Combined radial strength
      float radial = (scrollRadial + blessingRadial) * uRadialStrength;
      
      if (radial <= 0.0) {
        return inputColor.rgb;
      }
      
      // FOV compensation
      float fovFactor = uCameraFOV / 75.0;
      radial *= fovFactor;
      
      // Depth-aware factor
      float depthFactor = depthAwareFactor(uv, inputColor);
      radial *= depthFactor;
      
      // Sample along radial direction
      vec2 direction = normalize(offset);
      int samples = int(uSampleCount);
      
      for (int i = 0; i < 32; i++) {
        if (i >= samples) break;
        
        float t = float(i) / float(samples - 1);
        t = t * 2.0 - 1.0; // -1 to 1
        
        // Sample position (radial)
        vec2 sampleUV = uv + direction * t * radial;
        
        // Clamp to valid UV range
        if (sampleUV.x < 0.0 || sampleUV.x > 1.0 || sampleUV.y < 0.0 || sampleUV.y > 1.0) {
          continue;
        }
        
        // Sample with weight
        float weight = 1.0 - abs(t);
        weight = smoothstep(0.0, 1.0, weight);
        
        vec4 sampleColor = texture(inputBuffer, sampleUV);
        color += sampleColor.rgb * weight;
        totalWeight += weight;
      }
      
      if (totalWeight > 0.0) {
        color /= totalWeight;
      } else {
        color = inputColor.rgb;
      }
      
      return color;
    }
    
    // ============================================
    // MOUSE-SWIPE DIRECTIONAL SMEAR
    // ============================================
    vec3 mouseSwipeBlur(vec2 uv, vec2 mouseVelocity, vec4 inputColor) {
      if (length(mouseVelocity) <= 0.0) {
        return inputColor.rgb;
      }
      
      vec3 color = vec3(0.0);
      float totalWeight = 0.0;
      
      // Mouse velocity direction
      vec2 direction = normalize(mouseVelocity);
      float speed = length(mouseVelocity);
      
      // Smear strength based on speed
      float smear = speed * uBlurStrength * 0.3;
      
      // FOV compensation
      float fovFactor = uCameraFOV / 75.0;
      smear *= fovFactor;
      
      // Depth-aware factor
      float depthFactor = depthAwareFactor(uv, inputColor);
      smear *= depthFactor;
      
      // Sample along mouse swipe direction
      int samples = int(uSampleCount);
      for (int i = 0; i < 32; i++) {
        if (i >= samples) break;
        
        float t = float(i) / float(samples - 1);
        t = t * 2.0 - 1.0; // -1 to 1
        
        // Sample position
        vec2 sampleUV = uv + direction * t * smear;
        
        // Clamp to valid UV range
        if (sampleUV.x < 0.0 || sampleUV.x > 1.0 || sampleUV.y < 0.0 || sampleUV.y > 1.0) {
          continue;
        }
        
        // Sample with weight
        float weight = 1.0 - abs(t);
        weight = smoothstep(0.0, 1.0, weight);
        
        vec4 sampleColor = texture(inputBuffer, sampleUV);
        color += sampleColor.rgb * weight;
        totalWeight += weight;
      }
      
      if (totalWeight > 0.0) {
        color /= totalWeight;
      } else {
        color = inputColor.rgb;
      }
      
      return color;
    }
    
    // ============================================
    // BLESSING WAVE EXPLOSIVE RADIAL BURST BLUR
    // ============================================
    vec3 blessingBurstBlur(vec2 uv, vec4 inputColor) {
      if (uBlessingWaveProgress <= 0.0) return vec3(0.0);
      
      vec3 color = vec3(0.0);
      float totalWeight = 0.0;
      
      vec2 center = vec2(0.5, 0.5);
      vec2 offset = uv - center;
      vec2 direction = normalize(offset);
      float distance = length(offset);
      
      // Explosive radial burst
      float burst = uBlessingWaveProgress;
      
      // Pulsing with blessing wave
      float pulse = sin(uTime * 4.0 + uBlessingWaveProgress * 6.28318) * 0.3 + 0.7;
      burst *= pulse;
      
      // Radial expansion blur
      float radialBlur = burst * uRadialStrength * 0.8;
      
      // FOV compensation
      float fovFactor = uCameraFOV / 75.0;
      radialBlur *= fovFactor;
      
      // Sample along radial direction
      int samples = int(uSampleCount);
      for (int i = 0; i < 32; i++) {
        if (i >= samples) break;
        
        float t = float(i) / float(samples - 1);
        t = t * 2.0 - 1.0; // -1 to 1
        
        // Sample position (radial burst)
        vec2 sampleUV = uv + direction * t * radialBlur;
        
        // Clamp to valid UV range
        if (sampleUV.x < 0.0 || sampleUV.x > 1.0 || sampleUV.y < 0.0 || sampleUV.y > 1.0) {
          continue;
        }
        
        // Sample with weight
        float weight = 1.0 - abs(t);
        weight = smoothstep(0.0, 1.0, weight);
        
        vec4 sampleColor = texture(inputBuffer, sampleUV);
        color += sampleColor.rgb * weight;
        totalWeight += weight;
      }
      
      if (totalWeight > 0.0) {
        color /= totalWeight;
      } else {
        color = inputColor.rgb;
      }
      
      return color;
    }
    
    void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
      // Sample base color
      vec3 color = inputColor.rgb;
      
      // Approximate velocity from scroll and mouse
      vec2 velocity = uScrollVelocity + uMouseVelocity;
      
      // Screen-space velocity blur
      vec3 velocityBlurred = velocityBlur(uv, velocity, inputColor);
      
      // Radial acceleration blur
      vec3 radialBlurred = radialBlur(uv, inputColor);
      
      // Mouse-swipe directional smear
      vec3 mouseBlurred = mouseSwipeBlur(uv, uMouseVelocity, inputColor);
      
      // Blessing wave explosive radial burst blur
      vec3 blessingBlurred = blessingBurstBlur(uv, inputColor);
      
      // Combine all blur effects
      // Mix based on strength of each component
      float velocityWeight = length(velocity) > 0.0 ? 0.4 : 0.0;
      float radialWeight = length(uScrollVelocity) > 0.0 || uBlessingWaveProgress > 0.0 ? 0.3 : 0.0;
      float mouseWeight = length(uMouseVelocity) > 0.0 ? 0.2 : 0.0;
      float blessingWeight = uBlessingWaveProgress > 0.0 ? 0.3 : 0.0;
      
      // Normalize weights
      float totalWeight = velocityWeight + radialWeight + mouseWeight + blessingWeight;
      if (totalWeight > 0.0) {
        velocityWeight /= totalWeight;
        radialWeight /= totalWeight;
        mouseWeight /= totalWeight;
        blessingWeight /= totalWeight;
      }
      
      // Blend blurred results
      color = mix(
        color,
        velocityBlurred * velocityWeight + 
        radialBlurred * radialWeight + 
        mouseBlurred * mouseWeight + 
        blessingBlurred * blessingWeight,
        min(1.0, totalWeight)
      );
      
      // Clamp
      color = clamp(color, 0.0, 1.0);
      
      outputColor = vec4(color, inputColor.a);
    }
  `,
};

