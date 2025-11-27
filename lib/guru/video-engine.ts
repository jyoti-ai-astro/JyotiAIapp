/**
 * Video Engine
 * 
 * Phase 3 — Section 34: PAGES PHASE 19 (F34)
 * 
 * Real-time video frame analysis for spiritual insights
 */

export interface VideoFrameInsight {
  timestamp: number;
  aura?: {
    dominantColor: string;
    energyLevel: number;
  };
  emotion?: {
    primaryEmotion: string;
    intensity: number;
  };
  chakras?: {
    [key: string]: number; // chakra name -> strength (0-10)
  };
  gesture?: {
    type: 'namaste' | 'raised-palm' | 'smile' | 'sad' | 'none';
    confidence: number;
  };
}

export interface VideoEngineCallbacks {
  onFrameInsight?: (insight: VideoFrameInsight) => void;
  onError?: (error: Error) => void;
  onStreamStart?: () => void;
  onStreamStop?: () => void;
}

export class VideoEngine {
  private videoElement: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private context: CanvasRenderingContext2D | null = null;
  private stream: MediaStream | null = null;
  private isStreaming: boolean = false;
  private analysisLoopId: number | null = null;
  private callbacks: VideoEngineCallbacks;
  private frameCount: number = 0;
  private lastAnalysisTime: number = 0;
  private analysisInterval: number = 140; // Phase 27 - F42: Reduced from 100ms to 140ms (~7 FPS for analysis)
  private adaptiveMode: boolean = false; // Phase 27 - F42: Adaptive performance mode
  private lowPowerDetected: boolean = false; // Phase 27 - F42: Low power device detection
  private tabVisible: boolean = true; // Phase 27 - F42: Tab visibility tracking

  constructor(callbacks: VideoEngineCallbacks = {}) {
    this.callbacks = callbacks;
    
    // Phase 27 - F42: Detect low power device and tab visibility
    this.detectLowPowerDevice();
    this.setupVisibilityListener();
  }
  
  /**
   * Detect low power device (Phase 27 - F42)
   */
  private detectLowPowerDevice(): void {
    // Check for mobile devices or low-end hardware
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    
    this.lowPowerDetected = isMobile || hardwareConcurrency < 4;
    
    if (this.lowPowerDetected) {
      this.analysisInterval = 200; // Phase 27 - F42: 200ms for low-power devices
      this.adaptiveMode = true;
    }
  }
  
  /**
   * Setup visibility listener to pause analysis when tab not visible (Phase 27 - F42)
   */
  private setupVisibilityListener(): void {
    if (typeof document === 'undefined') return;
    
    document.addEventListener('visibilitychange', () => {
      this.tabVisible = !document.hidden;
      
      if (!this.tabVisible && this.isStreaming) {
        // Pause analysis when tab not visible
        if (this.analysisLoopId !== null) {
          cancelAnimationFrame(this.analysisLoopId);
          this.analysisLoopId = null;
        }
      } else if (this.tabVisible && this.isStreaming && this.analysisLoopId === null) {
        // Resume analysis when tab becomes visible
        this.startAnalysisLoop();
      }
    });
  }

  /**
   * Setup video stream from camera
   */
  async setupVideoStream(videoElement: HTMLVideoElement): Promise<void> {
    try {
      this.videoElement = videoElement;

      // Request camera access
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      });

      // Set video source
      videoElement.srcObject = this.stream;
      await videoElement.play();

      // Setup canvas for frame capture
      this.canvas = document.createElement('canvas');
      this.canvas.width = videoElement.videoWidth || 1280;
      this.canvas.height = videoElement.videoHeight || 720;
      this.context = this.canvas.getContext('2d');

      if (!this.context) {
        throw new Error('Could not get canvas context');
      }

      this.isStreaming = true;
      this.callbacks.onStreamStart?.();

