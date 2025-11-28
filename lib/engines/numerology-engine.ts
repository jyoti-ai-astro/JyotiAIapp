/**
 * Numerology Engine
 * 
 * Mock Numerology calculation engine
 */

export interface NumerologyData {
  lifePath: {
    number: number;
    description: string;
    traits: string[];
  };
  destiny: {
    number: number;
    description: string;
  };
  soul: {
    number: number;
    description: string;
  };
  personality: {
    number: number;
    description: string;
  };
  expression: {
    number: number;
    description: string;
  };
  personalYear: {
    number: number;
    description: string;
  };
  luckyNumbers: number[];
  luckyColors: string[];
  luckyDays: string[];
}

class NumerologyEngine {
  async calculateNumerology(name: string, dob: string): Promise<NumerologyData> {
    // Mock calculations
    const lifePathNumber = this.calculateLifePath(dob);
    const destinyNumber = this.calculateDestiny(name);
    const soulNumber = this.calculateSoul(name);
    const personalityNumber = this.calculatePersonality(name);
    const expressionNumber = this.calculateExpression(name);
    const personalYear = this.calculatePersonalYear(dob);

    return {
      lifePath: {
        number: lifePathNumber,
        description: this.getLifePathDescription(lifePathNumber),
        traits: this.getLifePathTraits(lifePathNumber),
      },
      destiny: {
        number: destinyNumber,
        description: this.getDestinyDescription(destinyNumber),
      },
      soul: {
        number: soulNumber,
        description: this.getSoulDescription(soulNumber),
      },
      personality: {
        number: personalityNumber,
        description: this.getPersonalityDescription(personalityNumber),
      },
      expression: {
        number: expressionNumber,
        description: this.getExpressionDescription(expressionNumber),
      },
      personalYear: {
        number: personalYear,
        description: this.getPersonalYearDescription(personalYear),
      },
      luckyNumbers: [lifePathNumber, destinyNumber, soulNumber],
      luckyColors: this.getLuckyColors(lifePathNumber),
      luckyDays: this.getLuckyDays(lifePathNumber),
    };
  }

  private calculateLifePath(dob: string): number {
    // Mock: sum of date digits reduced to single digit
    const date = new Date(dob);
    const sum = date.getDate() + date.getMonth() + 1 + date.getFullYear();
    return this.reduceToSingleDigit(sum);
  }

  private calculateDestiny(name: string): number {
    // Mock: sum of name letter values
    const values: Record<string, number> = {
      a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
      j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
      s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8,
    };
    const sum = name.toLowerCase().split('').reduce((acc, char) => {
      return acc + (values[char] || 0);
    }, 0);
    return this.reduceToSingleDigit(sum);
  }

  private calculateSoul(name: string): number {
    // Mock: vowels only
    const vowels = name.toLowerCase().match(/[aeiou]/g) || [];
    const values: Record<string, number> = { a: 1, e: 5, i: 9, o: 6, u: 3 };
    const sum = vowels.reduce((acc, char) => acc + (values[char] || 0), 0);
    return this.reduceToSingleDigit(sum);
  }

  private calculatePersonality(name: string): number {
    // Mock: consonants only
    const consonants = name.toLowerCase().match(/[bcdfghjklmnpqrstvwxyz]/g) || [];
    const values: Record<string, number> = {
      b: 2, c: 3, d: 4, f: 6, g: 7, h: 8, j: 1, k: 2, l: 3,
      m: 4, n: 5, p: 7, q: 8, r: 9, s: 1, t: 2, v: 4, w: 5, x: 6, y: 7, z: 8,
    };
    const sum = consonants.reduce((acc, char) => acc + (values[char] || 0), 0);
    return this.reduceToSingleDigit(sum);
  }

  private calculateExpression(name: string): number {
    // Mock: full name value
    return this.calculateDestiny(name);
  }

  private calculatePersonalYear(dob: string): number {
    const date = new Date(dob);
    const currentYear = new Date().getFullYear();
    const sum = date.getDate() + date.getMonth() + 1 + currentYear;
    return this.reduceToSingleDigit(sum);
  }

  private reduceToSingleDigit(num: number): number {
    while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
      num = num.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
    }
    return num;
  }

  private getLifePathDescription(num: number): string {
    const descriptions: Record<number, string> = {
      1: 'Natural leader, independent, pioneering spirit',
      2: 'Cooperative, diplomatic, peacemaker',
      3: 'Creative, expressive, joyful communicator',
      4: 'Practical, organized, builder of foundations',
      5: 'Adventurous, freedom-loving, explorer',
      6: 'Nurturing, responsible, caregiver',
      7: 'Spiritual, analytical, seeker of truth',
      8: 'Ambitious, material success, power',
      9: 'Humanitarian, compassionate, universal love',
    };
    return descriptions[num] || 'Unique spiritual path';
  }

  private getLifePathTraits(num: number): string[] {
    const traits: Record<number, string[]> = {
      1: ['Leadership', 'Independence', 'Innovation'],
      2: ['Cooperation', 'Diplomacy', 'Balance'],
      3: ['Creativity', 'Expression', 'Joy'],
      4: ['Stability', 'Organization', 'Practicality'],
      5: ['Freedom', 'Adventure', 'Versatility'],
      6: ['Nurturing', 'Responsibility', 'Harmony'],
      7: ['Spirituality', 'Analysis', 'Wisdom'],
      8: ['Ambition', 'Material Success', 'Authority'],
      9: ['Humanitarianism', 'Compassion', 'Universal Love'],
    };
    return traits[num] || ['Unique', 'Spiritual', 'Individual'];
  }

  private getDestinyDescription(num: number): string {
    return `Your destiny number ${num} reveals your life's purpose and ultimate goals.`;
  }

  private getSoulDescription(num: number): string {
    return `Your soul number ${num} represents your inner desires and what truly motivates you.`;
  }

  private getPersonalityDescription(num: number): string {
    return `Your personality number ${num} shows how others perceive you.`;
  }

  private getExpressionDescription(num: number): string {
    return `Your expression number ${num} indicates your natural talents and abilities.`;
  }

  private getPersonalYearDescription(num: number): string {
    return `This is a ${num} personal year, bringing specific energies and opportunities.`;
  }

  private getLuckyColors(num: number): string[] {
    const colors: Record<number, string[]> = {
      1: ['Red', 'Orange'],
      2: ['White', 'Silver'],
      3: ['Yellow', 'Gold'],
      4: ['Green', 'Brown'],
      5: ['Blue', 'Turquoise'],
      6: ['Pink', 'Rose'],
      7: ['Purple', 'Violet'],
      8: ['Black', 'Gray'],
      9: ['Crimson', 'Maroon'],
    };
    return colors[num] || ['Gold', 'White'];
  }

  private getLuckyDays(num: number): string[] {
    const days: Record<number, string[]> = {
      1: ['Sunday', 'Monday'],
      2: ['Monday', 'Friday'],
      3: ['Thursday', 'Friday'],
      4: ['Saturday', 'Sunday'],
      5: ['Wednesday', 'Friday'],
      6: ['Friday', 'Saturday'],
      7: ['Monday', 'Sunday'],
      8: ['Saturday', 'Tuesday'],
      9: ['Tuesday', 'Thursday'],
    };
    return days[num] || ['Friday', 'Sunday'];
  }
}

export const numerologyEngine = new NumerologyEngine();

