/**
 * Cosmic Depth v1 Shader
 * 
 * Phase 3 — Section 2: COSMIC DEPTH ENGINE v1
 * Cosmic Depth Engine v1 (F2)
 * 
 * Depth-of-Field post-processing with:
 * - Circle of Confusion (CoC) calculation
 * - Near blur (foreground)
 * - Far blur (background)
 * - Bokeh kernel
 * - DOF mask
 * - Motion-reactive blur intensity
 * - BlessingWave integration
 * - FOV compatibility
 */

export const cosmicDepthShader = {
  uniforms: {
    uTime: { value: 0 },
    uBass: { value: 0 },
    uMid: { value: 0 },
    uHigh: { value: 0 },
    uFocusDistance: { value: 5.0 },
    uAperture: { value: 0.1 },
    uBlurIntensity: { value: 1.0 },
    uNearBlur: { value: 1.0 },
    uFarBlur: { value: 1.0 },
    uBlessingWaveProgress: { value: 0 },
    uCameraNear: { value: 0.1 },
    uCameraFar: { value: 1000.0 },
    uFOV: { value: 75.0 },
    uResolution: { value: [1, 1] },
    uKernelSize: { value: 9 },
  },

  vertexShader: ``,

  fragmentShader: `
    precision highp float;
    
    uniform float uTime;
    uniform float uBass;
    uniform float uMid;
    uniform float uHigh;
    uniform float uFocusDistance;
    uniform float uAperture;
    uniform float uBlurIntensity;
    uniform float uNearBlur;
    uniform float uFarBlur;
    uniform float uBlessingWaveProgress;
    uniform float uCameraNear;
    uniform float uCameraFar;
    uniform float uFOV;
    uniform vec2 uResolution;
    uniform float uKernelSize;
    uniform sampler2D depthBuffer;
    
    // ============================================
    // DEPTH TO LINEAR
    // ============================================
    float depthToLinear(float depth) {
      float z = depth * 2.0 - 1.0;
      return (2.0 * uCameraNear * uCameraFar) / (uCameraFar + uCameraNear - z * (uCameraFar - uCameraNear));
    }
    
    // ============================================
    // CIRCLE OF CONFUSION (CoC) CALCULATION
    // ============================================
    float calculateCoC(float depth) {
      float linearDepth = depthToLinear(depth);
      float focusDistance = uFocusDistance;
      
      // Calculate CoC based on distance from focus
      float coc = abs(linearDepth - focusDistance) / linearDepth;
      coc *= uAperture;
      
      // Clamp CoC
      coc = clamp(coc, 0.0, 1.0);
      
      // Motion-reactive blur: bass/mid/high influence
      float motionBlur = 1.0 + uBass * 0.15 + uMid * 0.1 + uHigh * 0.05;
      coc *= motionBlur * uBlurIntensity;
      
      // BlessingWave → DOF pulse
      if (uBlessingWaveProgress > 0.0) {
        float blessingPulse = sin(uTime * 2.0 + uBlessingWaveProgress * 6.28318) * 0.2 + 1.0;
        coc *= blessingPulse;
      }
      
      return coc;
    }
    
    // ============================================
    // BOKEH KERNEL (hexagonal)
    // ============================================
    vec4 bokehBlur(vec2 uv, float coc, vec2 direction) {
      vec4 color = vec4(0.0);
      float totalWeight = 0.0;
      
      // Hexagonal bokeh pattern
      float kernelSize = uKernelSize;
      float samples = kernelSize;
      
      vec2 texelSize = 1.0 / uResolution;
      vec2 offset = direction * texelSize * coc;
      
      // Hexagonal sampling pattern
      for (float i = 0.0; i < samples; i += 1.0) {
        float angle = (i / samples) * 6.28318;
        float radius = (i / samples) * coc * 2.0;
        
        // Hexagonal pattern (6 points)
        float hexAngle = floor(angle / (6.28318 / 6.0)) * (6.28318 / 6.0);
        vec2 hexOffset = vec2(cos(hexAngle), sin(hexAngle)) * radius;
        
        vec2 sampleUV = uv + hexOffset * offset;
        float weight = 1.0 / (1.0 + length(hexOffset));
        
        color += texture(inputBuffer, sampleUV) * weight;
        totalWeight += weight;
      }
      
      if (totalWeight > 0.0) {
        color /= totalWeight;
      }
      
      return color;
    }
    
    // ============================================
    // GAUSSIAN BLUR (for smooth DOF)
    // ============================================
    vec4 gaussianBlur(vec2 uv, vec2 direction, float coc) {
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
      vec2 offset = direction * texelSize * coc * 2.0;
      
      for (int i = 0; i < 9; i++) {
        float weight = weights[i];
        vec2 sampleUV = uv + offset * (float(i) - 4.0);
        color += texture(inputBuffer, sampleUV) * weight;
      }
      
      return color;
    }
    
    // ============================================
    // DOF MASK
    // ============================================
    float calculateDOFMask(float depth, float coc) {
      // Create smooth DOF mask based on CoC
      float mask = smoothstep(0.0, 0.3, coc);
      
      // Near blur mask (foreground)
      if (depth < uFocusDistance) {
        mask *= uNearBlur;
      }
      
      // Far blur mask (background)
      if (depth > uFocusDistance) {
        mask *= uFarBlur;
      }
      
      return mask;
    }
    
    void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
      // Sample depth texture (from @react-three/postprocessing)
      // Note: depthBuffer is accessed via depthBuffer uniform in postprocessing
      float depth = texture(depthBuffer, uv).r;
      
      // Calculate Circle of Confusion
      float coc = calculateCoC(depth);
      
      // Calculate DOF mask
      float dofMask = calculateDOFMask(depth, coc);
      
      // Apply blur based on CoC
      vec4 blurredColor = inputColor;
      
      if (coc > 0.01) {
        // Horizontal blur
        vec4 blurH = gaussianBlur(uv, vec2(1.0, 0.0), coc);
        // Vertical blur
        vec4 blurV = gaussianBlur(uv, vec2(0.0, 1.0), coc);
        blurredColor = (blurH + blurV) * 0.5;
        
        // Add bokeh for high CoC
        if (coc > 0.3) {
          vec4 bokeh = bokehBlur(uv, coc, vec2(1.0, 0.0));
          blurredColor = mix(blurredColor, bokeh, (coc - 0.3) / 0.7);
        }
      }
      
      // Blend based on DOF mask
      vec4 finalColor = mix(inputColor, blurredColor, dofMask);
      
      // Clamp
      finalColor = clamp(finalColor, 0.0, 1.0);
      
      outputColor = finalColor;
    }
  `,
};

