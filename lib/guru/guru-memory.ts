/**
 * Guru Memory System
 * 
 * Phase 3 — Section 31: PAGES PHASE 16 (F31)
 * Phase 28 — Section 43: SECURITY + VALIDATION LAYER (F43)
 * 
 * Session-only memory for contextual, evolving conversations
 */

import { purgeOldMemory, shouldPurgeMemory, DEFAULT_MEMORY_LIMITS } from '@/lib/security/memory-safety';

export interface MemoryTopic {
  topic: string;
  mentions: number;
  firstMentioned: Date;
  lastMentioned: Date;
  sentiment?: 'positive' | 'neutral' | 'concerned';
}

export interface PartnerInfo {
  name?: string;
  dob?: string;
  details?: {
    kundali?: any;
    numerology?: any;
    aura?: any;
  };
  lastCompatibilityReport?: any;
}

export interface UserMemory {
  topics: MemoryTopic[];
  previousQuestions: string[];
  emotionalState?: 'happy' | 'anxious' | 'curious' | 'seeking' | 'grateful';
  lastInteraction: Date;
  visionFindings?: {
    auraColor?: string;
    palmPattern?: string;
    emotionalSignature?: string;
    kundaliData?: string;
  };
  videoTrends?: {
    auraTrends?: Array<{ color: string; timestamp: number }>;
    emotionalCurve?: Array<{ emotion: string; intensity: number; timestamp: number }>;
    gestureFrequency?: { [key: string]: number };
  };
  partnerInfo?: PartnerInfo; // Phase 22 - F37
}

export class GuruMemory {
  private memory: UserMemory;
  private lastActivityTime: number; // Phase 28 - F43: Track last activity

  constructor() {
    this.memory = {
      topics: [],
      previousQuestions: [],
      lastInteraction: new Date(),
      visionFindings: {},
      videoTrends: {
        auraTrends: [],
        emotionalCurve: [],
        gestureFrequency: {},
      },
    };
    this.lastActivityTime = Date.now(); // Phase 28 - F43: Initialize activity time
  }

  /**
   * Phase 28 - F43: Purge memory if idle
   */
  purgeIfIdle(): void {
    if (shouldPurgeMemory(this.lastActivityTime, DEFAULT_MEMORY_LIMITS.maxIdleTime)) {
      this.memory = {
        topics: [],
        previousQuestions: [],
        lastInteraction: new Date(),
        visionFindings: {},
        videoTrends: {
          auraTrends: [],
          emotionalCurve: [],
          gestureFrequency: {},
        },
      };
    }
  }

  /**
   * Phase 28 - F43: Update activity time
   */
  private updateActivityTime(): void {
    this.lastActivityTime = Date.now();
  }

