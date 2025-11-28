/**
 * Guru Chat Engine - Deep Wiring
 * 
 * Enhanced AI Guru chat engine that reads from all engine results
 */

// Note: Cannot import store directly in engine (server/client boundary)
// Engine results are injected via injectEngineResults method

export interface GuruMessage {
  id: string;
  role: 'user' | 'guru';
  content: string;
  timestamp: Date;
  metadata?: {
    sources?: string[];
    confidence?: number;
    engineReferences?: string[];
    insightMode?: boolean;
  };
}

export interface GuruSession {
  id: string;
  messages: GuruMessage[];
  createdAt: Date;
  updatedAt: Date;
  memory: GuruMessage[]; // Last 5 messages for context
}

class GuruChatEngine {
  private sessions: Map<string, GuruSession> = new Map();
  private readonly MEMORY_SIZE = 5;

  async sendMessage(sessionId: string, userMessage: string): Promise<GuruMessage> {
    const session = this.sessions.get(sessionId) || this.createSession(sessionId);
    
    // Add user message
    const userMsg: GuruMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };
    
    session.messages.push(userMsg);
    this.updateMemory(session, userMsg);
    session.updatedAt = new Date();

    // Generate guru response with engine context
    const guruResponse = await this.generateResponseWithContext(userMessage, session);
    
    session.messages.push(guruResponse);
    this.updateMemory(session, guruResponse);
    session.updatedAt = new Date();
    
    this.sessions.set(sessionId, session);
    
