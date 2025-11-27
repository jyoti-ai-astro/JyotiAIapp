/**
 * Remedy Engine
 * 
 * Phase 3 — Section 31: PAGES PHASE 16 (F31)
 * 
 * Generates spiritual remedies based on context
 */

import { GuruContext } from '@/lib/ai/guruPrompt';

export interface Remedy {
  type: 'mantra' | 'color' | 'direction' | 'gemstone';
  title: string;
  description: string;
  instruction: string;
  frequency?: string;
  duration?: string;
}

/**
 * Generate Mantra Remedy based on context
 */
export function generateMantraRemedy(context?: GuruContext): Remedy | null {
  if (!context) return null;

  // Kundali-based mantras
  if (context.kundali?.rashi) {
    const rashiMantras: { [key: string]: string } = {
      'Aries': 'Om Mangalam Bhagavan Vishnu',
      'Taurus': 'Om Namo Bhagavate Vasudevaya',
      'Gemini': 'Om Namah Shivaya',
      'Cancer': 'Om Gam Ganapataye Namaha',
      'Leo': 'Om Suryaya Namaha',
      'Virgo': 'Om Shanti Shanti Shanti',
      'Scorpio': 'Om Namah Shivaya',
      'Sagittarius': 'Om Ganeshaya Namaha',
      'Capricorn': 'Om Shani Devaya Namaha',
      'Aquarius': 'Om Namo Narayanaya',
      'Pisces': 'Om Namo Bhagavate Vasudevaya',
    };

    const mantra = rashiMantras[context.kundali.rashi] || 'Om';
    return {
      type: 'mantra',
      title: 'Mantra Remedy',
      description: `Chant this mantra daily to align with your ${context.kundali.rashi} energy`,
      instruction: `Chant "${mantra}" 108 times every morning`,
      frequency: 'Daily',
      duration: '21 days minimum',
    };
  }

  // Numerology-based mantras
  if (context.numerology?.lifePath) {
    const numberMantras: { [key: number]: string } = {
      1: 'Om',
      2: 'Om Shanti',
      3: 'Om Namah Shivaya',
      4: 'Om Gam Ganapataye Namaha',
      5: 'Om Namo Narayanaya',
      6: 'Om Shree Mahalakshmiyei Namaha',
      7: 'Om Namo Bhagavate Vasudevaya',
      8: 'Om Shani Devaya Namaha',
      9: 'Om Ganeshaya Namaha',
    };

    const mantra = numberMantras[context.numerology.lifePath] || 'Om';
    return {
      type: 'mantra',
      title: 'Mantra Remedy',
      description: `This mantra resonates with your Life Path number ${context.numerology.lifePath}`,
      instruction: `Chant "${mantra}" 108 times daily`,
      frequency: 'Daily',
      duration: '40 days',
    };
  }

  return null;
}

/**
 * Generate Color Remedy based on context
 */
export function generateColorRemedy(context?: GuruContext): Remedy | null {
  if (!context) return null;

  // Aura-based colors
  if (context.aura?.dominantColor) {
    const colorGuidance: { [key: string]: string } = {
      'Red': 'Wear red for energy and passion. Avoid on Mondays.',
      'Orange': 'Wear orange for creativity and joy. Best on Tuesdays.',
      'Yellow': 'Wear yellow for intellect and communication. Best on Wednesdays.',
      'Green': 'Wear green for healing and growth. Best on Thursdays.',
      'Blue': 'Wear blue for peace and communication. Best on Fridays.',
      'Indigo': 'Wear indigo for intuition and wisdom. Best on Saturdays.',
      'Violet': 'Wear violet for spirituality and transformation. Best on Sundays.',
    };

    const guidance = colorGuidance[context.aura.dominantColor] || 'Wear colors that align with your chakra';
    return {
      type: 'color',
      title: 'Color Remedy',
      description: `Your dominant aura color is ${context.aura.dominantColor}`,
      instruction: guidance,
      frequency: 'As needed',
    };
  }

  // Kundali-based colors
  if (context.kundali?.rashi) {
    const rashiColors: { [key: string]: string } = {
      'Aries': 'Red, Orange',
      'Taurus': 'Pink, Green',
      'Gemini': 'Yellow, Light Blue',
      'Cancer': 'White, Silver',
      'Leo': 'Gold, Orange',
      'Virgo': 'Green, Brown',
      'Scorpio': 'Red, Black',
      'Sagittarius': 'Purple, Blue',
      'Capricorn': 'Black, Brown',
      'Aquarius': 'Blue, Electric Blue',
      'Pisces': 'Sea Green, White',
    };

    const colors = rashiColors[context.kundali.rashi] || 'White';
    return {
      type: 'color',
      title: 'Color Remedy',
      description: `Colors aligned with your ${context.kundali.rashi} sign`,
      instruction: `Wear ${colors} colors, especially on auspicious days`,
      frequency: 'Weekly',
    };
  }

  return null;
}