  /**
   * Extract topics from user message
   */
  extractTopics(message: string): string[] {
    const topics: string[] = [];
    const lowerMessage = message.toLowerCase();

    // Common spiritual topics
    const topicKeywords: { [key: string]: string[] } = {
      'love': ['love', 'relationship', 'partner', 'marriage', 'romance'],
      'career': ['career', 'job', 'work', 'profession', 'business'],
      'health': ['health', 'wellness', 'illness', 'healing', 'body'],
      'money': ['money', 'wealth', 'finance', 'financial', 'prosperity'],
      'spiritual': ['spiritual', 'spirituality', 'divine', 'god', 'prayer', 'meditation'],
      'kundali': ['kundali', 'birth chart', 'horoscope', 'astrology', 'planets'],
      'numerology': ['numerology', 'numbers', 'life path', 'destiny'],
      'aura': ['aura', 'chakra', 'energy', 'vibration'],
      'future': ['future', 'prediction', 'what will happen', 'upcoming'],
      'remedy': ['remedy', 'solution', 'help', 'guidance', 'what should i do'],
    };

    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        topics.push(topic);
      }
    }

    return topics;
  }

  /**
   * Detect emotional state from message
   */
  detectEmotionalState(message: string): UserMemory['emotionalState'] {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('thank') || lowerMessage.includes('grateful') || lowerMessage.includes('happy')) {
      return 'grateful';
    }
    if (lowerMessage.includes('worried') || lowerMessage.includes('anxious') || lowerMessage.includes('stress')) {
      return 'anxious';
    }
    if (lowerMessage.includes('curious') || lowerMessage.includes('wonder') || lowerMessage.includes('question')) {
      return 'curious';
    }
    if (lowerMessage.includes('help') || lowerMessage.includes('guidance') || lowerMessage.includes('advice')) {
      return 'seeking';
    }

    return 'curious'; // Default
  }

  /**
   * Remember user message
   */
  remember(message: string): void {
    const topics = this.extractTopics(message);
    const emotionalState = this.detectEmotionalState(message);

    // Update topics
    topics.forEach(topic => {
      const existingTopic = this.memory.topics.find(t => t.topic === topic);
      if (existingTopic) {
        existingTopic.mentions++;
        existingTopic.lastMentioned = new Date();
      } else {
        this.memory.topics.push({
          topic,
          mentions: 1,
          firstMentioned: new Date(),
          lastMentioned: new Date(),
        });
      }
    });

    // Store question (keep last 10)
    this.memory.previousQuestions.push(message);
    if (this.memory.previousQuestions.length > 10) {
      this.memory.previousQuestions.shift();
    }

    // Update emotional state
    this.memory.emotionalState = emotionalState;
    this.memory.lastInteraction = new Date();
  }

  /**
   * Get memory summary for AI context
   */
  getMemorySummary(): string {
    if (this.memory.topics.length === 0) {
      return '';
    }

    const topTopics = this.memory.topics
      .sort((a, b) => b.mentions - a.mentions)
      .slice(0, 5)
      .map(t => t.topic)
      .join(', ');

    const emotionalState = this.memory.emotionalState || 'curious';
    const recentQuestions = this.memory.previousQuestions.slice(-3).join('; ');

    return `User's conversation context:
- Frequently discussed topics: ${topTopics}
- Current emotional state: ${emotionalState}
- Recent questions: ${recentQuestions}
- Remember to reference previous conversations naturally and build upon them.`;
  }

  /**
   * Get relevant topics for current message
   */
  getRelevantTopics(message: string): string[] {
    const messageTopics = this.extractTopics(message);
    const relevantTopics: string[] = [];

    // Find topics that match both message and memory
    this.memory.topics.forEach(memoryTopic => {
      if (messageTopics.includes(memoryTopic.topic)) {
        relevantTopics.push(memoryTopic.topic);
      }
    });

    return relevantTopics;
  }

  /**
   * Add vision findings to memory (Phase 18 - F33, Phase 28 - F43: Enforce limits)
   */
  addVisionFinding(type: 'aura' | 'palm' | 'emotion' | 'kundali', data: any): void {
    this.updateActivityTime(); // Phase 28 - F43: Update activity time
    
    if (!this.memory.visionFindings) {
      this.memory.visionFindings = {};
    }
    
    // Phase 28 - F43: Vision findings are already limited (single values per type)

    switch (type) {
      case 'aura':
        if (data.dominantColor) {
          this.memory.visionFindings.auraColor = data.dominantColor;
        }
        break;
      case 'palm':
        if (data.overall?.handType) {
          this.memory.visionFindings.palmPattern = data.overall.handType;
        }
        break;
      case 'emotion':
        if (data.primaryEmotion) {
          this.memory.visionFindings.emotionalSignature = data.primaryEmotion;
        }
        break;
      case 'kundali':
        if (data.extractedText) {
          this.memory.visionFindings.kundaliData = data.extractedText;
        }
        break;
    }
  }

  /**
   * Track live aura trends (Phase 19 - F34, Phase 28 - F43: Enforce limits)
   */
  trackAuraTrend(color: string): void {
    this.updateActivityTime(); // Phase 28 - F43: Update activity time
    
    if (!this.memory.videoTrends) {
      this.memory.videoTrends = { auraTrends: [], emotionalCurve: [], gestureFrequency: {} };
    }
    
    // Phase 28 - F43: Enforce limit (100 samples)
    const auraTrends = purgeOldMemory(
      this.memory.videoTrends.auraTrends || [],
      DEFAULT_MEMORY_LIMITS.maxIdleTime,
      DEFAULT_MEMORY_LIMITS.videoLogs
    );
    
    this.memory.videoTrends.auraTrends = [
      ...auraTrends,
      { color, timestamp: Date.now() },
    ];
  }

  /**
   * Track emotional curve over time (Phase 19 - F34, Phase 28 - F43: Enforce limits)
   */
  trackEmotionalCurve(emotion: string, intensity: number): void {
    this.updateActivityTime(); // Phase 28 - F43: Update activity time
    
    if (!this.memory.videoTrends) {
      this.memory.videoTrends = { auraTrends: [], emotionalCurve: [], gestureFrequency: {} };
    }
    
    // Phase 28 - F43: Enforce limit (100 samples)
    const emotionalCurve = purgeOldMemory(
      this.memory.videoTrends.emotionalCurve || [],
      DEFAULT_MEMORY_LIMITS.maxIdleTime,
      DEFAULT_MEMORY_LIMITS.videoLogs
    );
    
    this.memory.videoTrends.emotionalCurve = [
      ...emotionalCurve,
      { emotion, intensity, timestamp: Date.now() },
    ];
  }

  /**
   * Track gesture frequency (Phase 19 - F34)
   */
  trackGestureFrequency(gesture: string): void {
    if (!this.memory.videoTrends) {
      this.memory.videoTrends = { auraTrends: [], emotionalCurve: [], gestureFrequency: {} };
    }
    if (!this.memory.videoTrends.gestureFrequency) {
      this.memory.videoTrends.gestureFrequency = {};
    }
    this.memory.videoTrends.gestureFrequency[gesture] = (this.memory.videoTrends.gestureFrequency[gesture] || 0) + 1;
  }

  /**
   * Get video trends summary
   */
  getVideoTrendsSummary(): string {
    if (!this.memory.videoTrends) {
      return '';
    }

    const summary: string[] = [];

    // Aura trend
    if (this.memory.videoTrends.auraTrends && this.memory.videoTrends.auraTrends.length > 0) {
      const recentAuras = this.memory.videoTrends.auraTrends.slice(-10);
      const dominantAura = recentAuras.reduce((acc, curr) => {
        acc[curr.color] = (acc[curr.color] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });
      const mostCommon = Object.entries(dominantAura).reduce((a, b) => a[1] > b[1] ? a : b);
      summary.push(`Aura trend: ${mostCommon[0]} (${mostCommon[1]} occurrences)`);
    }

    // Emotional curve
    if (this.memory.videoTrends.emotionalCurve && this.memory.videoTrends.emotionalCurve.length > 0) {
      const recentEmotions = this.memory.videoTrends.emotionalCurve.slice(-10);
      const avgIntensity = recentEmotions.reduce((sum, e) => sum + e.intensity, 0) / recentEmotions.length;
      summary.push(`Emotional average: ${Math.round(avgIntensity * 100)}%`);
    }

    // Gesture frequency
    if (this.memory.videoTrends.gestureFrequency) {
      const gestures = Object.entries(this.memory.videoTrends.gestureFrequency)
        .filter(([_, count]) => count > 0)
        .map(([gesture, count]) => `${gesture} (${count}x)`);
      if (gestures.length > 0) {
        summary.push(`Gestures: ${gestures.join(', ')}`);
      }
    }

    return summary.length > 0 ? summary.join(' | ') : '';
  }

  /**
   * Clear memory (for new session)
   */
  clear(): void {
    this.memory = {
      topics: [],
      previousQuestions: [],
      lastInteraction: new Date(),
      visionFindings: {},
      videoTrends: {
        auraTrends: [],
        emotionalCurve: [],
        gestureFrequency: {},
      },
    };
  }

  /**
   * Get full memory object
   */
  getMemory(): UserMemory {
    return { ...this.memory };
  }

  /**
   * Add partner info to memory (Phase 22 - F37)
   */
  addPartnerInfo(partnerInfo: { name?: string; dob?: string; details?: any; lastCompatibilityReport?: any }): void {
    if (!this.memory.partnerInfo) {
      this.memory.partnerInfo = {};
    }
    this.memory.partnerInfo = {
      ...this.memory.partnerInfo,
      ...partnerInfo,
    };
  }

  /**
   * Get partner info from memory (Phase 22 - F37)
   */
  getPartnerInfo(): { name?: string; dob?: string; details?: any; lastCompatibilityReport?: any } | undefined {
    return this.memory.partnerInfo;
  }
}