    return guruResponse;
  }

  private updateMemory(session: GuruSession, message: GuruMessage): void {
    session.memory.push(message);
    if (session.memory.length > this.MEMORY_SIZE) {
      session.memory.shift();
    }
  }

  private async generateResponseWithContext(userMessage: string, session: GuruSession): Promise<GuruMessage> {
    const lowerMessage = userMessage.toLowerCase();
    
    // Get engine results from injected context
    const engineResults = (session as any).engineResults || this.getEngineResults();
    
    let response = '';
    let engineReferences: string[] = [];
    let insightMode = false;
    
    // Context-aware responses with engine data
    if (lowerMessage.includes('kundali') || lowerMessage.includes('chart')) {
      if (engineResults.kundali) {
        response = `Based on your Kundali, I can see that ${engineResults.kundali.planets?.[0]?.name || 'your planets'} are positioned in ${engineResults.kundali.planets?.[0]?.sign || 'favorable signs'}. This creates a unique spiritual blueprint that influences your life path. The alignment suggests strong potential for ${engineResults.kundali.houses?.[0]?.name || 'spiritual growth'}.`;
        engineReferences.push('kundali');
        insightMode = true;
      } else {
        response = 'Your kundali reveals deep cosmic patterns. The alignment of planets at your birth time creates a unique spiritual blueprint. Let me help you understand your planetary positions and their influence on your life path.';
      }
    } else if (lowerMessage.includes('numerology') || lowerMessage.includes('number')) {
      if (engineResults.numerology) {
        response = `Your numerology profile shows a Life Path Number of ${engineResults.numerology.lifePath || 'calculated from your birth date'}, which indicates ${engineResults.numerology.lifePathMeaning || 'strong spiritual growth potential'}. Your Destiny Number suggests ${engineResults.numerology.destinyMeaning || 'leadership qualities'}.`;
        engineReferences.push('numerology');
        insightMode = true;
      } else {
        response = 'Numerology reveals insights through your birth date and name. Your life path number guides your major decisions and spiritual journey.';
      }
    } else if (lowerMessage.includes('prediction') || lowerMessage.includes('forecast')) {
      if (engineResults.predictions?.daily) {
        const daily = engineResults.predictions.daily;
        response = `Based on your daily predictions, today brings ${daily.overallIntensity || 'positive'} cosmic energies. Your ${daily.predictions?.[0]?.category || 'spiritual'} area shows ${daily.predictions?.[0]?.intensity || 'high'} intensity with ${daily.predictions?.[0]?.score || 80}/100 score. ${daily.predictions?.[0]?.advice || 'Focus on maintaining harmony.'}`;
        engineReferences.push('predictions');
        insightMode = true;
      } else {
        response = 'Your predictions are influenced by current planetary transits and your birth chart. The cosmic energies guide your path forward.';
      }
    } else if (lowerMessage.includes('timeline') || lowerMessage.includes('future')) {
      if (engineResults.timeline && engineResults.timeline.length > 0) {
        const nextMonth = engineResults.timeline[0];
        response = `Looking at your 12-month timeline, ${nextMonth.month} ${nextMonth.year} shows ${nextMonth.overallEnergy || 'high'} energy levels. Key events include ${nextMonth.events?.[0]?.event || 'important transits'}. Focus areas are ${nextMonth.focusAreas?.join(', ') || 'spiritual growth'}.`;
        engineReferences.push('timeline');
        insightMode = true;
      } else {
        response = 'Your timeline reveals important periods ahead. Understanding these cycles helps you navigate with wisdom and align with cosmic timing.';
      }
    } else if (lowerMessage.includes('career') || lowerMessage.includes('job')) {
      if (engineResults.business) {
        response = `Based on your business analysis, your career path shows ${engineResults.business.jobScore || 75}% compatibility with job roles and ${engineResults.business.businessScore || 80}% with entrepreneurship. ${engineResults.business.recommendation || 'Focus on your strengths and align with your dharma.'}`;
        engineReferences.push('business');
        insightMode = true;
      } else {
        response = 'Based on your astrological profile, your career path is influenced by the 10th house and the position of Saturn. The current planetary transits suggest a period of growth and opportunity. Focus on your strengths and align with your dharma.';
      }
    } else if (lowerMessage.includes('love') || lowerMessage.includes('relationship') || lowerMessage.includes('marriage')) {
      response = 'Love and relationships are governed by Venus and the 7th house in your chart. The current dasha period indicates favorable times for deepening connections. Trust the cosmic timing and nurture your relationships with compassion.';
      if (engineResults.predictions?.daily) {
        const lovePred = engineResults.predictions.daily.predictions?.find(p => p.category === 'love');
        if (lovePred) {
          response = `Your love predictions show ${lovePred.intensity} intensity with a score of ${lovePred.score}/100. ${lovePred.prediction} ${lovePred.advice}`;
          engineReferences.push('predictions');
          insightMode = true;
        }
      }
    } else if (lowerMessage.includes('health') || lowerMessage.includes('wellness')) {
      response = 'Your health is connected to the 6th house and the position of Mars. Maintaining balance through spiritual practices, proper diet, and alignment with natural rhythms will support your well-being.';
      if (engineResults.predictions?.daily) {
        const healthPred = engineResults.predictions.daily.predictions?.find(p => p.category === 'health');
        if (healthPred) {
          response = `Your health predictions indicate ${healthPred.intensity} energy levels. ${healthPred.prediction} ${healthPred.advice}`;
          engineReferences.push('predictions');
          insightMode = true;
        }
      }
    } else if (lowerMessage.includes('money') || lowerMessage.includes('wealth') || lowerMessage.includes('finance')) {
      response = 'Financial prosperity is linked to the 2nd and 11th houses, along with Jupiter\'s influence. The current planetary positions suggest opportunities for growth. Practice gratitude and align your actions with your values.';
      if (engineResults.predictions?.daily) {
        const moneyPred = engineResults.predictions.daily.predictions?.find(p => p.category === 'money');
        if (moneyPred) {
          response = `Your financial predictions show ${moneyPred.intensity} intensity. ${moneyPred.prediction} ${moneyPred.advice}`;
          engineReferences.push('predictions');
          insightMode = true;
        }
      }
    } else if (lowerMessage.includes('remedy') || lowerMessage.includes('solution') || lowerMessage.includes('problem')) {
      response = 'Every challenge has a spiritual remedy. Based on your chart and current predictions, I recommend specific mantras, gemstones, or rituals that can help balance the planetary energies affecting you. Let me know what area you\'d like to focus on.';
      insightMode = true;
    } else {
      // Default spiritual guidance with memory context
      const memoryContext = session.memory.length > 0 
        ? `Based on our previous conversation about ${this.extractTopics(session.memory)}, ` 
        : '';
      
      const responses = [
        `${memoryContext}The cosmos speaks through your chart. Each planetary position tells a story of your soul's journey. What specific aspect would you like to explore?`,
        `${memoryContext}Your spiritual path is unique, guided by the stars. I'm here to help you understand the cosmic influences in your life. What questions do you have?`,
        `${memoryContext}The divine wisdom flows through your kundali. Let me help you unlock the secrets of your astrological profile. What would you like to know?`,
        `${memoryContext}Your birth chart is a map of your destiny. Together, we can explore the planetary influences shaping your life. What area interests you most?`,
      ];
      response = responses[Math.floor(Math.random() * responses.length)];
    }

    return {
      id: `msg-${Date.now()}-guru`,
      role: 'guru',
      content: response,
      timestamp: new Date(),
      metadata: {
        confidence: insightMode ? 0.95 : 0.85,
        sources: ['Vedic Astrology', 'Swiss Ephemeris', 'Classical Texts'],
        engineReferences,
        insightMode,
      },
    };
  }

  private getEngineResults() {
    // Access store state - this will be called from client components
    if (typeof window === 'undefined') {
      return {
        kundali: null,
        numerology: null,
        business: null,
        pregnancy: null,
        faceReading: null,
        palmistry: null,
        aura: null,
        timeline: null,
        predictions: { daily: null, weekly: null, monthly: null },
      };
    }
    
    // In client, we'll pass results from the hook
    return {
      kundali: null,
      numerology: null,
      business: null,
      pregnancy: null,
      faceReading: null,
      palmistry: null,
      aura: null,
      timeline: null,
      predictions: { daily: null, weekly: null, monthly: null },
    };
  }

  private extractTopics(messages: GuruMessage[]): string {
    const topics: string[] = [];
    messages.forEach(msg => {
      const content = msg.content.toLowerCase();
      if (content.includes('kundali')) topics.push('kundali');
      if (content.includes('career')) topics.push('career');
      if (content.includes('love')) topics.push('relationships');
      if (content.includes('money')) topics.push('finances');
      if (content.includes('health')) topics.push('health');
    });
    return topics.length > 0 ? topics.join(', ') : 'your spiritual journey';
  }

  createSession(sessionId?: string): GuruSession {
    const id = sessionId || `session-${Date.now()}`;
    const session: GuruSession = {
      id,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      memory: [],
    };
    this.sessions.set(id, session);
    return session;
  }

  getSession(sessionId: string): GuruSession | null {
    return this.sessions.get(sessionId) || null;
  }

  clearSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  // Method to inject engine results for context
  injectEngineResults(sessionId: string, results: any): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      // Store results in session metadata for context
      (session as any).engineResults = results;
    }
  }
}

export const guruEngine = new GuruChatEngine();
