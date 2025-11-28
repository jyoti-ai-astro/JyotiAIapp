/**
 * Spiritual Remedies Engine
 * 
 * Provides mantras, gemstones, colors, and do's/don'ts based on astrological analysis
 */

export interface Mantra {
  name: string;
  deity: string;
  text: string;
  count: number;
  timing: string;
  benefits: string[];
}

export interface Gemstone {
  name: string;
  planet: string;
  color: string;
  finger: string;
  metal: string;
  benefits: string[];
  precautions?: string[];
}

export interface DailyColor {
  color: string;
  day: string;
  planet: string;
  benefits: string[];
  items?: string[];
}

export interface DosAndDonts {
  dos: string[];
  donts: string[];
  category: 'general' | 'love' | 'career' | 'money' | 'health' | 'spiritual';
}

export interface RemedyPackage {
  mantras: Mantra[];
  gemstones: Gemstone[];
  dailyColors: DailyColor[];
  dosAndDonts: DosAndDonts;
  timing: {
    auspicious: string[];
    inauspicious: string[];
  };
}

class RemedyEngine {
  async getRemediesForCategory(category: 'love' | 'career' | 'money' | 'health' | 'spiritual', userData?: any): Promise<RemedyPackage> {
    const mantras: Mantra[] = [];
    const gemstones: Gemstone[] = [];
    const dailyColors: DailyColor[] = [];
    let dosAndDonts: DosAndDonts;

    switch (category) {
      case 'love':
        mantras.push({
          name: 'Venus Mantra',
          deity: 'Goddess Lakshmi',
          text: 'Om Shukraya Namaha',
          count: 108,
          timing: 'Friday morning',
          benefits: ['Harmony in relationships', 'Attract love', 'Enhance beauty'],
        });
        gemstones.push({
          name: 'Diamond',
          planet: 'Venus',
          color: 'White/Colorless',
          finger: 'Ring finger',
          metal: 'Silver or White Gold',
          benefits: ['Strengthens relationships', 'Brings harmony', 'Enhances creativity'],
        });
        dailyColors.push({
          color: 'White',
          day: 'Friday',
          planet: 'Venus',
          benefits: ['Relationship harmony', 'Love attraction'],
          items: ['White clothing', 'White flowers'],
        });
        dosAndDonts = {
          category: 'love',
          dos: [
            'Express gratitude to your partner',
            'Spend quality time together',
            'Practice open communication',
            'Wear white on Fridays',
          ],
          donts: [
            'Avoid conflicts on Fridays',
            'Don\'t ignore your partner\'s feelings',
            'Avoid negative thoughts about relationships',
          ],
        };
        break;

      case 'career':
        mantras.push({
          name: 'Saturn Mantra',
          deity: 'Lord Shani',
          text: 'Om Sham Shanicharaya Namaha',
          count: 108,
          timing: 'Saturday evening',
          benefits: ['Career stability', 'Remove obstacles', 'Professional growth'],
        });
        gemstones.push({
          name: 'Blue Sapphire',
          planet: 'Saturn',
          color: 'Blue',
          finger: 'Middle finger',
          metal: 'Silver or Iron',
          benefits: ['Career success', 'Discipline', 'Long-term stability'],
          precautions: ['Must be tested before wearing', 'Consult astrologer'],
        });
        dailyColors.push({
          color: 'Blue/Black',
          day: 'Saturday',
          planet: 'Saturn',
          benefits: ['Career growth', 'Remove obstacles'],
          items: ['Blue clothing', 'Black sesame seeds'],
        });
        dosAndDonts = {
          category: 'career',
          dos: [
            'Work with discipline',
            'Take on leadership roles',
            'Network with professionals',
            'Wear blue on Saturdays',
          ],
          donts: [
            'Avoid laziness',
            'Don\'t ignore deadlines',
            'Avoid negative workplace gossip',
          ],
        };
        break;

      case 'money':
        mantras.push({
          name: 'Lakshmi Mantra',
          deity: 'Goddess Lakshmi',
          text: 'Om Shreem Mahalakshmiyei Namaha',
          count: 108,
          timing: 'Friday morning',
          benefits: ['Wealth attraction', 'Financial stability', 'Prosperity'],
        });
        gemstones.push({
          name: 'Yellow Sapphire',
          planet: 'Jupiter',
          color: 'Yellow',
          finger: 'Index finger',
          metal: 'Gold',
          benefits: ['Wealth and prosperity', 'Financial growth', 'Wisdom'],
        });
        dailyColors.push({
          color: 'Yellow/Gold',
          day: 'Thursday',
          planet: 'Jupiter',
          benefits: ['Financial growth', 'Wealth attraction'],
          items: ['Yellow clothing', 'Turmeric'],
        });
        dosAndDonts = {
          category: 'money',
          dos: [
            'Donate to charity regularly',
            'Save 20% of income',
            'Invest wisely',
            'Practice gratitude',
          ],
          donts: [
            'Avoid impulsive spending',
            'Don\'t lend money on Tuesdays',
            'Avoid gambling',
          ],
        };
        break;

      case 'health':
        mantras.push({
          name: 'Sun Mantra',
          deity: 'Lord Surya',
          text: 'Om Suryaya Namaha',
          count: 108,
          timing: 'Sunday morning',
          benefits: ['Good health', 'Energy', 'Vitality'],
        });
        gemstones.push({
          name: 'Ruby',
          planet: 'Sun',
          color: 'Red',
          finger: 'Ring finger',
          metal: 'Gold',
          benefits: ['Health and vitality', 'Energy', 'Confidence'],
        });
        dailyColors.push({
          color: 'Red/Orange',
          day: 'Sunday',
          planet: 'Sun',
          benefits: ['Health and energy', 'Vitality'],
          items: ['Red clothing', 'Copper water'],
        });
        dosAndDonts = {
          category: 'health',
          dos: [
            'Exercise regularly',
            'Eat balanced meals',
            'Get adequate sleep',
            'Practice yoga or meditation',
          ],
          donts: [
            'Avoid excessive stress',
            'Don\'t skip meals',
            'Avoid late-night eating',
          ],
        };
        break;

      case 'spiritual':
        mantras.push({
          name: 'Om Mantra',
          deity: 'Universal Consciousness',
          text: 'Om',
          count: 108,
          timing: 'Morning and evening',
          benefits: ['Spiritual growth', 'Inner peace', 'Connection to divine'],
        });
        gemstones.push({
          name: 'Amethyst',
          planet: 'Jupiter',
          color: 'Purple',
          finger: 'Index finger',
          metal: 'Gold or Silver',
          benefits: ['Spiritual awakening', 'Intuition', 'Inner peace'],
        });
        dailyColors.push({
          color: 'Purple/Saffron',
          day: 'Thursday',
          planet: 'Jupiter',
          benefits: ['Spiritual growth', 'Wisdom'],
          items: ['Purple clothing', 'Saffron'],
        });
        dosAndDonts = {
          category: 'spiritual',
          dos: [
            'Meditate daily',
            'Practice gratitude',
            'Read spiritual texts',
            'Connect with nature',
          ],
          donts: [
            'Avoid negative thoughts',
            'Don\'t skip spiritual practices',
            'Avoid excessive materialism',
          ],
        };
        break;
    }

    return {
      mantras,
      gemstones,
      dailyColors,
      dosAndDonts,
      timing: {
        auspicious: ['Early morning', 'Sunset', 'Full moon days'],
        inauspicious: ['Midnight', 'Eclipse periods'],
      },
    };
  }

  async getRemediesForPrediction(predictionCategory: string, intensity: string): Promise<RemedyPackage> {
    // Map prediction category to remedy category
    const categoryMap: Record<string, 'love' | 'career' | 'money' | 'health' | 'spiritual'> = {
      love: 'love',
      career: 'career',
      money: 'money',
      health: 'health',
      spiritual: 'spiritual',
    };

    const category = categoryMap[predictionCategory] || 'spiritual';
    return this.getRemediesForCategory(category);
  }
}

export const remedyEngine = new RemedyEngine();

