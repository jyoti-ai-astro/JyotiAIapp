/**
 * Guru Chat Shell Component
 * 
 * Phase 3 — Section 29: PAGES PHASE 14 (F29)
 * Phase 3 — Section 30: PAGES PHASE 15 (F30)
 * 
 * Main chat interface with message stream and context panel
 */

'use client';

import React, { useEffect, useRef, useState, Fragment, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobalProgress } from '@/hooks/use-global-progress';
import { useMotionOrchestrator } from '@/components/providers/MotionProvider';
import { useSectionMotion } from '@/hooks/motion/useSectionMotion';
import { scrollParallaxY, scrollFadeIn, scrollDividerReveal } from '@/lib/motion/gsap-motion-bridge';
import { GuruChatEngine, ChatMessage } from '@/lib/guru/GuruChatEngine';
import { useGuruContext } from './GuruContextProvider';
import { Insight } from '@/lib/guru/insight-injector';
import { Remedy } from '@/lib/guru/remedy-engine';
import { VoiceEngine } from '@/lib/guru/voice-engine';
import { VisionResult } from '@/lib/guru/vision-engine';
import { VideoEngine, VideoFrameInsight } from '@/lib/guru/video-engine';
import { CompatibilityMonth } from '@/lib/guru/compatibility-timeline';
// Phase 30 - F45: Dynamic imports for heavy components
import dynamic from 'next/dynamic';
import { SecurityErrorBanner, SecurityErrorType } from './SecurityErrorBanner';
import { validateChatMessage, validateImageFileClient, validateAudioFileClient, handleVideoStreamError, retryUpload } from '@/lib/security/client-validation';
import { ErrorInlineMessage } from './ErrorInlineMessage';
import { FallbackGuruBubble } from './FallbackGuruBubble';
import { RetryMessageButton } from './RetryMessageButton';
import { ErrorToast } from '@/components/error-boundaries/ErrorToast';

// Phase 30 - F45: Lazy-load heavy components
const PastLifeCard = dynamic(() => import('./PastLifeCard').then(mod => ({ default: mod.PastLifeCard })), {
  loading: () => <div className="animate-pulse bg-white/5 rounded-lg h-32" />,
  ssr: false,
});

const PredictionTimeline = dynamic(() => import('./PredictionTimeline').then(mod => ({ default: mod.PredictionTimeline })), {
  loading: () => <div className="animate-pulse bg-white/5 rounded-lg h-48" />,
  ssr: false,
});

const CompatibilityPanel = dynamic(() => import('./CompatibilityPanel').then(mod => ({ default: mod.CompatibilityPanel })), {
  loading: () => <div className="animate-pulse bg-white/5 rounded-lg h-64" />,
  ssr: false,
});

const CompatibilityTimeline = dynamic(() => import('./CompatibilityTimeline').then(mod => ({ default: mod.CompatibilityTimeline })), {
  loading: () => <div className="animate-pulse bg-white/5 rounded-lg h-64" />,
  ssr: false,
});

