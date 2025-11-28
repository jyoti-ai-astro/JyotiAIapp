/**
 * Prediction Engine - Advanced
 * 
 * Multi-layer prediction system with cosmic intensities and blessing/obstacle tags
 */

export type CosmicIntensity = 'high' | 'medium' | 'low';
export type PredictionCategory = 'love' | 'career' | 'money' | 'health' | 'spiritual';
export type TagType = 'blessing' | 'obstacle' | 'neutral';

export interface PredictionTag {
  type: TagType;
  label: string;
  description?: string;
}

export interface Prediction {
  category: PredictionCategory;
  prediction: string;
  score: number; // 0-100
  intensity: CosmicIntensity;
  tags: PredictionTag[];
  advice: string;
  luckyElements?: {
    color?: string;
    number?: number;
    direction?: string;
  };
  detailedBreakdown?: {
    strengths: string[];
    challenges: string[];
    opportunities: string[];
    remedies?: string[];
  };
}

export interface DailyPrediction {
  date: string;
  rashi: string;
  overall: string;
  overallIntensity: CosmicIntensity;
  predictions: Prediction[];
  summary: string;
  keyHighlights: string[];
}

export interface WeeklyPrediction {
  weekStart: string;
  weekEnd: string;
  theme: string;
  themeIntensity: CosmicIntensity;
  predictions: Prediction[];
  keyEvents: string[];
  focusAreas: string[];
}

export interface MonthlyPrediction {
  month: string;
  year: number;
  theme: string;
  themeIntensity: CosmicIntensity;
  predictions: Prediction[];
  focusAreas: string[];
  majorTransits: string[];
}

class PredictionEngine {
  private generateTags(category: PredictionCategory, score: number): PredictionTag[] {
    const tags: PredictionTag[] = [];
    
    if (score >= 80) {
      tags.push({ type: 'blessing', label: 'Highly Favorable', description: 'Strong positive cosmic alignment' });
    } else if (score >= 60) {
      tags.push({ type: 'blessing', label: 'Moderately Favorable', description: 'Positive energies present' });
    } else if (score >= 40) {
      tags.push({ type: 'neutral', label: 'Balanced', description: 'Neutral cosmic influences' });
    } else {
      tags.push({ type: 'obstacle', label: 'Challenging Period', description: 'Requires careful navigation' });
    }

    // Category-specific tags
    if (category === 'love' && score >= 70) {
      tags.push({ type: 'blessing', label: 'Harmony', description: 'Relationships flourish' });
    }
    if (category === 'career' && score >= 75) {
      tags.push({ type: 'blessing', label: 'Growth Opportunity', description: 'Professional advancement likely' });
    }
    if (category === 'money' && score < 50) {
      tags.push({ type: 'obstacle', label: 'Financial Caution', description: 'Avoid major expenses' });
    }
    if (category === 'health' && score < 60) {
      tags.push({ type: 'obstacle', label: 'Wellness Focus', description: 'Prioritize self-care' });
    }
    if (category === 'spiritual' && score >= 80) {
      tags.push({ type: 'blessing', label: 'Spiritual Awakening', description: 'Deep inner transformation' });
    }

    return tags;
  }

  private getIntensity(score: number): CosmicIntensity {
    if (score >= 75) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  }

  async getDailyPrediction(rashi: string): Promise<DailyPrediction> {
    const predictions: Prediction[] = [
      {
        category: 'love',
        prediction: 'Today brings harmony in relationships. Express your feelings openly and nurture connections.',
        score: 85,
        intensity: 'high',
        tags: this.generateTags('love', 85),
        advice: 'Spend quality time with loved ones',
        luckyElements: { color: 'Pink', number: 6, direction: 'South' },
        detailedBreakdown: {
          strengths: ['Strong emotional bonds', 'Open communication'],
          challenges: ['Minor misunderstandings possible'],
          opportunities: ['Deepen existing relationships', 'New connections possible'],
          remedies: ['Wear pink clothing', 'Chant Venus mantras'],
        },
      },
      {
        category: 'career',
        prediction: 'Professional opportunities arise. Your hard work is being recognized by superiors.',
        score: 80,
        intensity: 'high',
        tags: this.generateTags('career', 80),
        advice: 'Take initiative on important projects',
        luckyElements: { color: 'Blue', number: 3, direction: 'North' },
        detailedBreakdown: {
          strengths: ['Recognition from authority', 'Leadership opportunities'],
          challenges: ['Increased workload'],
          opportunities: ['Promotion discussions', 'New project assignments'],
          remedies: ['Face north while working', 'Wear blue gemstone'],
        },
      },
      {
        category: 'money',
        prediction: 'Financial stability is maintained. Avoid impulsive spending and focus on savings.',
        score: 75,
        intensity: 'medium',
        tags: this.generateTags('money', 75),
        advice: 'Save for future opportunities',
        luckyElements: { color: 'Green', number: 8, direction: 'East' },
        detailedBreakdown: {
          strengths: ['Stable income', 'Good saving potential'],
          challenges: ['Unexpected expenses possible'],
          opportunities: ['Investment opportunities', 'Financial planning'],
          remedies: ['Donate to charity', 'Chant Lakshmi mantras'],
        },
      },
      {
        category: 'health',
        prediction: 'Your energy levels are good. Maintain your wellness routine and stay hydrated.',
        score: 82,
        intensity: 'high',
        tags: this.generateTags('health', 82),
        advice: 'Stay hydrated and get adequate rest',
        luckyElements: { color: 'White', number: 1, direction: 'West' },
        detailedBreakdown: {
          strengths: ['Strong immunity', 'Good energy levels'],
          challenges: ['Minor fatigue possible'],
          opportunities: ['Start new fitness routine', 'Detoxification'],
          remedies: ['Early morning walks', 'Yoga practice'],
        },
      },
      {
        category: 'spiritual',
        prediction: 'A day for inner reflection and spiritual growth. Connect with your higher self.',
        score: 88,
        intensity: 'high',
        tags: this.generateTags('spiritual', 88),
        advice: 'Meditate and connect with your higher self',
        luckyElements: { color: 'Purple', number: 7, direction: 'Center' },
        detailedBreakdown: {
          strengths: ['Deep spiritual insights', 'Strong intuition'],
          challenges: ['Overthinking possible'],
          opportunities: ['Spiritual practices', 'Inner transformation'],
          remedies: ['Morning meditation', 'Chant OM'],
        },
      },
    ];

    return {
      date: new Date().toISOString(),
      rashi,
      overall: 'Today is a balanced day with positive energies flowing. Focus on maintaining harmony in all areas of life.',
      overallIntensity: 'high',
      predictions,
      summary: 'The cosmic energies favor growth, connection, and spiritual awareness today.',
      keyHighlights: [
        'Strong spiritual alignment',
        'Harmonious relationships',
        'Career recognition',
      ],
    };
  }

