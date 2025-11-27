/**
 * Guru Chat Engine
 * 
 * Phase 3 — Section 30: PAGES PHASE 15 (F30)
 * Phase 3 — Section 31: PAGES PHASE 16 (F31)
 * 
 * Handles chat message sending, streaming, and context management
 */

import { GuruContext } from '@/lib/ai/guruPrompt';
import { GuruMemory } from './guru-memory';
import { injectAllInsights, Insight } from './insight-injector';
import { generateAllRemedies, Remedy } from './remedy-engine';
import { VoiceEngine } from './voice-engine';
import { VisionEngine, VisionResult } from './vision-engine';
import { VideoFrameInsight } from './video-engine';
import { KnowledgeGraph, UserGraph } from './knowledge-graph';
import { PastLifeEngine, PastLifeResult } from './past-life-engine';
import { PredictionEngine, Prediction, PredictionInputs } from './prediction-engine';
import { TimelineBuilder, TimelineMonth, TimelineSummary } from './timeline-builder';
import { CompatibilityEngine, CompatibilityInputs, CompatibilityReport, CompatibilityType } from './compatibility-engine';
import { CompatibilityTimelineBuilder, CompatibilityMonth, CompatibilityTimelineSummary } from './compatibility-timeline';
import { OrchestratorV2, UnifiedContext, OrchestratedSummary, OrchestratedOutput, IntentType } from './orchestrator-v2';
import { retryApiCall, getGracefulFallback, logApiError } from '@/lib/security/api-failover';
import { handleStreamFailure, triggerOrchestratorFailover } from '@/lib/security/streaming-failover';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface StreamChunk {
  content: string;
  done: boolean;
}

export interface EnhancedChatMessage extends ChatMessage {
  insights?: Insight[];
  remedies?: Remedy[];
}

export class GuruChatEngine {
  private messageHistory: ChatMessage[] = [];
  private context: GuruContext | null = null;
  private memory: GuruMemory;
  private voiceEngine: VoiceEngine | null = null;
  private visionEngine: VisionEngine | null = null;
  private knowledgeGraph: KnowledgeGraph;
  private pastLifeEngine: PastLifeEngine;
  private predictionEngine: PredictionEngine;
  private timelineBuilder: TimelineBuilder;
  private compatibilityEngine: CompatibilityEngine;
  private compatibilityTimelineBuilder: CompatibilityTimelineBuilder;
  private userGraph: UserGraph | null = null;
  private pastLifeResult: PastLifeResult | null = null;
  private synergyScore: number = 0.5;
  private timeline: TimelineMonth[] | null = null;
  private timelineSummary: TimelineSummary | null = null;
  private compatibilityReport: CompatibilityReport | null = null;
  private compatibilityTimeline: CompatibilityMonth[] | null = null;
  private compatibilityTimelineSummary: CompatibilityTimelineSummary | null = null;
  private isTyping: boolean = false;
  private isSpeaking: boolean = false;
  private orchestrator: OrchestratorV2; // Phase 25 - F40
  private lastOrchestratedOutput: OrchestratedOutput | null = null; // Phase 25 - F40

  constructor() {
    this.memory = new GuruMemory();
    this.visionEngine = new VisionEngine();
    this.knowledgeGraph = new KnowledgeGraph();
    this.pastLifeEngine = new PastLifeEngine();
    this.predictionEngine = new PredictionEngine();
    this.timelineBuilder = new TimelineBuilder();
    this.compatibilityEngine = new CompatibilityEngine();
    this.compatibilityTimelineBuilder = new CompatibilityTimelineBuilder();
    this.orchestrator = new OrchestratorV2(); // Phase 25 - F40
  }

  /**
   * Set voice engine instance
   */
  setVoiceEngine(voiceEngine: VoiceEngine): void {
    this.voiceEngine = voiceEngine;
  }

  /**
   * Get typing state
   */
  getIsTyping(): boolean {
    return this.isTyping;
  }

  /**
   * Get speaking state
   */
  getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  /**
   * Attach context (Kundali, Numerology, Aura)
   */
  attachContext(context: GuruContext): void {
    this.context = context;
  }

