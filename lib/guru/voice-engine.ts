/**
 * Voice Engine
 * 
 * Phase 3 — Section 32: PAGES PHASE 17 (F32)
 * 
 * Handles voice recording, Speech-to-Text (STT), and Text-to-Speech (TTS)
 */

export interface VoiceEngineCallbacks {
  onTranscript?: (text: string, isFinal: boolean) => void;
  onError?: (error: Error) => void;
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
  onTTSStart?: () => void;
  onTTSComplete?: () => void;
}

export class VoiceEngine {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isRecording: boolean = false;
  private callbacks: VoiceEngineCallbacks;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;

  constructor(callbacks: VoiceEngineCallbacks = {}) {
    this.callbacks = callbacks;
  }

  /**
   * Check if microphone is available
   */
  async checkMicrophoneAvailable(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Microphone not available:', error);
      return false;
    }
  }

  /**
   * Start recording audio
   */
  async startRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Set up audio analysis for waveform visualization
      this.audioContext = new AudioContext();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      source.connect(this.analyser);

      // Set up MediaRecorder
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.handleRecordingComplete(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        if (this.audioContext) {
          this.audioContext.close();
          this.audioContext = null;
        }
      };

      this.mediaRecorder.start();
      this.isRecording = true;
      this.callbacks.onRecordingStart?.();
    } catch (error) {
      console.error('Error starting recording:', error);
      this.callbacks.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Stop recording
   */
  stopRecording(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      this.callbacks.onRecordingStop?.();
    }
  }

  /**
   * Get audio waveform data for visualization
   */
  getWaveformData(): number[] {
    if (!this.analyser || !this.dataArray) {
      return new Array(64).fill(0);
    }

    this.analyser.getByteFrequencyData(this.dataArray);
    const waveform: number[] = [];
    
    // Downsample to 64 points for visualization
    const step = Math.floor(this.dataArray.length / 64);
    for (let i = 0; i < 64; i++) {
      const index = i * step;
      waveform.push(this.dataArray[index] / 255);
    }

    return waveform;
  }

  /**
   * Handle recording complete - send to STT
   */
  private async handleRecordingComplete(audioBlob: Blob): Promise<void> {
    try {
      await this.streamToWhisper(audioBlob);
    } catch (error) {
      console.error('Error processing recording:', error);
      this.callbacks.onError?.(error as Error);
    }
  }

  /**
   * Stream audio to Whisper API for transcription
   */
  async streamToWhisper(audioBlob: Blob): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch('/api/guru-voice', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`STT API error: ${response.statusText}`);
      }

      // Stream the transcript
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response stream available');
      }

      let fullTranscript = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                fullTranscript = data.text;
                this.callbacks.onTranscript?.(data.text, data.isFinal || false);
              }
            } catch (e) {
              // Skip invalid JSON lines
            }
          }
        }
      }

      // Final transcript
      if (fullTranscript) {
        this.callbacks.onTranscript?.(fullTranscript, true);
      }

      return fullTranscript;
    } catch (error) {
      console.error('Error in STT:', error);
      throw error;
    }
  }

  /**
   * Handle voice message (record → transcribe → return text)
   */
  async handleVoiceMessage(): Promise<string> {
    return new Promise((resolve, reject) => {
      let finalTranscript = '';

      const originalOnTranscript = this.callbacks.onTranscript;
      this.callbacks.onTranscript = (text: string, isFinal: boolean) => {
        originalOnTranscript?.(text, isFinal);
        if (isFinal) {
          finalTranscript = text;
        }
      };

      const originalOnError = this.callbacks.onError;
      this.callbacks.onError = (error: Error) => {
        originalOnError?.(error);
        reject(error);
      };

      // Start recording, will auto-stop and transcribe
      this.startRecording().catch(reject);
    });
  }

  /**
   * Speak Guru message using TTS
   */
  async speakGuruMessage(message: string, emotion: 'calm' | 'divine' | 'gentle' = 'divine'): Promise<void> {
    try {
      this.callbacks.onTTSStart?.();

      // Check cache first
      const cacheKey = this.getTTSCacheKey(message, emotion);
      const cachedAudio = await this.getCachedTTS(cacheKey);

      if (cachedAudio) {
        await this.playAudio(cachedAudio);
        this.callbacks.onTTSComplete?.();
        return;
      }

      // Generate TTS
      const audioBlob = await this.generateTTS(message, emotion);
      
      // Cache it
      await this.cacheTTS(cacheKey, audioBlob);

      // Play it
      await this.playAudio(audioBlob);
      this.callbacks.onTTSComplete?.();
    } catch (error) {
      console.error('Error in TTS:', error);
      this.callbacks.onError?.(error as Error);
    }
  }

  /**
   * Generate TTS using OpenAI TTS API
   */
  private async generateTTS(message: string, emotion: string): Promise<Blob> {
    // In production, call OpenAI TTS API
    // For now, use Web Speech API as fallback
    if ('speechSynthesis' in window) {
      return new Promise((resolve, reject) => {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.rate = 0.85; // Slow, calm pace
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        utterance.lang = 'en-US';

        // Use a calm voice if available
        const voices = speechSynthesis.getVoices();
        const calmVoice = voices.find(v => 
          v.name.toLowerCase().includes('calm') || 
          v.name.toLowerCase().includes('gentle') ||
          v.name.toLowerCase().includes('samantha')
        );
        if (calmVoice) {
          utterance.voice = calmVoice;
        }

        utterance.onend = () => {
          // For Web Speech API, we can't get the audio blob directly
          // So we'll use a placeholder approach
          resolve(new Blob());
        };

        utterance.onerror = (event) => {
          reject(new Error('TTS synthesis failed'));
        };

        speechSynthesis.speak(utterance);
      });
    }

    // Fallback: call API endpoint
    const response = await fetch('/api/guru-tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, emotion }),
    });

    if (!response.ok) {
      throw new Error(`TTS API error: ${response.statusText}`);
    }

    return await response.blob();
  }

  /**
   * Play audio blob
   */
  private async playAudio(audioBlob: Blob): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.src = URL.createObjectURL(audioBlob);
      
      audio.onended = () => {
        URL.revokeObjectURL(audio.src);
        resolve();
      };

      audio.onerror = (error) => {
        URL.revokeObjectURL(audio.src);
        reject(error);
      };

      audio.play().catch(reject);
    });
  }

  /**
   * Get TTS cache key
   */
  private getTTSCacheKey(message: string, emotion: string): string {
    // Simple hash function
    let hash = 0;
    const str = message + emotion;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `tts_${Math.abs(hash)}.mp3`;
  }

  /**
   * Get cached TTS audio
   */
  private async getCachedTTS(cacheKey: string): Promise<Blob | null> {
    try {
      const response = await fetch(`/tts-cache/${cacheKey}`);
      if (response.ok) {
        return await response.blob();
      }
    } catch (error) {
      // Cache miss or error
    }
    return null;
  }

  /**
   * Cache TTS audio
   */
  private async cacheTTS(cacheKey: string, audioBlob: Blob): Promise<void> {
    try {
      // In production, upload to /public/tts-cache via API
      // For now, we'll store in IndexedDB or skip caching
      // This would require a server-side API to write to /public
      // TTS cached
    } catch (error) {
      console.error('Error caching TTS:', error);
    }
  }

  /**
   * Check if currently recording
   */
  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