      // Start continuous analysis loop
      this.startAnalysisLoop();
    } catch (error) {
      console.error('Error setting up video stream:', error);
      this.callbacks.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Stop video stream
   */
  stopVideoStream(): void {
    this.isStreaming = false;

    // Stop analysis loop
    if (this.analysisLoopId !== null) {
      cancelAnimationFrame(this.analysisLoopId);
      this.analysisLoopId = null;
    }

    // Stop all tracks
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    // Clear video element
    if (this.videoElement) {
      this.videoElement.srcObject = null;
      this.videoElement = null;
    }

    // Clear canvas
    this.canvas = null;
    this.context = null;
    this.frameCount = 0;

    this.callbacks.onStreamStop?.();
  }

  /**
   * Start continuous analysis loop (Phase 27 - F42: Optimized)
   */
  private startAnalysisLoop(): void {
    const analyze = async () => {
      // Phase 27 - F42: Skip if tab not visible
      if (!this.tabVisible || !this.isStreaming || !this.videoElement || !this.context || !this.canvas) {
        this.analysisLoopId = requestAnimationFrame(analyze);
        return;
      }

      const now = Date.now();
      const interval = this.adaptiveMode && this.lowPowerDetected ? 250 : this.analysisInterval; // Phase 27 - F42: Adaptive interval
      
      if (now - this.lastAnalysisTime >= interval) {
        try {
          // Capture frame
          this.context.drawImage(
            this.videoElement,
            0,
            0,
            this.canvas.width,
            this.canvas.height
          );

          // Analyze frame
          const insight = await this.analyzeVideoFrame(this.canvas);
          this.callbacks.onFrameInsight?.(insight);

          this.lastAnalysisTime = now;
          this.frameCount++;
        } catch (error) {
          console.error('Frame analysis error:', error);
        }
      }

      // Continue loop
      this.analysisLoopId = requestAnimationFrame(analyze);
    };

    this.analysisLoopId = requestAnimationFrame(analyze);
  }

  /**
   * Analyze single video frame
   */
  async analyzeVideoFrame(canvas: HTMLCanvasElement): Promise<VideoFrameInsight> {
    const timestamp = Date.now();
    const insight: VideoFrameInsight = { timestamp };

    try {
      // Convert canvas to blob for API call
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert canvas to blob'));
          }
        }, 'image/jpeg', 0.8);
      });

      // In production, call API for frame analysis
      // For now, use local analysis
      const imageData = this.context?.getImageData(0, 0, canvas.width, canvas.height);
      
      if (imageData) {
        // Analyze aura from frame
        insight.aura = await this.auraFromVideoFrame(imageData);
        
        // Analyze emotion from frame
        insight.emotion = await this.emotionFromVideoFrame(imageData);
        
        // Analyze chakras from frame
        insight.chakras = await this.analyzeChakrasFromFrame(imageData);
        
        // Detect gestures
        insight.gesture = await this.gestureDetection(imageData);
      }

      return insight;
    } catch (error) {
      console.error('Frame analysis error:', error);
      return insight;
    }
  }

  /**
   * Analyze aura from video frame
   */
  private async auraFromVideoFrame(imageData: ImageData): Promise<VideoFrameInsight['aura']> {
    // In production, use ML model for aura detection
    // For now, analyze color distribution
    const data = imageData.data;
    const colorCounts: { [key: string]: number } = {
      'Red': 0,
      'Orange': 0,
      'Yellow': 0,
      'Green': 0,
      'Blue': 0,
      'Indigo': 0,
      'Violet': 0,
    };

    // Sample pixels (every 10th pixel for performance)
    for (let i = 0; i < data.length; i += 40) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Simple color classification
      if (r > 200 && g < 100 && b < 100) colorCounts['Red']++;
      else if (r > 200 && g > 150 && b < 100) colorCounts['Orange']++;
      else if (r > 200 && g > 200 && b < 100) colorCounts['Yellow']++;
      else if (r < 100 && g > 150 && b < 100) colorCounts['Green']++;
      else if (r < 100 && g < 150 && b > 200) colorCounts['Blue']++;
      else if (r < 100 && g < 100 && b > 150) colorCounts['Indigo']++;
      else if (r > 150 && g < 100 && b > 150) colorCounts['Violet']++;
    }

    // Find dominant color
    const dominantColor = Object.entries(colorCounts).reduce((a, b) =>
      colorCounts[a[0]] > colorCounts[b[0]] ? a : b
    )[0];

    // Calculate energy level (0-10) based on color intensity
    const totalPixels = data.length / 4;
    const energyLevel = Math.min(10, (Object.values(colorCounts).reduce((a, b) => a + b, 0) / totalPixels) * 20);

    return {
      dominantColor,
      energyLevel: Math.round(energyLevel * 10) / 10,
    };
  }

  /**
   * Analyze emotion from video frame
   */
  private async emotionFromVideoFrame(imageData: ImageData): Promise<VideoFrameInsight['emotion']> {
    // In production, use emotion detection ML model
    // For now, return placeholder based on frame analysis
    const data = imageData.data;
    let brightness = 0;

    // Calculate average brightness
    for (let i = 0; i < data.length; i += 4) {
      brightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }
    brightness = brightness / (data.length / 4);

    // Simple emotion detection based on brightness and color distribution
    const emotions = ['calm', 'happy', 'focused', 'neutral'];
    const emotion = emotions[Math.floor(Math.random() * emotions.length)]; // Placeholder
    const intensity = Math.min(1.0, brightness / 255);

    return {
      primaryEmotion: emotion,
      intensity: Math.round(intensity * 10) / 10,
    };
  }

  /**
   * Analyze chakras from video frame
   */
  private async analyzeChakrasFromFrame(imageData: ImageData): Promise<VideoFrameInsight['chakras']> {
    // In production, use specialized chakra detection
    // For now, return placeholder values
    const chakras: { [key: string]: number } = {
      'Root': 6 + Math.random() * 2,
      'Sacral': 5 + Math.random() * 2,
      'Solar Plexus': 7 + Math.random() * 2,
      'Heart': 6 + Math.random() * 2,
      'Throat': 5 + Math.random() * 2,
      'Third Eye': 7 + Math.random() * 2,
      'Crown': 6 + Math.random() * 2,
    };

    // Round to 1 decimal
    Object.keys(chakras).forEach(key => {
      chakras[key] = Math.round(chakras[key] * 10) / 10;
    });

    return chakras;
  }

  /**
   * Detect gestures from video frame
   */
  private async gestureDetection(imageData: ImageData): Promise<VideoFrameInsight['gesture']> {
    // In production, use gesture recognition ML model
    // For now, return placeholder
    const gestures: Array<'namaste' | 'raised-palm' | 'smile' | 'sad' | 'none'> = [
      'namaste',
      'raised-palm',
      'smile',
      'sad',
      'none',
    ];

    // Placeholder: randomly detect gestures occasionally
    if (Math.random() > 0.95) {
      const gesture = gestures[Math.floor(Math.random() * (gestures.length - 1))];
      return {
        type: gesture,
        confidence: 0.7 + Math.random() * 0.3,
      };
    }

    return {
      type: 'none',
      confidence: 0,
    };
  }

  /**
   * Get current frame as blob
   */
  async getCurrentFrame(): Promise<Blob | null> {
    if (!this.canvas) {
      return null;
    }

    return new Promise((resolve) => {
      this.canvas!.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.8);
    });
  }

  /**
   * Check if currently streaming
   */
  isCurrentlyStreaming(): boolean {
    return this.isStreaming;
  }

  /**
   * Get frame count
   */
  getFrameCount(): number {
    return this.frameCount;
  }
}