  /**
   * Get memory summary for AI context
   */
  getMemorySummary(): string {
    return this.memory.getMemorySummary();
  }

  /**
   * Get message history
   */
  getMessageHistory(): ChatMessage[] {
    return this.messageHistory;
  }

  /**
   * Add message to history
   */
  addMessage(message: ChatMessage): void {
    this.messageHistory.push({
      ...message,
      timestamp: message.timestamp || new Date(),
    });
  }

  /**
   * Clear message history
   */
  clearHistory(): void {
    this.messageHistory = [];
  }

  /**
   * Send message and get streaming response (Phase 25 - F40: Uses orchestrator)
   */
  async sendMessage(
    message: string,
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    if (!message || message.trim().length === 0) {
      throw new Error('Message cannot be empty');
    }

    // Add user message to history
    this.addMessage({
      role: 'user',
      content: message,
    });

    try {
      // Generate orchestrated output (Phase 25 - F40)
      const orchestratedOutput = await this.orchestrator.generateFinalGuruOutput(
        message,
        this.context || undefined
      );
      this.lastOrchestratedOutput = orchestratedOutput;

      // Generate orchestrated summary
      const orchestratedSummary = this.orchestrator.generateOrchestratedSummary(
        this.context || undefined,
        orchestratedOutput.insights,
        orchestratedOutput.remedies,
        orchestratedOutput.predictions || undefined,
        orchestratedOutput.compatibility || undefined,
        orchestratedOutput.pastLife || undefined
      );

      // Build unified context
      const unifiedContext = this.orchestrator.buildUnifiedContext(this.context || undefined);

      // Phase 29 - F44: API call with retry mechanism
      const response = await retryApiCall(
        async () => {
          const res = await fetch('/api/guru-chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message,
              context: this.context,
              messageHistory: this.messageHistory.slice(0, -1), // Exclude the message we just added
              memorySummary: this.memory.getMemorySummary(),
              pastLifeSummary: this.getPastLifeMemorySummary(),
              synergySummary: this.getSynergyScoreSummary(),
              predictionSummary: this.getPredictionMemorySummary(),
              compatibilitySummary: this.getCompatibilityMemorySummary(),
              reportSummary: this.getReportSummary(),
              unifiedContext, // Phase 25 - F40
              orchestratedSummary, // Phase 25 - F40
              intent: orchestratedOutput.intent, // Phase 25 - F40
            }),
          });

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || `API error: ${res.statusText}`);
          }

          return res;
        },
        { maxRetries: 3, retryDelay: 1000, timeout: 30000 }
      ).catch((error) => {
        // Phase 29 - F44: Log error and get graceful fallback
        logApiError('/api/guru-chat', error);
        const fallback = getGracefulFallback('/api/guru-chat', error);
        throw new Error(fallback.message);
      });

      // Phase 29 - F44: Stream with failover
      let fullResponse = '';
      let streamFailed = false;

      try {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let lastChunkTime = Date.now();

        if (!reader) {
          throw new Error('No response stream available');
        }

        // Phase 27 - F42: Batch chunks to reduce DOM updates
        const CHUNK_BATCH_SIZE = 5; // Process every 5 characters
        const CHUNK_DELAY_MS = 16; // ~60fps

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            // Flush remaining buffer
            if (buffer && onChunk) {
              onChunk(buffer); // Phase 29 - F44: sendMessage expects string, not StreamChunk
              fullResponse += buffer;
              buffer = '';
            }
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;
          fullResponse += chunk;

          // Phase 27 - F42: Batch updates to reduce DOM re-renders
          const now = Date.now();
          if (buffer.length >= CHUNK_BATCH_SIZE || (now - lastChunkTime) >= CHUNK_DELAY_MS) {
            if (onChunk && buffer) {
              onChunk(buffer); // Phase 29 - F44: sendMessage expects string, not StreamChunk
              buffer = '';
              lastChunkTime = now;
            }
          }
        }
      } catch (streamError) {
        // Phase 29 - F44: Stream failure - simple fallback for sendMessage (string callback)
        streamFailed = true;
        console.warn('[GuruChatEngine] Stream error, using fallback:', streamError);

        // Phase 29 - F44: For sendMessage, use simple string fallback
        const fallback = 'Beloved one, cosmic signals were interrupted. The Guru is reconnecting. Here is a brief response: The cosmic energies are aligning in your favor. Trust the journey and remain open to divine guidance.';
        fullResponse = fallback;
        if (onChunk) {
          onChunk(fallback); // sendMessage expects string
        }
        if (this.orchestrator) {
          triggerOrchestratorFailover(this.orchestrator);
        }
      }

      // Use orchestrated insights and remedies (Phase 25 - F40)
      const insights = orchestratedOutput.insights;
      const remedies = orchestratedOutput.remedies;

      // Inject insights into response if not already done by orchestrator
      const { response: enhancedResponse } = injectAllInsights(fullResponse, this.context || undefined);

      // Add assistant response to history
      this.addMessage({
        role: 'assistant',
        content: enhancedResponse,
      });

      // Return enhanced response with metadata
      return enhancedResponse;
    } catch (error) {
      console.error('Guru chat error:', error);
      throw error;
    }
  }

  /**
   * Stream response (alternative method for more control)
   */
  async streamResponse(
    message: string,
    onChunk: (chunk: StreamChunk) => void
  ): Promise<void> {
    if (!message || message.trim().length === 0) {
      throw new Error('Message cannot be empty');
    }

    // Remember user message in memory
    this.memory.remember(message);

    // Add user message to history
    this.addMessage({
      role: 'user',
      content: message,
    });

    try {
      // Generate orchestrated output (Phase 25 - F40)
      const orchestratedOutput = await this.orchestrator.generateFinalGuruOutput(
        message,
        this.context || undefined
      );
      this.lastOrchestratedOutput = orchestratedOutput;

      // Generate orchestrated summary
      const orchestratedSummary = this.orchestrator.generateOrchestratedSummary(
        this.context || undefined,
        orchestratedOutput.insights,
        orchestratedOutput.remedies,
        orchestratedOutput.predictions || undefined,
        orchestratedOutput.compatibility || undefined,
        orchestratedOutput.pastLife || undefined
      );

      // Build unified context
      const unifiedContext = this.orchestrator.buildUnifiedContext(this.context || undefined);

      const response = await fetch('/api/guru-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          context: this.context,
          messageHistory: this.messageHistory.slice(0, -1),
          memorySummary: this.memory.getMemorySummary(),
          pastLifeSummary: this.getPastLifeMemorySummary(),
          synergySummary: this.getSynergyScoreSummary(),
          predictionSummary: this.getPredictionMemorySummary(),
          compatibilitySummary: this.getCompatibilityMemorySummary(),
          reportSummary: this.getReportSummary(),
          unifiedContext, // Phase 25 - F40
          orchestratedSummary, // Phase 25 - F40
          intent: orchestratedOutput.intent, // Phase 25 - F40
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      let buffer = '';
      let lastChunkTime = Date.now();

      if (!reader) {
        throw new Error('No response stream available');
      }

      // Phase 27 - F42: Batch chunks to reduce DOM updates
      const CHUNK_BATCH_SIZE = 5;
      const CHUNK_DELAY_MS = 16; // ~60fps

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          // Flush remaining buffer
          if (buffer) {
            onChunk({ content: buffer, done: false });
            fullResponse += buffer;
            buffer = '';
          }
          onChunk({ content: '', done: true });
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        fullResponse += chunk;

        // Phase 27 - F42: Batch updates to reduce DOM re-renders
        const now = Date.now();
        if (buffer.length >= CHUNK_BATCH_SIZE || (now - lastChunkTime) >= CHUNK_DELAY_MS) {
          if (buffer) {
            onChunk({ content: buffer, done: false });
            buffer = '';
            lastChunkTime = now;
          }
        }
      }

      // Compute synergy and detect karmic patterns (Phase 20 - F35)
      if (this.context) {
        this.handleKnowledgeGraph(this.context);
        this.handlePastLifeAnalysis(this.context);
      }

      // Auto-inject predictions if relevant (Phase 21 - F36)
      const predictionText = this.autoInjectPredictions(message);
      if (predictionText) {
        fullResponse += predictionText;
      }

      // Use orchestrated insights and remedies (Phase 25 - F40)
      const insights = orchestratedOutput.insights;
      const remedies = orchestratedOutput.remedies;

      // Inject insights into response if not already done by orchestrator
      const { response: enhancedResponse } = injectAllInsights(fullResponse, this.context || undefined);
      
      // Inject past life insights if available (Phase 20 - F35)
      if (this.pastLifeResult && this.pastLifeResult.unresolvedLessons.length > 0) {
        // Add karmic remedy suggestions
        const karmicRemedies: Remedy[] = this.pastLifeResult.unresolvedLessons.slice(0, 2).map(lesson => ({
          type: 'mantra', // Use existing type
          title: 'Karmic Lesson',
          description: lesson,
          instruction: 'Meditate on this lesson daily',
        }));
        remedies.push(...karmicRemedies);
      }

      // Add assistant response to history
      this.addMessage({
        role: 'assistant',
        content: enhancedResponse,
      });

      // Note: insights and remedies are available but not stored in message history
      // They should be handled by the UI component
    } catch (error) {
      console.error('Guru chat streaming error:', error);
      throw error;
    }
  }

  /**
   * Get insights and remedies for last message
   */
  getLastMessageEnhancements(): { insights: Insight[]; remedies: Remedy[] } {
    const lastMessage = this.messageHistory[this.messageHistory.length - 1];
    if (!lastMessage || lastMessage.role !== 'assistant') {
      return { insights: [], remedies: [] };
    }

    const { insights } = injectAllInsights(lastMessage.content, this.context || undefined);
    const remedies = generateAllRemedies(this.context || undefined);

    return { insights, remedies };
  }

  /**
   * Clear memory (for new session)
   */
  clearMemory(): void {
    this.memory.clear();
  }

  /**
   * Handle image message (Phase 18 - F33)
   * Analyzes image and sends enriched message to Guru
   */
  async handleImageMessage(
    file: File,
    onVisionResults?: (results: VisionResult[]) => void
  ): Promise<string> {
    try {
      if (!this.visionEngine) {
        throw new Error('Vision engine not initialized');
      }

      // Analyze image
      const visionResults = await this.visionEngine.analyzeImage(file);

      // Add vision findings to memory
      visionResults.forEach(result => {
        if (result.type === 'aura' && 'dominantColor' in result.data) {
          this.memory.remember(`Aura color detected: ${result.data.dominantColor}`);
          this.memory.addVisionFinding('aura', result.data);
        }
        if (result.type === 'palm' && 'overall' in result.data) {
          this.memory.remember(`Palm reading: ${result.data.overall.handType} hand type`);
          this.memory.addVisionFinding('palm', result.data);
        }
        if (result.type === 'emotion' && 'primaryEmotion' in result.data) {
          this.memory.remember(`Emotional state: ${result.data.primaryEmotion}`);
          this.memory.addVisionFinding('emotion', result.data);
        }
        if (result.type === 'kundali' && 'extractedText' in result.data) {
          this.memory.remember(`Kundali data extracted: ${result.data.extractedText}`);
          this.memory.addVisionFinding('kundali', result.data);
        }
      });

      // Build enriched prompt from vision results
      const visionContext = this.buildVisionContext(visionResults);

      // Update context with vision data
      if (visionContext.aura) {
        this.context = { ...this.context, aura: visionContext.aura };
      }
      if (visionContext.kundali) {
        this.context = { ...this.context, kundali: { ...this.context?.kundali, ...visionContext.kundali } };
      }
      if (visionContext.numerology) {
        this.context = { ...this.context, numerology: visionContext.numerology };
      }

      // Create message from vision insights
      const message = this.createMessageFromVision(visionResults);

      // Call onVisionResults callback
      if (onVisionResults) {
        onVisionResults(visionResults);
      }

      // Send message with enriched context
      this.isTyping = true;
      let fullResponse = '';

      await this.streamResponse(
        message,
        (chunk) => {
          if (chunk.done) {
            this.isTyping = false;
          } else {
            fullResponse += chunk.content;
          }
        }
      );

      // Get enhancements
      const { insights, remedies } = this.getLastMessageEnhancements();

      return fullResponse;
    } catch (error) {
      this.isTyping = false;
      console.error('Image message error:', error);
      throw error;
    }
  }

  /**
   * Handle video insight (Phase 19 - F34)
   * Processes real-time video frame insights
   */
  handleVideoInsight(insight: VideoFrameInsight): void {
    // Add to memory
    if (insight.aura) {
      this.memory.remember(`Live aura: ${insight.aura.dominantColor} (${insight.aura.energyLevel}/10)`);
      this.memory.trackAuraTrend(insight.aura.dominantColor);
    }
    if (insight.emotion) {
      this.memory.remember(`Live emotion: ${insight.emotion.primaryEmotion} (${Math.round(insight.emotion.intensity * 100)}%)`);
      this.memory.trackEmotionalCurve(insight.emotion.primaryEmotion, insight.emotion.intensity);
    }
    if (insight.chakras) {
      const strongestChakra = Object.entries(insight.chakras).reduce((a, b) =>
        a[1] > b[1] ? a : b
      );
      this.memory.remember(`Live chakra: ${strongestChakra[0]} (${strongestChakra[1]}/10)`);
    }
    if (insight.gesture && insight.gesture.type !== 'none') {
      this.memory.remember(`Gesture detected: ${insight.gesture.type}`);
      this.memory.trackGestureFrequency(insight.gesture.type);
    }

    // Update context with live data
    if (insight.aura) {
      this.context = {
        ...this.context,
        aura: {
          ...this.context?.aura,
          dominantColor: insight.aura.dominantColor,
        },
      };
    }
  }

  /**
   * Get video insight summary for memory
   */
  getVideoInsightSummary(): string {
    const memory = this.memory.getMemory();
    if (!memory.visionFindings) {
      return '';
    }

    const summary: string[] = [];
    if (memory.visionFindings.auraColor) {
      summary.push(`Aura: ${memory.visionFindings.auraColor}`);
    }
    if (memory.visionFindings.emotionalSignature) {
      summary.push(`Emotion: ${memory.visionFindings.emotionalSignature}`);
    }

    return summary.length > 0 ? `Live insights: ${summary.join(', ')}` : '';
  }

  /**
   * Build context from vision results
   */
  private buildVisionContext(results: VisionResult[]): Partial<GuruContext> {
    const context: Partial<GuruContext> = {};

    results.forEach(result => {
      if (result.type === 'aura' && 'dominantColor' in result.data) {
        context.aura = {
          dominantColor: result.data.dominantColor,
          chakraStrengths: result.data.chakraStrengths,
        };
      }
      if (result.type === 'kundali' && 'planets' in result.data) {
        context.kundali = {
          majorPlanets: result.data.planets,
        };
      }
      if (result.type === 'document' && 'numerology' in result.data) {
        context.numerology = result.data.numerology;
      }
    });

    return context;
  }

  /**
   * Create message from vision results
   */
  private createMessageFromVision(results: VisionResult[]): string {
    const messages: string[] = [];

    results.forEach(result => {
      if (result.type === 'palm' && 'overall' in result.data) {
        messages.push(`I've analyzed my palm. ${result.data.overall.reading}`);
      } else if (result.type === 'aura' && 'auraReading' in result.data) {
        messages.push(`I've analyzed my aura. ${result.data.auraReading}`);
      } else if (result.type === 'emotion' && 'reading' in result.data) {
        messages.push(`I've analyzed my emotional state. ${result.data.reading}`);
      } else if (result.type === 'kundali' && 'reading' in result.data) {
        messages.push(`I've shared my birth chart. ${result.data.reading}`);
      } else if (result.type === 'document' && 'reading' in result.data) {
        messages.push(`I've shared a document. ${result.data.reading}`);
      }
    });

    return messages.join(' ');
  }

  /**
   * Send voice message (Phase 17 - F32)
   * Converts audio blob to text, then processes as normal message
   */
  async sendVoiceMessage(
    audioBlob: Blob,
    onTranscript?: (text: string, isFinal: boolean) => void,
    onTTSStart?: () => void,
    onTTSComplete?: () => void
  ): Promise<string> {
    try {
      this.isTyping = true;

      // Convert audio to text using voice engine
      if (!this.voiceEngine) {
        throw new Error('Voice engine not initialized');
      }

      // Transcribe audio
      const transcript = await this.voiceEngine.streamToWhisper(audioBlob);
      
      if (onTranscript) {
        onTranscript(transcript, true);
      }

      // Process as normal text message
      let fullResponse = '';
      await this.streamResponse(
        transcript,
        (chunk) => {
          if (chunk.done) {
            this.isTyping = false;
          } else {
            fullResponse += chunk.content;
          }
        }
      );

      // Get enhancements
      const { insights, remedies } = this.getLastMessageEnhancements();

      // Trigger TTS playback
      if (this.voiceEngine && fullResponse) {
        this.isSpeaking = true;
        if (onTTSStart) {
          onTTSStart();
        }

        await this.voiceEngine.speakGuruMessage(fullResponse, 'divine');

        this.isSpeaking = false;
        if (onTTSComplete) {
          onTTSComplete();
        }
      }

      return fullResponse;
    } catch (error) {
      this.isTyping = false;
      this.isSpeaking = false;
      console.error('Voice message error:', error);
      throw error;
    }
  }

  /**
   * Handle knowledge graph (Phase 20 - F35)
   */
  handleKnowledgeGraph(context: GuruContext): void {
    this.userGraph = this.knowledgeGraph.buildUserGraph({
      kundali: context.kundali,
      numerology: context.numerology,
      aura: context.aura,
    });
    this.synergyScore = this.userGraph.synergyScore;
  }

  /**
   * Handle past life analysis (Phase 20 - F35)
   */
  handlePastLifeAnalysis(context: GuruContext): void {
    this.pastLifeResult = this.pastLifeEngine.analyzePastLife({
      kundali: context.kundali,
      numerology: context.numerology,
      aura: context.aura,
    });
  }

  /**
   * Get past life result
   */
  getPastLifeResult(): PastLifeResult | null {
    return this.pastLifeResult;
  }

  /**
   * Get synergy score
   */
  getSynergyScore(): number {
    return this.synergyScore;
  }

  /**
   * Get past life memory summary
   */
  getPastLifeMemorySummary(): string {
    if (!this.pastLifeResult) {
      return '';
    }

    const summary: string[] = [];
    summary.push(`Past Life Role: ${this.pastLifeResult.pastLifeRole}`);
    
    if (this.pastLifeResult.unresolvedLessons.length > 0) {
      summary.push(`Lessons: ${this.pastLifeResult.unresolvedLessons.slice(0, 2).join(', ')}`);
    }
    
    if (this.pastLifeResult.karmicDebts.length > 0) {
      summary.push(`Karmic Debts: ${this.pastLifeResult.karmicDebts.slice(0, 1).join(', ')}`);
    }

    return summary.join(' | ');
  }

  /**
   * Get synergy score summary
   */
  getSynergyScoreSummary(): string {
    const score = this.synergyScore;
    if (score >= 0.8) {
      return 'High Synergy: All aspects of your spiritual profile are in harmony.';
    } else if (score >= 0.6) {
      return 'Moderate Synergy: Most aspects align, with some areas for growth.';
    } else {
      return 'Building Synergy: Your spiritual journey is evolving.';
    }
  }

  /**
   * Build prediction timeline (Phase 21 - F36)
   */
  buildPredictionTimeline(context: GuruContext): void {
    const inputs: PredictionInputs = {
      kundali: {
        dashaPeriod: this.getDashaPeriod(context),
        nakshatra: context.kundali?.nakshatra,
        majorPlanets: context.kundali?.majorPlanets,
      },
      numerology: {
        yearCycle: this.getYearCycle(context),
        lifePath: context.numerology?.lifePath,
      },
      aura: {
        dominantColor: context.aura?.dominantColor,
        energyTrend: this.getAuraTrend(),
      },
      emotion: {
        primaryEmotion: this.getEmotionTrend(),
        trend: this.getEmotionTrendDirection(),
      },
      pastLife: {
        karmicPatterns: this.pastLifeResult?.karmicPatterns,
        unresolvedLessons: this.pastLifeResult?.unresolvedLessons,
      },
      synergyScore: this.synergyScore,
    };

    this.timeline = this.timelineBuilder.buildTimeline(inputs);
    this.timelineSummary = this.timelineBuilder.generateSummary(this.timeline);
  }

  /**
   * Get predictions (Phase 21 - F36)
   */
  getPredictions(): TimelineMonth[] | null {
    return this.timeline;
  }

  /**
   * Get timeline summary
   */
  getTimelineSummary(): TimelineSummary | null {
    return this.timelineSummary;
  }

  /**
   * Get prediction memory summary
   */
  getPredictionMemorySummary(): string {
    if (!this.timelineSummary) {
      return '';
    }

    const summary: string[] = [];
    summary.push(`Next 30 Days: ${this.timelineSummary.next30Days.summary}`);
    summary.push(`Next 90 Days: ${this.timelineSummary.next90Days.summary}`);
    summary.push(`Year Cycle: ${this.timelineSummary.yearCycle.summary}`);

    return summary.join(' | ');
  }

  /**
   * Check if message contains prediction-relevant keywords (Phase 21 - F36)
   */
  public shouldInjectPrediction(message: string): boolean {
    const keywords = [
      'future', 'prediction', 'forecast', 'what will happen',
      'next month', 'coming months', 'this year', 'timeline',
      'career', 'money', 'love', 'health', 'spiritual growth',
    ];

    const lowerMessage = message.toLowerCase();
    return keywords.some(keyword => lowerMessage.includes(keyword));
  }

  /**
   * Auto-inject monthly predictions when relevant (Phase 21 - F36)
   */
  autoInjectPredictions(message: string): string {
    if (!this.shouldInjectPrediction(message) || !this.timeline) {
      return '';
    }

    // Get next 3 months summary
    const next3Months = this.timeline.slice(0, 3);
    const predictions: string[] = [];

    next3Months.forEach(month => {
      const topPrediction = month.predictions
        .sort((a, b) => b.probability - a.probability)[0];
      
      if (topPrediction && topPrediction.probability >= 0.5) {
        predictions.push(
          `${month.monthName}: ${topPrediction.prediction} (${Math.round(topPrediction.probability * 100)}% potential)`
        );
      }
    });

    if (predictions.length > 0) {
      return `\n\nCosmic Timeline Insights:\n${predictions.join('\n')}\n\nRemember: These are probability-based insights, not guarantees. Trust your free will and divine timing.`;
    }

    return '';
  }

  /**
   * Helper: Get Dasha period (simplified)
   */
  private getDashaPeriod(context: GuruContext): string {
    // In production, calculate actual Dasha period from birth date
    // For now, return placeholder
    return 'Jupiter'; // Placeholder
  }

  /**
   * Helper: Get year cycle from numerology
   */
  private getYearCycle(context: GuruContext): number {
    if (!context.numerology?.lifePath) {
      return 1;
    }

    // Calculate current year in numerology cycle
    const currentYear = new Date().getFullYear();
    const yearSum = currentYear.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    return ((yearSum - 1) % 9) + 1;
  }

  /**
   * Helper: Get aura trend
   */
  private getAuraTrend(): 'rising' | 'stable' | 'declining' {
    // In production, analyze aura trends from video/vision data
    return 'stable';
  }

  /**
   * Helper: Get emotion trend
   */
  private getEmotionTrend(): string {
    // In production, analyze emotion trends from video/memory data
    return 'calm';
  }

  /**
   * Helper: Get emotion trend direction
   */
  private getEmotionTrendDirection(): 'positive' | 'neutral' | 'negative' {
    // In production, analyze emotion trends from video/memory data
    return 'neutral';
  }

  /**
   * Get compatibility memory summary
   */
  getCompatibilityMemorySummary(): string {
    const partnerInfo = this.memory.getPartnerInfo();
    if (!partnerInfo || !this.compatibilityReport) {
      return '';
    }

    const summary: string[] = [];
    summary.push(`Compatibility Rating: ${this.compatibilityReport.rating}/100`);
    summary.push(`Synergy Score: ${(this.compatibilityReport.synergyScore * 100).toFixed(0)}%`);
    summary.push(`Conflict Score: ${(this.compatibilityReport.conflictScore * 100).toFixed(0)}%`);
    
    if (this.compatibilityReport.strengths.length > 0) {
      summary.push(`Strengths: ${this.compatibilityReport.strengths.slice(0, 2).join(', ')}`);
    }

    return summary.join(' | ');
  }

  /**
   * Get report summary (Phase 23 - F38)
   */
  getReportSummary(): string {
    const summary: string[] = [];

    if (this.context?.kundali) {
      summary.push(`Kundali: ${this.context.kundali.rashi || 'N/A'} Rashi, ${this.context.kundali.lagna || 'N/A'} Lagna`);
    }

    if (this.context?.numerology) {
      summary.push(`Numerology: Life Path ${this.context.numerology.lifePath || 'N/A'}`);
    }

    if (this.context?.aura) {
      summary.push(`Aura: ${this.context.aura.dominantColor || 'N/A'}`);
    }

    if (this.pastLifeResult) {
      summary.push(`Past Life: ${this.pastLifeResult.pastLifeRole}`);
    }

    if (this.timelineSummary) {
      summary.push(`Predictions: ${this.timelineSummary.next30Days.summary.substring(0, 50)}...`);
    }

    if (this.compatibilityReport) {
      summary.push(`Compatibility: ${this.compatibilityReport.rating}/100 (${this.compatibilityReport.type})`);
    }

    return summary.join(' | ');
  }

  /**
   * Get last orchestrated output (Phase 25 - F40)
   */
  getLastOrchestratedOutput(): OrchestratedOutput | null {
    return this.lastOrchestratedOutput;
  }

  /**
   * Get PDF context for report generation (Phase 24 - F39)
   */
  getPDFContext(type: 'kundali' | 'numerology' | 'aura-chakra' | 'past-life' | 'prediction' | 'compatibility' | 'guru'): any {
    switch (type) {
      case 'kundali':
        return {
          rashi: this.context?.kundali?.rashi,
          lagna: this.context?.kundali?.lagna,
          nakshatra: this.context?.kundali?.nakshatra,
          majorPlanets: this.context?.kundali?.majorPlanets,
          houses: Array.from({ length: 12 }, (_, i) => ({ number: i + 1 })),
          dashaPeriod: this.getDashaPeriod(this.context || {} as GuruContext),
        };
      case 'numerology':
        return {
          lifePath: this.context?.numerology?.lifePath,
          destiny: this.context?.numerology?.destiny,
          personality: this.context?.numerology?.personality,
          yearCycle: this.getYearCycle(this.context || {} as GuruContext),
        };
      case 'aura-chakra':
        return {
          dominantColor: this.context?.aura?.dominantColor,
          chakraStrengths: this.context?.aura?.chakraStrengths,
        };
      case 'past-life':
        return {
          pastLifeRole: this.pastLifeResult?.pastLifeRole,
          unresolvedLessons: this.pastLifeResult?.unresolvedLessons,
          karmicDebts: this.pastLifeResult?.karmicDebts,
          repeatingCycles: this.pastLifeResult?.repeatingCycles,
          soulStrength: this.pastLifeResult?.soulStrength,
        };
      case 'prediction':
        return {
          next30Days: this.timelineSummary?.next30Days,
          next90Days: this.timelineSummary?.next90Days,
          yearCycle: this.timelineSummary?.yearCycle,
          timeline: this.timeline?.map(month => ({
            month: month.monthName,
            overallEnergy: month.overallEnergy,
            colorCode: month.colorCode,
          })),
        };
      case 'compatibility':
        return this.compatibilityReport ? {
          type: this.compatibilityReport.type,
          rating: this.compatibilityReport.rating,
          synergyScore: this.compatibilityReport.synergyScore,
          conflictScore: this.compatibilityReport.conflictScore,
          strengths: this.compatibilityReport.strengths,
          challenges: this.compatibilityReport.challenges,
          guidance: this.compatibilityReport.guidance,
        } : null;
      case 'guru':
        return {
          kundali: this.getPDFContext('kundali'),
          numerology: this.getPDFContext('numerology'),
          aura: this.getPDFContext('aura-chakra'),
          pastLife: this.getPDFContext('past-life'),
          prediction: this.getPDFContext('prediction'),
          compatibility: this.getPDFContext('compatibility'),
        };
      default:
        return null;
    }
  }
}

