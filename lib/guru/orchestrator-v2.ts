/**
 * Guru Intelligence Orchestrator v2
 * 
 * Phase 3 — Section 40: PAGES PHASE 25 (F40)
 * 
 * Unified intelligence fusion and system orchestration
 */

import { GuruContext } from '@/lib/ai/guruPrompt';
import { GuruMemory } from './guru-memory';
import { Remedy } from './remedy-engine';
import { Insight } from './insight-injector';
import { PredictionEngine, PredictionInputs } from './prediction-engine';
import { TimelineBuilder, TimelineMonth, TimelineSummary } from './timeline-builder';
import { CompatibilityEngine, CompatibilityInputs, CompatibilityReport } from './compatibility-engine';
import { PastLifeEngine, PastLifeResult } from './past-life-engine';
import { KnowledgeGraph, UserGraph } from './knowledge-graph';
import { VisionEngine, VisionResult } from './vision-engine';
import { VideoEngine, VideoFrameInsight } from './video-engine';
import { VoiceEngine } from './voice-engine';
import { safetyLayerV3, detectEmotionalState } from '@/lib/security/safety-layer-v3';

export type IntentType = 
  | 'love' 
  | 'money' 
  | 'health' 
  | 'spiritual' 
  | 'past-life' 
  | 'prediction' 
  | 'compatibility' 
  | 'remedy' 
  | 'vision' 
  | 'video' 
  | 'voice'
  | 'general';

export interface UnifiedContext {
  kundali?: GuruContext['kundali'];
  numerology?: GuruContext['numerology'];
  aura?: GuruContext['aura'];
  pastLife?: PastLifeResult | null;
  synergyScore?: number;
  userGraph?: UserGraph | null;
  videoTrends?: any;
  visionFindings?: any;
  emotionalState?: string;
}

export interface OrchestratedSummary {
  memory: string;
  insights: string[];
  predictions: string;
  compatibility: string;
  pastLife: string;
  videoTrends: string;
  visionFindings: string;
  remedies: string;
  synergy: string;
}

export interface OrchestratedOutput {
  response: string;
  insights: Insight[];
  remedies: Remedy[];
  predictions?: TimelineMonth[];
  compatibility?: CompatibilityReport | null;
  pastLife?: PastLifeResult | null;
  videoInsights?: VideoFrameInsight[];
  visionResults?: VisionResult[];
  intent: IntentType;
  confidence: number;
  sceneEvents: Array<{ event: string; payload?: any }>;
}

export class OrchestratorV2 {
  private memory: GuruMemory;
  private predictionEngine: PredictionEngine;
  private timelineBuilder: TimelineBuilder;
  private compatibilityEngine: CompatibilityEngine;
  private pastLifeEngine: PastLifeEngine;
  private knowledgeGraph: KnowledgeGraph;
  private visionEngine: VisionEngine;
  private videoEngine: VideoEngine | null = null;
  private voiceEngine: VoiceEngine | null = null;

  // Cache for heavy computations
  private cache: {
    pastLife?: { result: PastLifeResult | null; timestamp: number };
    userGraph?: { result: UserGraph | null; timestamp: number };
    timeline?: { result: TimelineMonth[] | null; timestamp: number };
    synergyScore?: { result: number; timestamp: number };
  } = {};