export function GuruChatShell() {
  const { globalProgress } = useGlobalProgress();
  const { orchestrator } = useMotionOrchestrator();
  const { context } = useGuruContext();
  const shellRef = useRef<HTMLDivElement>(null);
  const messageStreamRef = useRef<HTMLDivElement>(null);
  const contextPanelRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Chat state
  const [messages, setMessages] = useState<Array<ChatMessage & { insights?: Insight[]; remedies?: Remedy[] }>>([
    {
      role: 'assistant',
      content: "Welcome! I'm your AI Spiritual Guide. I can help you understand your Kundali, Numerology, Aura, and more. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState('');
  const [currentInsights, setCurrentInsights] = useState<Insight[]>([]);
  const [currentRemedies, setCurrentRemedies] = useState<Remedy[]>([]);
  
  // Voice state (Phase 17 - F32)
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [waveformData, setWaveformData] = useState<number[]>(new Array(64).fill(0));
  const [microphoneAvailable, setMicrophoneAvailable] = useState<boolean | null>(null);
  
  // Vision state (Phase 18 - F33)
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [visionResults, setVisionResults] = useState<VisionResult[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Chat engine instance
  const chatEngineRef = useRef<GuruChatEngine | null>(null);
  const voiceEngineRef = useRef<VoiceEngine | null>(null);
  const waveformIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Video state (Phase 19 - F34)
  const videoEngineRef = useRef<VideoEngine | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoScanning, setIsVideoScanning] = useState(false);
  const [currentAura, setCurrentAura] = useState<string | null>(null);
  const [currentEmotion, setCurrentEmotion] = useState<string | null>(null);
  const [currentChakras, setCurrentChakras] = useState<{ [key: string]: number }>({});
  const [videoInsights, setVideoInsights] = useState<VideoFrameInsight[]>([]);
  const lastAutoMessageRef = useRef<number>(0);
  
  // Security error state (Phase 28 - F43)
  const [securityError, setSecurityError] = useState<{
    type: SecurityErrorType;
    message?: string;
    show: boolean;
  }>({
    type: 'generic',
    show: false,
  });
  
  // Initialize chat engine and voice engine
  useEffect(() => {
    if (!chatEngineRef.current) {
      chatEngineRef.current = new GuruChatEngine();
    }
    
    // Initialize voice engine (Phase 17 - F32)
    if (!voiceEngineRef.current) {
      voiceEngineRef.current = new VoiceEngine({
        onTranscript: (text, isFinal) => {
          setVoiceTranscript(text);
          if (isFinal) {
            setIsTranscribing(false);
          }
        },
        onRecordingStart: () => {
          setIsListening(true);
          // Scene integration: user speaking (Phase 17 - F32)
          orchestrator.emitSceneEvent('guru-listening', {});
          // Start waveform animation
          waveformIntervalRef.current = setInterval(() => {
            if (voiceEngineRef.current) {
              const data = voiceEngineRef.current.getWaveformData();
              setWaveformData(data);
            }
          }, 50);
        },
        onRecordingStop: () => {
          setIsListening(false);
          // Scene integration: stop listening (Phase 17 - F32)
          orchestrator.emitSceneEvent('guru-listening-end', {});
          if (waveformIntervalRef.current) {
            clearInterval(waveformIntervalRef.current);
            waveformIntervalRef.current = null;
          }
          setWaveformData(new Array(64).fill(0));
        },
        onTTSStart: () => {
          setIsSpeaking(true);
          // Scene integration: Guru speaking
          orchestrator.emitSceneEvent('guru-speaking', {});
        },
        onTTSComplete: () => {
          setIsSpeaking(false);
          orchestrator.emitSceneEvent('guru-speaking-end', {});
        },
        onError: (error) => {
          console.error('Voice engine error:', error);
          setIsListening(false);
          setIsTranscribing(false);
          setIsSpeaking(false);
        },
      });
      chatEngineRef.current.setVoiceEngine(voiceEngineRef.current);
    }
    
    // Check microphone availability
    if (microphoneAvailable === null) {
      voiceEngineRef.current.checkMicrophoneAvailable().then(setMicrophoneAvailable);
    }
    
    // Initialize video engine (Phase 19 - F34)
    if (!videoEngineRef.current) {
      videoEngineRef.current = new VideoEngine({
        onFrameInsight: (insight) => {
          setVideoInsights((prev) => [...prev.slice(-50), insight]); // Keep last 50 insights
          
          // Handle video insight in chat engine
          if (chatEngineRef.current) {
            chatEngineRef.current.handleVideoInsight(insight);
          }
          
          // Update current state
          if (insight.aura) {
            setCurrentAura(insight.aura.dominantColor);
            orchestrator.emitSceneEvent('video-aura', { color: insight.aura.dominantColor });
          }
          if (insight.emotion) {
            setCurrentEmotion(insight.emotion.primaryEmotion);
            orchestrator.emitSceneEvent('video-emotion', { 
              emotion: insight.emotion.primaryEmotion,
              intensity: insight.emotion.intensity,
            });
          }
          if (insight.chakras) {
            setCurrentChakras(insight.chakras);
            orchestrator.emitSceneEvent('video-chakra', { chakras: insight.chakras });
          }
          if (insight.gesture && insight.gesture.type !== 'none') {
            // Handle namaste gesture → trigger blessing wave
            if (insight.gesture.type === 'namaste') {
              orchestrator.triggerBlessingWave(1.0);
            }
            orchestrator.emitSceneEvent('video-gesture', { 
              gesture: insight.gesture.type,
              confidence: insight.gesture.confidence,
            });
          }

          // Auto-generate periodic Guru messages (every 10 seconds)
          const now = Date.now();
          if (now - lastAutoMessageRef.current > 10000 && chatEngineRef.current) {
            generateAutoMessage(insight);
            lastAutoMessageRef.current = now;
          }
        },
        onError: (error) => {
          console.error('Video engine error:', error);
          setIsVideoScanning(false);
        },
        onStreamStart: () => {
          setIsVideoScanning(true);
        },
        onStreamStop: () => {
          setIsVideoScanning(false);
        },
      });
    }
    
    // Attach context when available
    if (context) {
      chatEngineRef.current.attachContext(context);
    }

    // Cleanup
    return () => {
      if (waveformIntervalRef.current) {
        clearInterval(waveformIntervalRef.current);
      }
      voiceEngineRef.current?.cleanup();
      videoEngineRef.current?.stopVideoStream();
    };
  }, [context, orchestrator]);
  
  // Section motion tracking
  const sectionId = 'guru-chat';
  const { sectionRef, smoothedProgress } = useSectionMotion({
    sectionId,
    onEnter: () => {
      orchestrator.onSectionEnter(sectionId);
    },
    onExit: () => {
      orchestrator.onSectionExit(sectionId);
    },
    onProgress: (progress) => {
      orchestrator.scrollParallax(sectionId, progress);
      orchestrator.scrollReveal(sectionId, progress);
    },
  });
  
  // Sync refs
  useEffect(() => {
    if (shellRef.current) {
      (sectionRef as React.MutableRefObject<HTMLElement | null>).current = shellRef.current;
    }
  }, [shellRef, sectionRef]);
  
  // Trigger blessing wave on mount (Phase 13 - F28)
  useEffect(() => {
    orchestrator.triggerBlessingWave(0.4);
  }, [orchestrator]);
  
  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentStreamingMessage]);
  
  // Scroll-based animations
  useEffect(() => {
    if (!shellRef.current) return;
    
    const triggers: any[] = [];
    
    // Parallax for message stream
    if (messageStreamRef.current) {
      triggers.push(scrollParallaxY(messageStreamRef.current, 0.2, {
        start: 'top bottom',
        end: 'bottom top',
      }));
    }
    
    // Parallax for context panel
    if (contextPanelRef.current) {
      triggers.push(scrollParallaxY(contextPanelRef.current, 0.15, {
        start: 'top bottom',
        end: 'bottom top',
      }));
      
      // Parallax for context items
      const contextItems = contextPanelRef.current.querySelectorAll('[data-context-item]');
      contextItems.forEach((item, index) => {
        triggers.push(scrollParallaxY(item, 0.1 + index * 0.05, {
          start: 'top bottom',
          end: 'bottom top',
        }));
      });
    }
    
    // Fade in for sections
    const sections = shellRef.current.querySelectorAll('[data-chat-section]');
    sections.forEach((section) => {
      triggers.push(scrollFadeIn(section, {
        start: 'top bottom',
        end: 'center center',
      }));
    });
    
    // Divider reveal
    const dividers = shellRef.current.querySelectorAll('[data-chat-divider]');
    dividers.forEach((divider) => {
      triggers.push(scrollDividerReveal(divider));
    });
    
    return () => {
      triggers.forEach((trigger) => trigger.kill());
    };
  }, []);
  
  // Handle send message (Phase 28 - F43: With client-side validation)
  const handleSend = async () => {
    if (!inputValue.trim() || isStreaming || !chatEngineRef.current) return;
    
    // Phase 28 - F43: Validate message before sending
    const validation = validateChatMessage(inputValue.trim());
    if (!validation.valid) {
      setSecurityError({
        type: validation.error?.includes('suspicious') ? 'suspicious_activity' : 'validation_failure',
        message: validation.error,
        show: true,
      });
      setTimeout(() => setSecurityError(prev => ({ ...prev, show: false })), 5000);
      return;
    }
    
    const userMessage = validation.sanitized || inputValue.trim();
    setInputValue('');
    setIsStreaming(true);
    setCurrentStreamingMessage('');
    setSecurityError({ type: 'generic', show: false }); // Clear previous errors
    
    // Add user message to UI
    const userMsg: ChatMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    
    // Trigger blessing wave on user message (Phase 13 - F28)
    orchestrator.triggerBlessingWave(0.4);

    // Scene integration: Detect emotional state and trigger mandala pulse (Phase 16 - F31)
    const lowerMessage = userMessage.toLowerCase();
    if (lowerMessage.includes('worried') || lowerMessage.includes('anxious') || lowerMessage.includes('stress') || 
        lowerMessage.includes('sad') || lowerMessage.includes('frustrated')) {
      orchestrator.emitSceneEvent('guru-emotion', { type: 'concerned' });
    } else if (lowerMessage.includes('happy') || lowerMessage.includes('grateful') || lowerMessage.includes('thank')) {
      orchestrator.emitSceneEvent('guru-emotion', { type: 'grateful' });
    }
    
    try {
      // Stream response (Phase 27 - F42: Optimized with batched updates)
      let streamingBuffer = '';
      let lastUpdateTime = Date.now();
      const UPDATE_INTERVAL = 16; // ~60fps updates
      
      await chatEngineRef.current.streamResponse(
        userMessage,
        (chunk) => {
          if (chunk.done) {
            // Flush remaining buffer
            if (streamingBuffer) {
              setCurrentStreamingMessage((prev) => prev + streamingBuffer);
              streamingBuffer = '';
            }
            setIsStreaming(false);
            setCurrentStreamingMessage('');
            
            // Trigger blessing wave on Guru reply (Phase 13 - F28)
            orchestrator.triggerBlessingWave(0.2);
          } else {
            streamingBuffer += chunk.content;
            
            // Phase 27 - F42: Batch updates to reduce re-renders
            const now = Date.now();
            if (now - lastUpdateTime >= UPDATE_INTERVAL) {
              setCurrentStreamingMessage((prev) => prev + streamingBuffer);
              streamingBuffer = '';
              lastUpdateTime = now;
            }
          }
        }
      );
      
      // Get enhancements (insights and remedies)
      const { insights, remedies } = chatEngineRef.current.getLastMessageEnhancements();
      setCurrentInsights(insights);
      setCurrentRemedies(remedies);

      // Get orchestrated output for badges (Phase 25 - F40)
      const orchestratedOutput = chatEngineRef.current.getLastOrchestratedOutput();
      if (orchestratedOutput) {
        // Emit orchestrator events
        if (orchestratedOutput.insights.length > 0) {
          orchestrator.emitSceneEvent('orchestrator-insight', { count: orchestratedOutput.insights.length });
        }
        if (orchestratedOutput.remedies.length > 0) {
          orchestrator.emitSceneEvent('orchestrator-remedy', { count: orchestratedOutput.remedies.length });
        }
      }

      // Add final assistant message with enhancements
      const assistantMsg = chatEngineRef.current.getMessageHistory().slice(-1)[0];
      if (assistantMsg && assistantMsg.role === 'assistant') {
        setMessages((prev) => [...prev, {
          ...assistantMsg,
          insights,
          remedies,
        }]);

        // Scene integration: deep insight → starfield focus
        if (insights.length > 0) {
          orchestrator.emitSceneEvent('guru-insight', { count: insights.length });
        }

        // Scene integration: remedy → nebula hue shift
        if (remedies.length > 0) {
          orchestrator.emitSceneEvent('guru-remedy', { count: remedies.length });
        }

        // Scene integration: past life and karmic (Phase 20 - F35)
        const pastLifeResult = chatEngineRef.current.getPastLifeResult();
        if (pastLifeResult) {
          orchestrator.emitSceneEvent('guru-pastlife', { role: pastLifeResult.pastLifeRole });
          
          if (pastLifeResult.karmicDebts.length > 0 || pastLifeResult.unresolvedLessons.length > 0) {
            orchestrator.emitSceneEvent('guru-karmic', { 
              debts: pastLifeResult.karmicDebts.length,
              lessons: pastLifeResult.unresolvedLessons.length,
            });
          }
        }

        // Scene integration: synergy score (Phase 20 - F35)
        const synergyScore = chatEngineRef.current.getSynergyScore();
        orchestrator.emitSceneEvent('guru-synergy', { score: synergyScore });

        // Scene integration: predictions (Phase 21 - F36)
        const timeline = chatEngineRef.current.getPredictions();
        if (timeline && chatEngineRef.current.shouldInjectPrediction(userMessage)) {
          const nextMonth = timeline[0];
          if (nextMonth) {
            if (nextMonth.colorCode === 'gold') {
              orchestrator.emitSceneEvent('guru-prediction', { energy: nextMonth.overallEnergy });
            } else if (nextMonth.colorCode === 'red') {
              orchestrator.emitSceneEvent('guru-caution', { energy: nextMonth.overallEnergy });
            }
            
            // Check for blessings
            const hasBlessings = nextMonth.predictions.some(p => p.blessings && p.blessings.length > 0);
            if (hasBlessings) {
              orchestrator.emitSceneEvent('guru-blessing', {});
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setIsStreaming(false);
      setCurrentStreamingMessage('');
      
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I apologize, but I encountered an error. Please try again.',
          timestamp: new Date(),
        },
      ]);
    }
  };
  
  // Handle image upload (Phase 18 - F33)
  const handleImageUpload = async (file: File) => {
    // Phase 28 - F43: Validate image before upload
    const validation = await validateImageFileClient(file);
    if (!validation.valid) {
      setSecurityError({
        type: 'file_error',
        message: validation.error,
        show: true,
      });
      setTimeout(() => setSecurityError(prev => ({ ...prev, show: false })), 5000);
      return;
    }

    setUploadedImage(file);
    setIsAnalyzingImage(true);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      // Phase 28 - F43: Retry logic for upload
      const formData = new FormData();
      formData.append('file', file);

      const response = await retryUpload(
        () => fetch('/api/guru-vision', {
          method: 'POST',
          body: formData,
        }),
        3,
        1000
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Vision analysis failed');
      }

      const data = await response.json();
      const results: VisionResult[] = data.results || [];

      setVisionResults(results);

      // Scene integration based on vision type
      results.forEach(result => {
        switch (result.type) {
          case 'palm':
            orchestrator.emitSceneEvent('vision-palmistry', {});
            break;
          case 'aura':
            orchestrator.emitSceneEvent('vision-aura', { color: (result.data as any).dominantColor });
            break;
          case 'emotion':
            orchestrator.emitSceneEvent('vision-emotion', { emotion: (result.data as any).primaryEmotion });
            break;
          case 'kundali':
            orchestrator.emitSceneEvent('vision-kundali', {});
            break;
          case 'document':
            orchestrator.emitSceneEvent('vision-document', {});
            break;
        }
      });

      // Auto-send Guru insights
      if (chatEngineRef.current) {
        const message = await chatEngineRef.current.handleImageMessage(file, (results) => {
          setVisionResults(results);
        });

        // Add assistant message with vision insights
        setMessages((prev) => [...prev, {
          role: 'assistant',
          content: message,
          timestamp: new Date(),
          insights: results.map(r => ({
            type: r.type === 'palm' ? 'kundali' : r.type === 'aura' ? 'aura' : 'kundali',
            title: `${r.type.charAt(0).toUpperCase() + r.type.slice(1)} Insight`,
            content: getVisionReading(r),
          })),
        }]);
      }

      setIsAnalyzingImage(false);
    } catch (error: any) {
      setIsAnalyzingImage(false);
      setSecurityError({
        type: 'file_error',
        message: error?.message || 'Failed to analyze image. Please try again.',
        show: true,
      });
      setTimeout(() => setSecurityError(prev => ({ ...prev, show: false })), 5000);
    }
  };

  // Get vision reading text
  const getVisionReading = (result: VisionResult): string => {
    if (result.type === 'palm' && 'overall' in result.data) {
      return result.data.overall.reading;
    } else if (result.type === 'aura' && 'auraReading' in result.data) {
      return result.data.auraReading;
    } else if (result.type === 'emotion' && 'reading' in result.data) {
      return result.data.reading;
    } else if (result.type === 'kundali' && 'reading' in result.data) {
      return result.data.reading;
    } else if (result.type === 'document' && 'reading' in result.data) {
      return result.data.reading;
    }
    return 'Vision analysis complete.';
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    }
  };

  // Handle camera capture (mobile)
  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
    }
  };

  // Handle video scan start (Phase 19 - F34, Phase 28 - F43, Phase 29 - F44: Enhanced failover)
  const handleStartVideoScan = async () => {
    if (!videoRef.current || !videoEngineRef.current) return;

    try {
      await videoEngineRef.current.setupVideoStream(videoRef.current);
      setIsVideoScanning(true);
    } catch (error: any) {
      const errorMessage = handleVideoStreamError(error);
      
      // Phase 29 - F44: Show cosmic UI for camera failure
      if (error.name === 'NotAllowedError' || error.name === 'NotFoundError') {
        setSecurityError({
          type: 'video_error',
          message: 'Camera not available. Please check your camera permissions and try again.',
          show: true,
        });
      } else {
        setSecurityError({
          type: 'video_error',
          message: errorMessage,
          show: true,
        });
      }
      
      setTimeout(() => setSecurityError(prev => ({ ...prev, show: false })), 5000);
      
      // Phase 29 - F44: Silent log + memory safety purge for vision/video
      console.warn('[Video Failover] Camera error:', error.name);
    }
  };

  // Handle video scan stop
  const handleStopVideoScan = () => {
    if (videoEngineRef.current) {
      videoEngineRef.current.stopVideoStream();
    }
  };

  // Generate auto message from video insight
  const generateAutoMessage = async (insight: VideoFrameInsight) => {
    if (!chatEngineRef.current) return;

    let message = '';

    if (insight.aura && insight.aura.energyLevel > 7) {
      message = `Your aura is stabilizing. The ${insight.aura.dominantColor} energy is flowing harmoniously.`;
    } else if (insight.chakras) {
      const strongestChakra = Object.entries(insight.chakras).reduce((a, b) =>
        a[1] > b[1] ? a : b
      );
      if (strongestChakra[1] > 7) {
        message = `Your ${strongestChakra[0]} Chakra shows strong activation. The energy is aligned.`;
      }
    } else if (insight.emotion && insight.emotion.intensity > 0.7) {
      message = `I sense ${insight.emotion.primaryEmotion} energy rising. Your spiritual alignment is clear.`;
    }

    if (message) {
      // Add message to chat
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: message,
        timestamp: new Date(),
      }]);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  // Format timestamp
  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  // Helper: Get aura color hex (Phase 19 - F34, Phase 26 - F41: Memoized)
  const getAuraColorHex = useCallback((color: string): string => {
    const colorMap: { [key: string]: string } = {
      'Red': '#FF0000',
      'Orange': '#FF8C00',
      'Yellow': '#FFD700',
      'Green': '#00FF00',
      'Blue': '#0000FF',
      'Indigo': '#4B0082',
      'Violet': '#8B00FF',
    };
    return colorMap[color] || '#8B00FF';
  }, []);

  // Helper: Get chakra color (Phase 19 - F34, Phase 26 - F41: Memoized)
  const getChakraColor = useCallback((chakra: string): string => {
    const colorMap: { [key: string]: string } = {
      'Root': '#FF0000',
      'Sacral': '#FF8C00',
      'Solar Plexus': '#FFD700',
      'Heart': '#00FF00',
      'Throat': '#0000FF',
      'Third Eye': '#4B0082',
      'Crown': '#8B00FF',
    };
    return colorMap[chakra] || '#FFFFFF';
  }, []);

  // Helper: Get emotion color (Phase 19 - F34, Phase 26 - F41: Memoized)
  const getEmotionColor = useCallback((emotion: string): string => {
    const colorMap: { [key: string]: string } = {
      'calm': '#4A90E2',
      'happy': '#FFD700',
      'focused': '#8B00FF',
      'neutral': '#FFFFFF',
      'sad': '#9370DB',
    };
    return colorMap[emotion] || '#FFFFFF';
  }, []);

  const recentMessagesStart = Math.max(0, messages.length - 40);
  const recentMessages = messages.slice(recentMessagesStart);
  const renderedMessages = recentMessages.map((message, index) => {
    const actualIndex = recentMessagesStart + index;
    return (
      <React.Fragment key={`msg-${actualIndex}`}>
        {/* Gold shimmer line between user and guru messages */}
        {message.role === 'user' &&
          actualIndex > 0 &&
          messages[actualIndex - 1]?.role === 'assistant' && (
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              className="relative w-full flex justify-center my-2"
            >
              <div className="w-32 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
            </motion.div>
          )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={`flex items-start gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}
        >
          {message.role === 'assistant' && (
            <motion.div
              className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0"
              animate={{
                boxShadow: [
                  '0 0 10px rgba(242, 201, 76, 0.3)',
                  '0 0 20px rgba(242, 201, 76, 0.5)',
                  '0 0 10px rgba(242, 201, 76, 0.3)',
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <span className="text-gold text-xl">✨</span>
            </motion.div>
          )}

          <div className={`flex-1 ${message.role === 'user' ? 'flex justify-end' : ''}`}>
            <motion.div
              className={`rounded-xl p-4 md:p-5 max-w-[85%] md:max-w-[80%] relative ${
                message.role === 'user'
                  ? 'bg-gold/10 border border-gold/30'
                  : 'bg-white/5 border border-white/10'
              }`}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.4,
                ease: [0.4, 0, 0.2, 1], // power2.out equivalent
              }}
              whileHover={{ scale: 1.02 }}
              style={{
                boxShadow:
                  message.role === 'user'
                    ? '0 8px 32px rgba(242, 201, 76, 0.25), 0 2px 8px rgba(242, 201, 76, 0.15)'
                    : '0 8px 32px rgba(255, 255, 255, 0.08), 0 2px 8px rgba(255, 255, 255, 0.04)',
              }}
            >
              <p className={message.role === 'user' ? 'text-gold' : 'text-white/80'}>
                {message.content}
              </p>

              {/* Orchestrated Badges (Phase 25 - F40, Phase 26 - F41: Polish) */}
              {message.role === 'assistant' && (
                <div className="flex flex-wrap gap-2 md:gap-3 mt-4">
                  {/* Unified Insight Badge */}
                  {message.insights && message.insights.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, y: 5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: 0.1,
                        ease: [0.4, 0, 0.2, 1],
                      }}
                      whileHover={{ scale: 1.05 }}
                      className="px-3 py-1.5 bg-gold/20 border border-gold/40 rounded-full text-xs md:text-sm text-gold backdrop-blur-sm shadow-[0_2px_8px_rgba(242,201,76,0.2)]"
                    >
                      ✨ Unified Insight
                    </motion.div>
                  )}

                  {/* Fusion Prediction Badge */}
                  {chatEngineRef.current?.getPredictions() && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, y: 5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: 0.15,
                        ease: [0.4, 0, 0.2, 1],
                      }}
                      whileHover={{ scale: 1.05 }}
                      className="px-3 py-1.5 bg-violet/20 border border-violet/40 rounded-full text-xs md:text-sm text-violet-300 backdrop-blur-sm shadow-[0_2px_8px_rgba(139,92,246,0.2)]"
                    >
                      🔮 Fusion Prediction
                    </motion.div>
                  )}

                  {/* Karmic Resonance Badge */}
                  {chatEngineRef.current?.getPastLifeResult() && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, y: 5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: 0.2,
                        ease: [0.4, 0, 0.2, 1],
                      }}
                      whileHover={{ scale: 1.05 }}
                      className="px-3 py-1.5 bg-amber/20 border border-amber/40 rounded-full text-xs md:text-sm text-amber-300 backdrop-blur-sm shadow-[0_2px_8px_rgba(255,193,7,0.2)]"
                    >
                      ⚡ Karmic Resonance
                    </motion.div>
                  )}

                  {/* Cosmic Synergy Badge */}
                  {chatEngineRef.current && chatEngineRef.current.getSynergyScore() >= 0.7 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, y: 5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: 0.25,
                        ease: [0.4, 0, 0.2, 1],
                      }}
                      whileHover={{ scale: 1.05 }}
                      className="px-3 py-1.5 bg-cyan/20 border border-cyan/40 rounded-full text-xs md:text-sm text-cyan-300 backdrop-blur-sm shadow-[0_2px_8px_rgba(6,182,212,0.2)]"
                    >
                      🌟 Cosmic Synergy
                    </motion.div>
                  )}
                </div>
              )}

              {/* Timestamp */}
              {message.timestamp && (
                <p
                  className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-gold/60' : 'text-white/40'
                  }`}
                >
                  {formatTimestamp(message.timestamp)}
                </p>
              )}
            </motion.div>
          </div>

          {message.role === 'user' && (
            <motion.div
              className="w-10 h-10 rounded-full bg-aura-blue/20 flex items-center justify-center flex-shrink-0"
              whileHover={{ scale: 1.1 }}
            >
              <span className="text-aura-blue text-xl">👤</span>
            </motion.div>
          )}
        </motion.div>
      </React.Fragment>
    );
  });

  return (
    <section
      ref={shellRef}
      id={sectionId}
      data-section-id={sectionId}
      className="relative py-32 px-4"
      style={{
        opacity: globalProgress,
      }}
    >
      {/* Section Divider */}
      <div className="max-w-7xl mx-auto mb-16">
        <div
          data-chat-divider
          className="relative h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent"
        />
      </div>
      
      {/* Main Chat Container */}
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ y: 0 }}
          style={{ opacity: globalProgress }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* Left Side: Message Stream */}
          <div
            ref={messageStreamRef}
            data-chat-section
            className="lg:col-span-2 space-y-6"
          >
            <div className="bg-cosmic/90 backdrop-blur-sm border border-white/10 rounded-2xl p-8 min-h-[600px] flex flex-col">
              <h2 className="text-2xl font-display font-bold text-white mb-6">
                Chat with Your AI Guru
              </h2>
              
              {/* Phase 28 - F43: Security Error Banner */}
              <SecurityErrorBanner
                error={securityError.type}
                message={securityError.message}
                show={securityError.show}
                onDismiss={() => setSecurityError(prev => ({ ...prev, show: false }))}
              />
              
              {/* Message Stream (Phase 27 - F42: Virtualized for 40+ messages) */}
              <div className="flex-1 space-y-4 overflow-y-auto max-h-[500px] pr-2">
                <AnimatePresence>
                  {/* Phase 27 - F42: Only render last 40 messages + current streaming for performance */}
                  {renderedMessages}
                  
                  {/* Streaming message */}
                  {isStreaming && currentStreamingMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-4"
                    >
                      <motion.div
                        className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0"
                        animate={{
                          boxShadow: [
                            '0 0 10px rgba(242, 201, 76, 0.3)',
                            '0 0 20px rgba(242, 201, 76, 0.5)',
                            '0 0 10px rgba(242, 201, 76, 0.3)',
                          ],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      >
                        <span className="text-gold text-xl">✨</span>
                      </motion.div>
                      <div className="flex-1">
                        <motion.div
                          className="bg-white/5 border border-white/10 rounded-lg p-4"
                          animate={{
                            boxShadow: [
                              '0 4px 20px rgba(242, 201, 76, 0.2)',
                              '0 4px 30px rgba(242, 201, 76, 0.4)',
                              '0 4px 20px rgba(242, 201, 76, 0.2)',
                            ],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        >
                          <p className="text-white/80">{currentStreamingMessage}</p>
                          <span className="inline-block w-2 h-4 bg-gold ml-1 animate-pulse" />
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Typing indicator */}
                  {isStreaming && !currentStreamingMessage && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-start gap-4"
                    >
                      <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-gold text-xl">✨</span>
                      </div>
                      <div className="flex-1">
                        <div className="bg-white/5 rounded-lg p-4">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div ref={messagesEndRef} />
              </div>
              
              {/* Image Preview and Vision Results (Phase 18 - F33) */}
              {imagePreview && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 space-y-3"
                >
                  {/* Image Preview */}
                  <div className="relative">
                    <motion.img
                      src={imagePreview}
                      alt="Uploaded image"
                      className="w-full max-w-md rounded-lg border-2 border-gold/30"
                      animate={{
                        boxShadow: [
                          '0 0 20px rgba(242, 201, 76, 0.3)',
                          '0 0 40px rgba(242, 201, 76, 0.5)',
                          '0 0 20px rgba(242, 201, 76, 0.3)',
                        ],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                    {/* Cosmic swirl animation overlay */}
                    {isAnalyzingImage && (
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center bg-cosmic/50 rounded-lg"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                      >
                        <div className="w-16 h-16 border-4 border-gold/50 border-t-gold rounded-full" />
                      </motion.div>
                    )}
                  </div>

                  {/* Vision Insight Cards */}
                  {visionResults.length > 0 && (
                    <div className="space-y-2">
                      {visionResults.map((result, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-gold/10 border border-gold/30 rounded-lg p-3"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-gold text-lg">
                              {result.type === 'palm' ? '✋' : result.type === 'aura' ? '🌈' : result.type === 'emotion' ? '😊' : result.type === 'kundali' ? '⭐' : '📄'}
                            </span>
                            <h4 className="text-sm font-heading text-gold">
                              {result.type.charAt(0).toUpperCase() + result.type.slice(1)} Analysis
                            </h4>
                            <span className="text-xs text-gold/60 ml-auto">
                              {Math.round(result.confidence * 100)}% confidence
                            </span>
                          </div>
                          <p className="text-white/70 text-sm">{getVisionReading(result)}</p>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* 3D Mandala Loader during camera init (Phase 19 - F34) */}
              {!isVideoScanning && !videoRef.current?.readyState && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 flex items-center justify-center h-64 bg-cosmic/50 rounded-lg border border-gold/20"
                >
                  <motion.div
                    className="w-24 h-24 border-4 border-gold/50 border-t-gold rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  />
                  <p className="ml-4 text-gold text-sm">Initializing camera...</p>
                </motion.div>
              )}

              {/* Video Scan Pane (Phase 19 - F34) */}
              {isVideoScanning && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 relative"
                >
                  <div className="relative rounded-xl overflow-hidden border-2 border-gold/30 shadow-[0_8px_32px_rgba(0,0,0,0.3),0_0_16px_rgba(242,201,76,0.2)]">
                    {/* Video Element */}
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full max-w-md h-auto"
                    />

                    {/* Divine Glow Overlay */}
                    <div className="absolute inset-0 pointer-events-none">
                      <motion.div
                        className="absolute inset-0"
                        style={{
                          background: 'radial-gradient(circle at center, rgba(242, 201, 76, 0.2) 0%, transparent 70%)',
                        }}
                        animate={{
                          opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      />
                    </div>

                    {/* Face Tracking Bounding Box */}
                    <motion.div
                      className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border-2 border-gold/60 pointer-events-none rounded-lg"
                      animate={{
                        boxShadow: [
                          '0 0 24px rgba(242, 201, 76, 0.6)',
                          '0 0 48px rgba(242, 201, 76, 0.8)',
                          '0 0 24px rgba(242, 201, 76, 0.6)',
                        ],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: [0.4, 0, 0.2, 1],
                      }}
                    />

                    {/* Aura Color Ring */}
                    {currentAura && (
                      <motion.div
                        className="absolute inset-0 pointer-events-none flex items-center justify-center"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ 
                          scale: [0.8, 1.0, 0.8],
                          opacity: [0.6, 1, 0.6]
                        }}
                        transition={{ 
                          duration: 2.5, 
                          repeat: Infinity,
                          ease: [0.4, 0, 0.2, 1]
                        }}
                      >
                        <div
                          className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4"
                          style={{
                            borderColor: getAuraColorHex(currentAura),
                            boxShadow: `0 0 40px ${getAuraColorHex(currentAura)}90, 0 0 80px ${getAuraColorHex(currentAura)}50`,
                          }}
                        />
                      </motion.div>
                    )}

                    {/* Chakra Waveform Bars */}
                    <div className="absolute bottom-4 left-4 right-4 flex gap-1.5 md:gap-2 justify-center items-end h-20">
                      {['Root', 'Sacral', 'Solar Plexus', 'Heart', 'Throat', 'Third Eye', 'Crown'].map((chakra) => (
                        <motion.div
                          key={chakra}
                          className="w-2.5 md:w-3 bg-gold rounded-t backdrop-blur-sm"
                          animate={{
                            height: `${Math.max(20, (currentChakras[chakra] || 5) * 8)}px`,
                          }}
                          transition={{ 
                            duration: 0.4,
                            ease: [0.4, 0, 0.2, 1]
                          }}
                          style={{
                            background: `linear-gradient(to top, ${getChakraColor(chakra)}, ${getChakraColor(chakra)}80)`,
                            boxShadow: `0 -2px 8px ${getChakraColor(chakra)}60`,
                          }}
                        />
                      ))}
                    </div>

                    {/* Emotional Pulse Meter */}
                    {currentEmotion && (
                      <div className="absolute top-4 right-4 bg-cosmic/80 backdrop-blur-sm rounded-lg p-2 border border-gold/30">
                        <div className="flex items-center gap-2">
                          <motion.div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getEmotionColor(currentEmotion) }}
                            animate={{
                              scale: [1, 1.5, 1],
                              opacity: [0.7, 1, 0.7],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                          <span className="text-xs text-white">{currentEmotion}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Stop Scan Button */}
                  <motion.button
                    onClick={handleStopVideoScan}
                    className="mt-4 w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 rounded-lg text-sm font-heading transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🛑 Stop Scan
                  </motion.button>
                </motion.div>
              )}

              {/* Live Insight Cards (Phase 19 - F34) */}
              {videoInsights.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 space-y-2 max-h-40 overflow-y-auto"
                >
                  {videoInsights.slice(-5).map((insight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-gold/5 border border-gold/20 rounded-lg p-2 text-xs"
                    >
                      {insight.aura && (
                        <p className="text-gold/80">Aura: {insight.aura.dominantColor} ({insight.aura.energyLevel}/10)</p>
                      )}
                      {insight.emotion && (
                        <p className="text-white/60">Emotion: {insight.emotion.primaryEmotion} ({Math.round(insight.emotion.intensity * 100)}%)</p>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Drag and Drop Zone (Phase 18 - F33) */}
              {!isVideoScanning && (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`mt-4 p-6 border-2 border-dashed rounded-lg transition-colors ${
                    isDragOver
                      ? 'border-gold/50 bg-gold/5'
                      : 'border-white/20 bg-cosmic/30'
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <p className="text-white/60 text-sm text-center">
                      Drag and drop an image here, or
                    </p>
                    <div className="flex gap-2 flex-wrap justify-center">
                      <motion.button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30 rounded-lg text-sm font-heading transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        📷 Upload Image
                      </motion.button>
                      <motion.button
                        onClick={handleCameraCapture}
                        className="px-4 py-2 bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30 rounded-lg text-sm font-heading transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        📸 Camera
                      </motion.button>
                      <motion.button
                        onClick={handleStartVideoScan}
                        disabled={isVideoScanning}
                        className="px-4 py-2 bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30 rounded-lg text-sm font-heading transition-colors disabled:opacity-50"
                        whileHover={{ scale: isVideoScanning ? 1 : 1.05 }}
                        whileTap={{ scale: isVideoScanning ? 1 : 0.95 }}
                      >
                        🎥 Start Video Scan
                      </motion.button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex gap-4 items-center">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask your spiritual question..."
                    className="flex-1 bg-cosmic/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-gold/50 transition-colors"
                    disabled={isStreaming || isAnalyzingImage}
                  />
                  <motion.button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isStreaming || isAnalyzingImage}
                    className="bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30 rounded-lg px-6 py-3 font-heading transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: isStreaming || isAnalyzingImage ? 1 : 1.05 }}
                    whileTap={{ scale: isStreaming || isAnalyzingImage ? 1 : 0.95 }}
                  >
                    {isStreaming ? 'Sending...' : isAnalyzingImage ? 'Analyzing...' : 'Send'}
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Side: Context Panel */}
          <div
            ref={contextPanelRef}
            data-chat-section
            className="space-y-6"
          >
            {/* Context Panel */}
            <div className="bg-cosmic/90 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-display font-bold text-white mb-4">
                Your Context
              </h3>
              
              {/* Kundali Summary */}
              <motion.div
                className="mb-6 pb-6 border-b border-white/10"
                data-context-item
              >
                <h4 className="text-sm font-heading text-gold mb-2">Kundali</h4>
                {context?.kundali ? (
                  <div className="space-y-1 text-white/60 text-sm">
                    <p>Rashi: {context.kundali.rashi}</p>
                    <p>Lagna: {context.kundali.lagna}</p>
                    <p>Nakshatra: {context.kundali.nakshatra}</p>
                  </div>
                ) : (
                  <p className="text-white/60 text-sm">Loading...</p>
                )}
              </motion.div>
              
              {/* Numerology Summary */}
              <motion.div
                className="mb-6 pb-6 border-b border-white/10"
                data-context-item
              >
                <h4 className="text-sm font-heading text-gold mb-2">Numerology</h4>
                {context?.numerology ? (
                  <div className="space-y-1 text-white/60 text-sm">
                    <p>Life Path: {context.numerology.lifePath}</p>
                    <p>Destiny: {context.numerology.destiny}</p>
                    <p>Personality: {context.numerology.personality}</p>
                  </div>
                ) : (
                  <p className="text-white/60 text-sm">Loading...</p>
                )}
              </motion.div>
              
              {/* Aura Summary */}
              <motion.div
                data-context-item
              >
                <h4 className="text-sm font-heading text-gold mb-2">Aura & Chakra</h4>
                {context?.aura ? (
                  <div className="space-y-1 text-white/60 text-sm">
                    <p>Dominant Color: {context.aura.dominantColor}</p>
                    {context.aura.chakraStrengths && (
                      <div className="mt-2">
                        {context.aura.chakraStrengths.slice(0, 3).map((chakra, i) => (
                          <p key={i}>{chakra.name}: {chakra.strength}/10</p>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-white/60 text-sm">Loading...</p>
                )}
              </motion.div>
            </div>
            
            {/* Past Life Panel (Phase 20 - F35) */}
            {(() => {
              const pastLifeResult = chatEngineRef.current?.getPastLifeResult();
              return pastLifeResult ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-cosmic/90 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
                >
                  <PastLifeCard
                    pastLifeResult={pastLifeResult}
                    onExpand={() => {
                      // Trigger scene event on expand
                      orchestrator.emitSceneEvent('guru-pastlife', { 
                        role: pastLifeResult.pastLifeRole,
                      });
                    }}
                  />
                </motion.div>
              ) : null;
            })()}
            
            {/* Quick Actions */}
            <div className="bg-cosmic/90 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-display font-bold text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <motion.button
                  className="w-full text-left px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/80 text-sm transition-colors"
                  whileHover={{ x: 4 }}
                >
                  View Full Kundali
                </motion.button>
                <motion.button
                  className="w-full text-left px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/80 text-sm transition-colors"
                  whileHover={{ x: 4 }}
                >
                  Numerology Report
                </motion.button>
                <motion.button
                  className="w-full text-left px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/80 text-sm transition-colors"
                  whileHover={{ x: 4 }}
                >
                  Aura Scan
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Full Prediction Timeline (Phase 21 - F36) */}
        {chatEngineRef.current?.getPredictions() && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-16 max-w-7xl mx-auto"
          >
            <PredictionTimeline
              timeline={chatEngineRef.current.getPredictions()!}
              onMonthClick={(month) => {
                // Trigger scene event on month click
                if (month.colorCode === 'gold') {
                  orchestrator.emitSceneEvent('guru-prediction', { energy: month.overallEnergy });
                } else if (month.colorCode === 'red') {
                  orchestrator.emitSceneEvent('guru-caution', { energy: month.overallEnergy });
                }
              }}
            />
          </motion.div>
        )}

        {/* Full Compatibility Timeline (Phase 22 - F37) */}
        {chatEngineRef.current?.getCompatibilityTimeline() && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-16 max-w-7xl mx-auto"
          >
            <CompatibilityTimeline
              timeline={chatEngineRef.current.getCompatibilityTimeline()!}
              onMonthClick={(month: CompatibilityMonth) => {
                // Scene events are emitted from CompatibilityTimeline component
              }}
            />
          </motion.div>
        )}
      </div>
    </section>
  );
}
