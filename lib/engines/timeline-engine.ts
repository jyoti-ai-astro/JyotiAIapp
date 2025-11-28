/**
 * Timeline Engine - Full 12-Month Expansion
 * 
 * Expanded event map with transits, personal events, auspicious periods, challenging windows
 */

export type EventType = 'transit' | 'personal' | 'auspicious' | 'challenging';
export type EventCategory = 'career' | 'love' | 'health' | 'spiritual' | 'finance';
export type ImpactLevel = 'positive' | 'neutral' | 'challenging';
export type EnergyLevel = 'high' | 'medium' | 'low';

export interface TimelineEvent {
  id: string;
  date: string;
  planet?: string;
  event: string;
  type: EventType;
  impact: ImpactLevel;
  category: EventCategory;
  description: string;
  intensity: EnergyLevel;
  remedies?: string[];
  significance?: string;
}

export interface MonthTimeline {
  month: string;
  year: number;
  monthNumber: number;
  events: TimelineEvent[];
  prediction: string;
  overallEnergy: EnergyLevel;
  focusAreas: string[];
  auspiciousPeriods: { start: string; end: string; description: string }[];
  challengingPeriods: { start: string; end: string; description: string }[];
  majorTransits: string[];
  personalMilestones: string[];
}

class TimelineEngine {
  private generateEventId(month: number, index: number): string {
    return `event-${month}-${index}`;
  }

  private getEventColor(type: EventType, impact: ImpactLevel): string {
    if (type === 'auspicious' || impact === 'positive') return 'text-green-400';
    if (type === 'challenging' || impact === 'challenging') return 'text-red-400';
    return 'text-yellow-400';
  }

  async generate12MonthTimeline(dob: string, rashi?: string): Promise<MonthTimeline[]> {
    const timeline: MonthTimeline[] = [];
    const currentDate = new Date();

    for (let i = 0; i < 12; i++) {
      const monthDate = new Date(currentDate);
      monthDate.setMonth(monthDate.getMonth() + i);
      const monthNumber = monthDate.getMonth() + 1;

      const events: TimelineEvent[] = [
        {
          id: this.generateEventId(i, 0),
          date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 5).toISOString(),
          planet: 'Jupiter',
          event: 'Jupiter Transit',
          type: 'transit',
          impact: 'positive',
          category: 'spiritual',
          description: 'Favorable period for growth and expansion. Spiritual insights deepen.',
          intensity: 'high',
          remedies: ['Chant Guru mantras', 'Wear yellow gemstone'],
          significance: 'Major spiritual growth period',
        },
        {
          id: this.generateEventId(i, 1),
          date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 10).toISOString(),
          planet: 'Venus',
          event: 'Venus Transit',
          type: 'transit',
          impact: 'positive',
          category: 'love',
          description: 'Harmony in relationships and creativity. Love life flourishes.',
          intensity: 'high',
          remedies: ['Wear white clothing', 'Chant Shukra mantras'],
          significance: 'Relationship harmony period',
        },
        {
          id: this.generateEventId(i, 2),
          date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 15).toISOString(),
          planet: 'Saturn',
          event: 'Saturn Aspect',
          type: 'challenging',
          impact: 'challenging',
          category: 'career',
          description: 'Time for discipline and hard work. Challenges bring growth.',
          intensity: 'medium',
          remedies: ['Practice patience', 'Chant Shani mantras'],
          significance: 'Career discipline period',
        },
        {
          id: this.generateEventId(i, 3),
          date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 20).toISOString(),
          event: 'Personal Milestone',
          type: 'personal',
          impact: 'positive',
          category: 'spiritual',
          description: 'Important personal growth moment. Reflect on your journey.',
          intensity: 'high',
          significance: 'Personal transformation',
        },
        {
          id: this.generateEventId(i, 4),
          date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 25).toISOString(),
          planet: 'Mars',
          event: 'Mars Transit',
          type: 'transit',
          impact: 'neutral',
          category: 'health',
          description: 'Energy levels fluctuate. Maintain wellness routine.',
          intensity: 'medium',
          remedies: ['Regular exercise', 'Adequate rest'],
          significance: 'Health maintenance period',
        },
      ];

      const predictions = [
        `This month brings opportunities for ${['career growth', 'relationship harmony', 'spiritual development', 'financial stability'][i % 4]}.`,
        `Focus on ${['building foundations', 'nurturing connections', 'self-care', 'learning'][i % 4]} this month.`,
        `The planetary alignments favor ${['new beginnings', 'consolidation', 'exploration', 'reflection'][i % 4]}.`,
      ];

      const auspiciousPeriods = [
        {
          start: new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).toISOString(),
          end: new Date(monthDate.getFullYear(), monthDate.getMonth(), 7).toISOString(),
          description: 'Highly favorable period for new beginnings',
        },
        {
          start: new Date(monthDate.getFullYear(), monthDate.getMonth(), 20).toISOString(),
          end: new Date(monthDate.getFullYear(), monthDate.getMonth(), 27).toISOString(),
          description: 'Good time for important decisions',
        },
      ];

      const challengingPeriods = [
        {
          start: new Date(monthDate.getFullYear(), monthDate.getMonth(), 10).toISOString(),
          end: new Date(monthDate.getFullYear(), monthDate.getMonth(), 16).toISOString(),
          description: 'Requires extra caution and patience',
        },
      ];

      timeline.push({
        month: monthDate.toLocaleString('default', { month: 'long' }),
        year: monthDate.getFullYear(),
        monthNumber,
        events,
        prediction: predictions[i % predictions.length],
        overallEnergy: i % 3 === 0 ? 'high' : i % 3 === 1 ? 'medium' : 'low',
        focusAreas: [
          ['Career', 'Finance'],
          ['Relationships', 'Health'],
          ['Spirituality', 'Personal Growth'],
        ][i % 3],
        auspiciousPeriods,
        challengingPeriods,
        majorTransits: [
          `Jupiter transit in ${['Sagittarius', 'Pisces', 'Aries'][i % 3]}`,
          `Venus-Mars conjunction`,
        ],
        personalMilestones: [
          `Month ${i + 1} personal growth milestone`,
          `Spiritual awakening opportunity`,
        ],
      });
    }

    return timeline;
  }

  getEventColor(type: EventType, impact: ImpactLevel): string {
    return this.getEventColor(type, impact);
  }
}

export const timelineEngine = new TimelineEngine();