  async getWeeklyPrediction(rashi: string): Promise<WeeklyPrediction> {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    return {
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
      theme: 'Growth and Transformation',
      themeIntensity: 'high',
      predictions: [
        {
          category: 'love',
          prediction: 'This week strengthens bonds and deepens connections. Communication is key.',
          score: 82,
          intensity: 'high',
          tags: this.generateTags('love', 82),
          advice: 'Communicate openly with your partner',
        },
        {
          category: 'career',
          prediction: 'Professional progress is evident. New opportunities emerge mid-week.',
          score: 85,
          intensity: 'high',
          tags: this.generateTags('career', 85),
          advice: 'Network and showcase your skills',
        },
        {
          category: 'money',
          prediction: 'Financial planning pays off. Stability increases with careful management.',
          score: 78,
          intensity: 'medium',
          tags: this.generateTags('money', 78),
          advice: 'Review and optimize your budget',
        },
        {
          category: 'health',
          prediction: 'Wellness focus brings vitality and energy. Maintain regular exercise.',
          score: 80,
          intensity: 'high',
          tags: this.generateTags('health', 80),
          advice: 'Maintain regular exercise and nutrition',
        },
        {
          category: 'spiritual',
          prediction: 'Spiritual insights guide your path forward. Deep meditation brings clarity.',
          score: 90,
          intensity: 'high',
          tags: this.generateTags('spiritual', 90),
          advice: 'Practice daily meditation and reflection',
        },
      ],
      keyEvents: [
        'Important decision point mid-week',
        'Favorable time for new beginnings',
        'Relationship milestone opportunity',
      ],
      focusAreas: ['Career Development', 'Relationship Harmony', 'Spiritual Growth'],
    };
  }

  async getMonthlyPrediction(rashi: string): Promise<MonthlyPrediction> {
    const now = new Date();
    return {
      month: now.toLocaleString('default', { month: 'long' }),
      year: now.getFullYear(),
      theme: 'Expansion and Opportunity',
      themeIntensity: 'high',
      predictions: [
        {
          category: 'love',
          prediction: 'This month brings deeper connections and relationship growth. Nurture bonds with care.',
          score: 85,
          intensity: 'high',
          tags: this.generateTags('love', 85),
          advice: 'Nurture your relationships with care and attention',
        },
        {
          category: 'career',
          prediction: 'Career advancement opportunities present themselves. Take calculated risks.',
          score: 88,
          intensity: 'high',
          tags: this.generateTags('career', 88),
          advice: 'Take calculated risks and pursue your goals',
        },
        {
          category: 'money',
          prediction: 'Financial stability improves with careful planning. Investment opportunities arise.',
          score: 80,
          intensity: 'high',
          tags: this.generateTags('money', 80),
          advice: 'Invest wisely and save for future goals',
        },
        {
          category: 'health',
          prediction: 'Overall wellness is maintained with proper care. Focus on preventive measures.',
          score: 82,
          intensity: 'high',
          tags: this.generateTags('health', 82),
          advice: 'Prioritize self-care and preventive measures',
        },
        {
          category: 'spiritual',
          prediction: 'Spiritual growth accelerates this month. Deepen your practices and seek guidance.',
          score: 90,
          intensity: 'high',
          tags: this.generateTags('spiritual', 90),
          advice: 'Deepen your spiritual practices and seek guidance',
        },
      ],
      focusAreas: ['Career Development', 'Relationship Harmony', 'Spiritual Growth'],
      majorTransits: [
        'Jupiter enters favorable position',
        'Venus-Mars conjunction',
        'Saturn aspect on career house',
      ],
    };
  }
}

export const predictionEngine = new PredictionEngine();