  private cacheTTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.memory = new GuruMemory();
    this.predictionEngine = new PredictionEngine();
    this.timelineBuilder = new TimelineBuilder();
    this.compatibilityEngine = new CompatibilityEngine();
    this.pastLifeEngine = new PastLifeEngine();
    this.knowledgeGraph = new KnowledgeGraph();
    this.visionEngine = new VisionEngine();
  }

  /**
   * Set video engine
   */
  setVideoEngine(engine: VideoEngine): void {
    this.videoEngine = engine;
  }

  /**
   * Set voice engine
   */
  setVoiceEngine(engine: VoiceEngine): void {
    this.voiceEngine = engine;
  }

  /**
   * Build unified context from all sources
   */
  buildUnifiedContext(context?: GuruContext): UnifiedContext {
    const unified: UnifiedContext = {
      kundali: context?.kundali,
      numerology: context?.numerology,
      aura: context?.aura,
      emotionalState: this.memory.getMemory().emotionalState,
    };

    // Add past life (cached)
    const pastLife = this.getCachedPastLife(context);
    if (pastLife) {
      unified.pastLife = pastLife;
    }

    // Add knowledge graph (cached)
    const userGraph = this.getCachedUserGraph(context);
    if (userGraph) {
      unified.userGraph = userGraph;
      unified.synergyScore = userGraph.synergyScore;
    }

    // Add video trends
    const videoTrends = this.memory.getVideoTrendsSummary();
    if (videoTrends) {
      unified.videoTrends = videoTrends;
    }

    // Add vision findings
    const visionFindings = this.memory.getMemory().visionFindings;
    if (visionFindings) {
      unified.visionFindings = visionFindings;
    }

    return unified;
  }

  /**
   * Merge signals from all intelligence sources (Phase 25 - F40)
   * Merges: memory, insight, remedy, prediction, compatibility, past-life, knowledge-graph, vision, video, voice
   */
  mergeSignals(
    message: string,
    context?: GuruContext,
    visionData?: any,
    videoData?: any,
    voiceData?: any
  ): {
    intent: IntentType;
    confidence: number;
    relevantEngines: string[];
    memorySignals: string;
    insightSignals: string[];
    remedySignals: string[];
    predictionSignals: string;
    compatibilitySignals: string;
    pastLifeSignals: string;
    knowledgeGraphSignals: string;
    visionSignals: string;
    videoSignals: string;
    voiceSignals: string;
  } {
    const intent = this.classifyIntent(message);
    const confidence = this.calculateConfidence(intent, message, context);
    const relevantEngines = this.routeToEngine(intent, context);

    // Merge memory signals
    const memorySignals = this.memory.getMemorySummary();

    // Merge insight signals (from memory and context)
    const insightSignals: string[] = [];
    if (context?.kundali) {
      insightSignals.push(`Kundali: ${context.kundali.rashi || 'N/A'} Rashi`);
    }
    if (context?.numerology) {
      insightSignals.push(`Numerology: Life Path ${context.numerology.lifePath || 'N/A'}`);
    }
    if (context?.aura) {
      insightSignals.push(`Aura: ${context.aura.dominantColor || 'N/A'}`);
    }

    // Merge remedy signals (from context)
    const remedySignals: string[] = [];
    if (context) {
      // Placeholder for remedy signals
      remedySignals.push('Remedy suggestions available');
    }

    // Merge prediction signals (from memory if available)
    const predictionSignals = '';

    // Merge compatibility signals (from memory if available)
    const compatibilitySignals = '';

    // Merge past-life signals
    const pastLifeResult = this.getCachedPastLife(context);
    const pastLifeSignals = pastLifeResult ? `Past Life: ${pastLifeResult.pastLifeRole}` : '';

    // Merge knowledge graph signals
    const userGraph = this.getCachedUserGraph(context);
    const knowledgeGraphSignals = userGraph ? `Synergy: ${(userGraph.synergyScore * 100).toFixed(0)}%` : '';

    // Merge vision signals
    const visionSignals = visionData ? JSON.stringify(visionData) : '';

    // Merge video signals
    const videoSignals = videoData ? JSON.stringify(videoData) : '';

    // Merge voice signals
    const voiceSignals = voiceData ? JSON.stringify(voiceData) : '';

    return {
      intent,
      confidence,
      relevantEngines,
      memorySignals,
      insightSignals,
      remedySignals,
      predictionSignals,
      compatibilitySignals,
      pastLifeSignals,
      knowledgeGraphSignals,
      visionSignals,
      videoSignals,
      voiceSignals,
    };
  }

  /**
   * Classify user intent
   */
  classifyIntent(message: string): IntentType {
    const lowerMessage = message.toLowerCase();

    // Intent keywords
    const intentKeywords: { [key in IntentType]: string[] } = {
      love: ['love', 'relationship', 'marriage', 'partner', 'romance', 'dating'],
      money: ['money', 'wealth', 'finance', 'financial', 'income', 'salary', 'prosperity'],
      health: ['health', 'wellness', 'illness', 'sick', 'pain', 'healing', 'medical'],
      spiritual: ['spiritual', 'spirituality', 'divine', 'god', 'prayer', 'meditation', 'soul'],
      'past-life': ['past life', 'previous life', 'karma', 'karmic', 'reincarnation'],
      prediction: ['future', 'prediction', 'forecast', 'what will happen', 'upcoming', 'timeline'],
      compatibility: ['compatibility', 'match', 'compatible', 'harmony', 'synergy', 'relationship'],
      remedy: ['remedy', 'solution', 'help', 'what should i do', 'guidance', 'fix'],
      vision: ['image', 'photo', 'picture', 'palm', 'palmistry', 'upload'],
      video: ['video', 'camera', 'scan', 'live', 'stream'],
      voice: ['voice', 'speak', 'talk', 'audio', 'mic'],
      general: [],
    };

    // Score each intent
    const scores: { [key in IntentType]?: number } = {};
    
    for (const [intent, keywords] of Object.entries(intentKeywords)) {
      if (intent === 'general') continue;
      scores[intent as IntentType] = keywords.reduce((score, keyword) => {
        return score + (lowerMessage.includes(keyword) ? 1 : 0);
      }, 0);
    }

    // Find highest scoring intent
    const maxScore = Math.max(...Object.values(scores).filter(v => v !== undefined) as number[]);
    const topIntent = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0] as IntentType;

    return topIntent && maxScore > 0 ? topIntent : 'general';
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(intent: IntentType, message: string, context?: GuruContext): number {
    let confidence = 0.5; // Base confidence

    // Increase confidence if context is available
    if (context) {
      confidence += 0.2;
    }

    // Increase confidence for specific intents with context
    if (intent === 'prediction' && context?.kundali) {
      confidence += 0.1;
    }
    if (intent === 'compatibility' && context?.kundali) {
      confidence += 0.1;
    }
    if (intent === 'past-life' && context?.kundali) {
      confidence += 0.1;
    }

    return Math.min(1, confidence);
  }

  /**
   * Route to appropriate engines with fallback chain (Phase 25 - F40)
   * Fallback: vision → video → memory → base prompt
   */
  routeToEngine(intent: IntentType, context?: GuruContext): string[] {
    const engines: string[] = [];

    switch (intent) {
      case 'love':
      case 'compatibility':
        engines.push('compatibility-engine', 'past-life-engine', 'knowledge-graph');
        break;
      case 'money':
      case 'health':
      case 'spiritual':
        engines.push('prediction-engine', 'remedy-engine', 'insight-injector');
        break;
      case 'past-life':
        engines.push('past-life-engine', 'knowledge-graph', 'insight-injector');
        break;
      case 'prediction':
        engines.push('prediction-engine', 'timeline-builder', 'knowledge-graph');
        break;
      case 'remedy':
        engines.push('remedy-engine', 'insight-injector', 'past-life-engine');
        break;
      case 'vision':
        engines.push('vision-engine', 'insight-injector');
        // Fallback chain: vision → video → memory → base prompt
        engines.push('video-engine', 'memory', 'base-prompt');
        break;
      case 'video':
        engines.push('video-engine', 'insight-injector');
        // Fallback chain: video → memory → base prompt
        engines.push('memory', 'base-prompt');
        break;
      case 'voice':
        engines.push('voice-engine');
        // Fallback chain: voice → memory → base prompt
        engines.push('memory', 'base-prompt');
        break;
      default:
        engines.push('insight-injector', 'remedy-engine');
        // Fallback chain: memory → base prompt
        engines.push('memory', 'base-prompt');
    }

    // Always include memory as fallback
    if (!engines.includes('memory')) {
      engines.push('memory');
    }

    return engines;
  }

  /**
   * Fuse insights from all sources
   */
  fuseInsights(
    message: string,
    context?: GuruContext,
    insights?: Insight[]
  ): Insight[] {
    const fused: Insight[] = insights || [];

    // Add past life insights
    const pastLife = this.getCachedPastLife(context);
    if (pastLife && this.classifyIntent(message) === 'past-life') {
      fused.push({
        type: 'past-life',
        title: 'Past Life Insight',
        description: `Your past life role: ${pastLife.pastLifeRole}`,
        confidence: 0.8,
      });
    }

    // Add synergy insights
    const userGraph = this.getCachedUserGraph(context);
    if (userGraph && userGraph.synergyScore >= 0.7) {
      fused.push({
        type: 'synergy',
        title: 'High Cosmic Synergy',
        description: 'Your spiritual energies are in harmony',
        confidence: userGraph.synergyScore,
      });
    }

    return fused;
  }

  /**
   * Fuse predictions
   */
  fusePredictions(context?: GuruContext): TimelineMonth[] | null {
    if (!context) return null;

    // Check cache
    if (this.cache.timeline && Date.now() - this.cache.timeline.timestamp < this.cacheTTL) {
      return this.cache.timeline.result;
    }

    const inputs: PredictionInputs = {
      kundali: {
        dashaPeriod: 'Jupiter', // Placeholder
        nakshatra: context.kundali?.nakshatra,
        majorPlanets: context.kundali?.majorPlanets,
      },
      numerology: {
        yearCycle: this.getYearCycle(context),
        lifePath: context.numerology?.lifePath,
      },
      aura: {
        dominantColor: context.aura?.dominantColor,
        energyTrend: 'stable',
      },
      pastLife: {
        karmicPatterns: this.getCachedPastLife(context)?.karmicPatterns,
        unresolvedLessons: this.getCachedPastLife(context)?.unresolvedLessons,
      },
      synergyScore: this.getCachedSynergyScore(context),
    };

    const timeline = this.timelineBuilder.buildTimeline(inputs);
    
    // Cache result
    this.cache.timeline = {
      result: timeline,
      timestamp: Date.now(),
    };

    return timeline;
  }

  /**
   * Fuse compatibility
   */
  fuseCompatibility(
    type: 'love' | 'marriage' | 'friendship' | 'career',
    userContext?: GuruContext,
    partnerContext?: GuruContext
  ): CompatibilityReport | null {
    if (!userContext || !partnerContext) return null;

    const inputs: CompatibilityInputs = {
      user: {
        kundali: userContext.kundali,
        numerology: userContext.numerology,
        aura: userContext.aura,
        pastLife: this.getCachedPastLife(userContext),
        synergyScore: this.getCachedSynergyScore(userContext),
      },
      partner: {
        kundali: partnerContext.kundali,
        numerology: partnerContext.numerology,
        aura: partnerContext.aura,
        pastLife: null, // Would need partner's past life
        synergyScore: 0.5,
      },
    };

    return this.compatibilityEngine.calculateCompatibility(type, inputs);
  }

  /**
   * Fuse past life
   */
  fusePastLife(context?: GuruContext): PastLifeResult | null {
    if (!context) return null;

    // Check cache
    if (this.cache.pastLife && Date.now() - this.cache.pastLife.timestamp < this.cacheTTL) {
      return this.cache.pastLife.result;
    }

    const result = this.pastLifeEngine.analyzePastLife({
      kundali: context.kundali,
      numerology: context.numerology,
      aura: context.aura,
    });

    // Cache result
    this.cache.pastLife = {
      result,
      timestamp: Date.now(),
    };

    return result;
  }

  /**
   * Fuse vision
   */
  async fuseVision(imageFile: File): Promise<VisionResult | null> {
    try {
      return await this.visionEngine.analyzeImage(imageFile);
    } catch (error) {
      console.error('Vision fusion error:', error);
      return null;
    }
  }

  /**
   * Fuse video
   */
  fuseVideo(insight: VideoFrameInsight): void {
    // Store in memory
    if (insight.aura?.dominantColor) {
      this.memory.trackAuraTrend(insight.aura.dominantColor);
    }
    if (insight.emotion) {
      this.memory.trackEmotionalCurve(
        insight.emotion.primaryEmotion,
        insight.emotion.intensity
      );
    }
    if (insight.gesture) {
      this.memory.trackGestureFrequency(insight.gesture);
    }
  }

  /**
   * Fuse voice
   */
  async fuseVoice(audioBlob: Blob): Promise<string | null> {
    if (!this.voiceEngine) return null;

    try {
      return await this.voiceEngine.transcribe(audioBlob);
    } catch (error) {
      console.error('Voice fusion error:', error);
      return null;
    }
  }

  /**
   * Generate orchestrated summary blocks
   */
  generateOrchestratedSummary(
    context?: GuruContext,
    insights?: Insight[],
    remedies?: Remedy[],
    predictions?: TimelineMonth[],
    compatibility?: CompatibilityReport | null,
    pastLife?: PastLifeResult | null
  ): OrchestratedSummary {
    const summary: OrchestratedSummary = {
      memory: this.memory.getMemorySummary(),
      insights: insights?.map(i => `${i.title}: ${i.description}`) || [],
      predictions: predictions ? this.timelineBuilder.generateSummary(predictions).next30Days.summary : '',
      compatibility: compatibility ? `Rating: ${compatibility.rating}/100, Synergy: ${(compatibility.synergyScore * 100).toFixed(0)}%` : '',
      pastLife: pastLife ? `Role: ${pastLife.pastLifeRole}, Strength: ${pastLife.soulStrength}/5` : '',
      videoTrends: this.memory.getVideoTrendsSummary(),
      visionFindings: JSON.stringify(this.memory.getMemory().visionFindings || {}),
      remedies: remedies?.map(r => `${r.title}: ${r.description}`).join(' | ') || '',
      synergy: this.getCachedSynergyScore(context) >= 0.7 ? 'High Synergy' : 'Moderate Synergy',
    };

    return summary;
  }

  /**
   * Generate final guru output with unified intelligence fusion (Phase 25 - F40)
   */
  async generateFinalGuruOutput(
    message: string,
    context?: GuruContext,
    visionData?: any,
    videoData?: any,
    voiceData?: any
  ): Promise<OrchestratedOutput> {
    // Merge all signals
    const mergedSignals = this.mergeSignals(
      message,
      context,
      visionData,
      videoData,
      voiceData
    );

    const { intent, confidence, relevantEngines } = mergedSignals;

    // Build unified context
    const unifiedContext = this.buildUnifiedContext(context);

    // Fuse all intelligence sources based on intent and fallback chain
    let pastLife: PastLifeResult | null = null;
    let predictions: TimelineMonth[] | null = null;
    let compatibility: CompatibilityReport | null = null;
    let visionResults: VisionResult[] | null = null;
    let videoInsights: VideoFrameInsight[] | null = null;

    // Apply fallback chain: try primary engines, then fallback
    if (relevantEngines.includes('past-life-engine')) {
      pastLife = this.fusePastLife(context);
    }

    if (relevantEngines.includes('prediction-engine')) {
      predictions = this.fusePredictions(context);
    }

    if (relevantEngines.includes('compatibility-engine') && context) {
      compatibility = this.fuseCompatibility('love', context, context);
    }

    if (relevantEngines.includes('vision-engine') && visionData) {
      // Vision fusion would happen here
      visionResults = visionData as VisionResult[];
    }

    if (relevantEngines.includes('video-engine') && videoData) {
      // Video fusion would happen here
      videoInsights = videoData as VideoFrameInsight[];
    }

    // Generate insights from fused data
    const insights = this.fuseInsights(message, context);

    // Generate remedies (placeholder - would use remedy engine)
    const remedies: Remedy[] = [];

    // Generate scene events (Phase 25 - F40: All 10 orchestrator events)
    const sceneEvents: Array<{ event: string; payload?: any }> = [];

    // 1. Orchestrator insight
    if (insights && insights.length > 0) {
      sceneEvents.push({ event: 'orchestrator-insight', payload: { count: insights.length } });
    }

    // 2. Orchestrator remedy
    if (remedies && remedies.length > 0) {
      sceneEvents.push({ event: 'orchestrator-remedy', payload: { count: remedies.length } });
    }

    // 3. Orchestrator karmic (past life)
    if (pastLife) {
      sceneEvents.push({ event: 'orchestrator-karmic', payload: { role: pastLife.pastLifeRole } });
    }

    // 4. Orchestrator prediction
    if (predictions && predictions.length > 0) {
      sceneEvents.push({ event: 'orchestrator-prediction', payload: { count: predictions.length } });
    }

    // 5. Orchestrator compatibility
    if (compatibility) {
      sceneEvents.push({ event: 'orchestrator-compatibility', payload: { rating: compatibility.rating } });
    }

    // 6. Orchestrator past-life (separate from karmic)
    if (pastLife) {
      sceneEvents.push({ event: 'orchestrator-pastlife', payload: { role: pastLife.pastLifeRole } });
    }

    // 7. Orchestrator vision
    if (visionResults && visionResults.length > 0) {
      sceneEvents.push({ event: 'orchestrator-vision', payload: { count: visionResults.length } });
    }

    // 8. Orchestrator video
    if (videoInsights && videoInsights.length > 0) {
      sceneEvents.push({ event: 'orchestrator-video', payload: { count: videoInsights.length } });
    }

    // 9. Orchestrator voice
    if (voiceData) {
      sceneEvents.push({ event: 'orchestrator-voice', payload: {} });
    }

    // 10. Orchestrator memory (always include)
    sceneEvents.push({ event: 'orchestrator-memory', payload: { summary: this.memory.getMemorySummary() } });

    // Phase 29 - F44: Generate response with failover path
    // Fallback chain: memory → predictionSummary → compatibilitySummary → simpleGuruReply
    let response = '';

    try {
      // Try to generate based on intent
      if (intent === 'prediction' && predictions && predictions.length > 0) {
        response = `Based on your cosmic alignment, I see favorable energies in the coming months. The stars indicate potential for growth and harmony.`;
      } else if (intent === 'compatibility' && compatibility) {
        response = `The cosmic compatibility shows ${compatibility.rating > 0.7 ? 'strong' : compatibility.rating > 0.5 ? 'moderate' : 'developing'} alignment. The divine energies suggest ${compatibility.rating > 0.7 ? 'harmonious' : 'evolving'} connections.`;
      } else if (intent === 'past-life' && pastLife) {
        response = `Your past life journey reveals deep karmic patterns. The soul's evolution continues through this lifetime.`;
      } else if (memorySummary && memorySummary.length > 0) {
        response = `Based on our previous conversations, I sense you're seeking guidance on ${intent}. The cosmic energies are aligning to support your journey.`;
      } else {
        response = `Based on your ${intent} inquiry, I sense deep cosmic alignment. The divine energies are flowing, and I'm here to guide you.`;
      }
    } catch (error) {
      // Phase 29 - F44: Final fallback - always produce an answer
      response = 'The cosmic energies are aligning. I sense your question and am here to provide spiritual guidance. Trust the journey and remain open to divine wisdom.';
    }

    // Phase 28 - F43: Apply safety layer V3
    const emotionalState = detectEmotionalState(message);
    const safetyCheck = safetyLayerV3(response, emotionalState);
    
    if (!safetyCheck.safe && safetyCheck.sanitized) {
      response = safetyCheck.sanitized;
    } else if (!safetyCheck.safe) {
      // Fallback safe response
      response = 'I understand your question, but I cannot provide that type of guidance. ' +
        'Please consult qualified professionals for medical, legal, or financial matters. ' +
        'How else can I help you on your spiritual journey?';
    }

    // Phase 29 - F44: Guard to ALWAYS produce an answer (never null)
    if (!response || response.trim().length === 0) {
      response = 'The cosmic energies are aligning. I sense your question and am here to provide spiritual guidance. Trust the journey and remain open to divine wisdom.';
    }

    return {
      response,
      insights: insights || [],
      remedies: remedies || [],
      predictions: predictions || undefined,
      compatibility: compatibility || undefined,
      pastLife: pastLife || undefined,
      videoInsights: videoInsights || undefined,
      visionResults: visionResults || undefined,
      intent,
      confidence,
      sceneEvents: sceneEvents || [],
    };
  }

  /**
   * Compress memory for prompt building
   */
  compressMemory(maxLength: number = 500): string {
    const memorySummary = this.memory.getMemorySummary();
    if (memorySummary.length <= maxLength) {
      return memorySummary;
    }

    // Truncate and add ellipsis
    return memorySummary.substring(0, maxLength - 3) + '...';
  }

  /**
   * Get cached past life (public for mergeSignals)
   */
  getCachedPastLife(context?: GuruContext): PastLifeResult | null {
    if (!context) return null;

    if (this.cache.pastLife && Date.now() - this.cache.pastLife.timestamp < this.cacheTTL) {
      return this.cache.pastLife.result;
    }

    const result = this.fusePastLife(context);
    return result;
  }

  /**
   * Get cached user graph (public for mergeSignals)
   */
  getCachedUserGraph(context?: GuruContext): UserGraph | null {
    if (!context) return null;

    if (this.cache.userGraph && Date.now() - this.cache.userGraph.timestamp < this.cacheTTL) {
      return this.cache.userGraph.result;
    }

    const userGraph = this.knowledgeGraph.buildUserGraph({
      kundali: context.kundali,
      numerology: context.numerology,
      aura: context.aura,
    });

    this.cache.userGraph = {
      result: userGraph,
      timestamp: Date.now(),
    };

    return userGraph;
  }

  /**
   * Get cached synergy score
   */
  private getCachedSynergyScore(context?: GuruContext): number {
    const userGraph = this.getCachedUserGraph(context);
    return userGraph?.synergyScore || 0.5;
  }

  /**
   * Helper: Get year cycle
   */
  private getYearCycle(context?: GuruContext): number {
    if (!context?.numerology?.lifePath) {
      return 1;
    }

    const currentYear = new Date().getFullYear();
    const yearSum = currentYear.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    return ((yearSum - 1) % 9) + 1;
  }

  /**
   * Invalidate cache
   */
  invalidateCache(type?: 'pastLife' | 'userGraph' | 'timeline' | 'synergyScore'): void {
    if (type) {
      delete this.cache[type];
    } else {
      this.cache = {};
    }
  }

  /**
   * Get orchestrator profiling data
   */
  getProfilingData(): {
    cacheHits: number;
    cacheMisses: number;
    averageLatency: number;
  } {
    // Placeholder for profiling
    return {
      cacheHits: 0,
      cacheMisses: 0,
      averageLatency: 0,
    };
  }
}