// ============================================
// COC GENERATION SHADER (for pre-pass)
// ============================================
export const cocShader = {
  uniforms: {
    uFocusDistance: { value: 5.0 },
    uAperture: { value: 0.1 },
    uCameraNear: { value: 0.1 },
    uCameraFar: { value: 1000.0 },
    uBlurIntensity: { value: 1.0 },
    uBass: { value: 0 },
    uMid: { value: 0 },
    uHigh: { value: 0 },
    uBlessingWaveProgress: { value: 0 },
    uTime: { value: 0 },
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
    
    uniform float uFocusDistance;
    uniform float uAperture;
    uniform float uCameraNear;
    uniform float uCameraFar;
    uniform float uBlurIntensity;
    uniform float uBass;
    uniform float uMid;
    uniform float uHigh;
    uniform float uBlessingWaveProgress;
    uniform float uTime;
    uniform sampler2D depthBuffer;
    
    float depthToLinear(float depth) {
      float z = depth * 2.0 - 1.0;
      return (2.0 * uCameraNear * uCameraFar) / (uCameraFar + uCameraNear - z * (uCameraFar - uCameraNear));
    }
    
    float calculateCoC(float depth) {
      float linearDepth = depthToLinear(depth);
      float focusDistance = uFocusDistance;
      
      float coc = abs(linearDepth - focusDistance) / linearDepth;
      coc *= uAperture;
      coc = clamp(coc, 0.0, 1.0);
      
      float motionBlur = 1.0 + uBass * 0.15 + uMid * 0.1 + uHigh * 0.05;
      coc *= motionBlur * uBlurIntensity;
      
      if (uBlessingWaveProgress > 0.0) {
        float blessingPulse = sin(uTime * 2.0 + uBlessingWaveProgress * 6.28318) * 0.2 + 1.0;
        coc *= blessingPulse;
      }
      
      return coc;
    }
    
    void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
      float depth = texture2D(depthBuffer, uv).r;
      float coc = calculateCoC(depth);
      
      // Output CoC in red channel
      outputColor = vec4(coc, 0.0, 0.0, 1.0);
    }
  `,
};