/**
 * Generate Direction Remedy based on context
 */
export function generateDirectionRemedy(context?: GuruContext): Remedy | null {
  if (!context) return null;

  // Numerology-based directions
  if (context.numerology?.lifePath) {
    const directions: { [key: number]: string } = {
      1: 'North',
      2: 'Northeast',
      3: 'East',
      4: 'Southeast',
      5: 'South',
      6: 'Southwest',
      7: 'West',
      8: 'Northwest',
      9: 'North',
    };

    const direction = directions[context.numerology.lifePath] || 'East';
    return {
      type: 'direction',
      title: 'Direction Remedy',
      description: `Auspicious direction for your Life Path number ${context.numerology.lifePath}`,
      instruction: `Face ${direction} during meditation, prayer, or important activities`,
      frequency: 'Daily',
    };
  }

  // Kundali-based directions
  if (context.kundali?.lagna) {
    return {
      type: 'direction',
      title: 'Direction Remedy',
      description: `Based on your Lagna (${context.kundali.lagna})`,
      instruction: 'Face East during morning prayers and meditation',
      frequency: 'Daily',
    };
  }

  return null;
}

/**
 * Generate Gemstone Remedy based on context
 */
export function generateGemstoneRemedy(context?: GuruContext): Remedy | null {
  if (!context) return null;

  // Kundali-based gemstones
  if (context.kundali?.rashi) {
    const gemstones: { [key: string]: string } = {
      'Aries': 'Red Coral',
      'Taurus': 'Diamond',
      'Gemini': 'Emerald',
      'Cancer': 'Pearl',
      'Leo': 'Ruby',
      'Virgo': 'Emerald',
      'Scorpio': 'Red Coral',
      'Sagittarius': 'Yellow Sapphire',
      'Capricorn': 'Blue Sapphire',
      'Aquarius': 'Blue Sapphire',
      'Pisces': 'Yellow Sapphire',
    };

    const gemstone = gemstones[context.kundali.rashi] || 'Quartz';
    return {
      type: 'gemstone',
      title: 'Gemstone Remedy',
      description: `Gemstone aligned with your ${context.kundali.rashi} sign`,
      instruction: `Wear ${gemstone} in a ring or pendant. Cleanse it monthly with water and sunlight.`,
      frequency: 'Wear daily',
      duration: 'Minimum 3 months',
    };
  }

  return null;
}

/**
 * Generate all applicable remedies
 */
export function generateAllRemedies(context?: GuruContext): Remedy[] {
  const remedies: Remedy[] = [];

  const mantra = generateMantraRemedy(context);
  if (mantra) remedies.push(mantra);

  const color = generateColorRemedy(context);
  if (color) remedies.push(color);

  const direction = generateDirectionRemedy(context);
  if (direction) remedies.push(direction);

  const gemstone = generateGemstoneRemedy(context);
  if (gemstone) remedies.push(gemstone);

  return remedies;
}

