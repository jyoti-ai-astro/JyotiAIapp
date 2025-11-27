/**
 * Insight Injector
 * 
 * Phase 3 — Section 31: PAGES PHASE 16 (F31)
 * 
 * Dynamically injects insights into Guru responses
 */

import { GuruContext } from '@/lib/ai/guruPrompt';

export interface Insight {
  type: 'kundali' | 'numerology' | 'aura' | 'prediction';
  title: string;
  content: string;
}

/**
 * Inject Kundali insights if relevant
 */
export function injectKundaliInsights(
  response: string,
  context?: GuruContext
): { response: string; insights: Insight[] } {
  const insights: Insight[] = [];

  if (!context?.kundali) {
    return { response, insights };
  }

  // Check if response mentions astrology-related topics
  const lowerResponse = response.toLowerCase();
  const isRelevant = lowerResponse.includes('planet') ||
    lowerResponse.includes('astrology') ||
    lowerResponse.includes('birth chart') ||
    lowerResponse.includes('kundali') ||
    lowerResponse.includes('rashi') ||
    lowerResponse.includes('nakshatra');

  if (isRelevant && context.kundali.rashi) {
    insights.push({
      type: 'kundali',
      title: 'Kundali Insight',
      content: `Your ${context.kundali.rashi} Rashi suggests ${getRashiInsight(context.kundali.rashi)}. Your Lagna (${context.kundali.lagna}) indicates your life path, and your Nakshatra (${context.kundali.nakshatra}) reveals your deeper spiritual nature.`,
    });
  }

  return { response, insights };
}

/**
 * Inject Numerology insights if relevant
 */
export function injectNumerologyInsights(
  response: string,
  context?: GuruContext
): { response: string; insights: Insight[] } {
  const insights: Insight[] = [];

  if (!context?.numerology) {
    return { response, insights };
  }

  const lowerResponse = response.toLowerCase();
  const isRelevant = lowerResponse.includes('number') ||
    lowerResponse.includes('numerology') ||
    lowerResponse.includes('life path') ||
    lowerResponse.includes('destiny');

  if (isRelevant) {
    if (context.numerology.lifePath) {
      insights.push({
        type: 'numerology',
        title: 'Numerology Insight',
        content: `Your Life Path number ${context.numerology.lifePath} indicates ${getLifePathInsight(context.numerology.lifePath)}. Combined with your Destiny number ${context.numerology.destiny}, you are on a path of ${getDestinyInsight(context.numerology.destiny)}.`,
      });
    }
  }

  return { response, insights };
}

/**
 * Inject Aura/Chakra insights if relevant
 */
export function injectAuraInsights(
  response: string,
  context?: GuruContext
): { response: string; insights: Insight[] } {
  const insights: Insight[] = [];

  if (!context?.aura) {
    return { response, insights };
  }

  const lowerResponse = response.toLowerCase();
  const isRelevant = lowerResponse.includes('energy') ||
    lowerResponse.includes('chakra') ||
    lowerResponse.includes('aura') ||
    lowerResponse.includes('vibration');

  if (isRelevant) {
    const weakChakras = context.aura.chakraStrengths
      ?.filter(c => c.strength < 6)
      .map(c => c.name) || [];
    const strongChakras = context.aura.chakraStrengths
      ?.filter(c => c.strength >= 7)
      .map(c => c.name) || [];

    insights.push({
      type: 'aura',
      title: 'Aura & Chakra Insight',
      content: `Your ${context.aura.dominantColor} aura reflects your current energy state. ${strongChakras.length > 0 ? `Your ${strongChakras.join(', ')} chakra${strongChakras.length > 1 ? 's are' : ' is'} strong and balanced.` : ''} ${weakChakras.length > 0 ? `Focus on balancing your ${weakChakras.join(', ')} chakra${weakChakras.length > 1 ? 's' : ''} through meditation and energy work.` : 'Your chakras are generally balanced.'}`,
    });
  }

  return { response, insights };
}

/**
 * Inject prediction hooks if relevant
 */
export function injectPredictionHooks(
  response: string,
  context?: GuruContext
): { response: string; insights: Insight[] } {
  const insights: Insight[] = [];

  const lowerResponse = response.toLowerCase();
  const predictionTopics: { [key: string]: string } = {
    'love': 'love and relationships',
    'money': 'financial matters',
    'career': 'career and profession',
    'health': 'health and wellness',
  };

  for (const [topic, label] of Object.entries(predictionTopics)) {
    if (lowerResponse.includes(topic) || lowerResponse.includes(label)) {
      insights.push({
        type: 'prediction',
        title: `${topic.charAt(0).toUpperCase() + topic.slice(1)} Prediction`,
        content: getPredictionInsight(topic, context),
      });
      break; // Only one prediction insight per response
    }
  }

  return { response, insights };
}

/**
 * Apply all insight injectors
 */
export function injectAllInsights(
  response: string,
  context?: GuruContext
): { response: string; insights: Insight[] } {
  let finalResponse = response;
  const allInsights: Insight[] = [];

  // Inject all types of insights
  const kundali = injectKundaliInsights(finalResponse, context);
  finalResponse = kundali.response;
  allInsights.push(...kundali.insights);

  const numerology = injectNumerologyInsights(finalResponse, context);
  finalResponse = numerology.response;
  allInsights.push(...numerology.insights);

  const aura = injectAuraInsights(finalResponse, context);
  finalResponse = aura.response;
  allInsights.push(...aura.insights);

  const predictions = injectPredictionHooks(finalResponse, context);
  finalResponse = predictions.response;
  allInsights.push(...predictions.insights);

  return { response: finalResponse, insights: allInsights };
}

// Helper functions

function getRashiInsight(rashi: string): string {
  const insights: { [key: string]: string } = {
    'Aries': 'leadership qualities and dynamic energy',
    'Taurus': 'stability and material abundance',
    'Gemini': 'communication skills and adaptability',
    'Cancer': 'emotional depth and nurturing nature',
    'Leo': 'creative expression and confidence',
    'Virgo': 'analytical mind and service orientation',
    'Scorpio': 'transformative power and intensity',
    'Sagittarius': 'philosophical wisdom and exploration',
    'Capricorn': 'ambition and disciplined approach',
    'Aquarius': 'innovation and humanitarian values',
    'Pisces': 'intuitive wisdom and spiritual connection',
  };
  return insights[rashi] || 'unique cosmic qualities';
}

function getLifePathInsight(lifePath: number): string {
  const insights: { [key: number]: string } = {
    1: 'leadership and independence',
    2: 'cooperation and harmony',
    3: 'creativity and expression',
    4: 'stability and structure',
    5: 'freedom and adventure',
    6: 'nurturing and responsibility',
    7: 'spiritual seeking and introspection',
    8: 'material success and power',
    9: 'universal love and service',
  };
  return insights[lifePath] || 'unique life purpose';
}

function getDestinyInsight(destiny: number): string {
  const insights: { [key: number]: string } = {
    1: 'pioneering and achievement',
    2: 'partnership and balance',
    3: 'artistic expression',
    4: 'building and organization',
    5: 'exploration and change',
    6: 'healing and care',
    7: 'wisdom and understanding',
    8: 'abundance and authority',
    9: 'compassion and completion',
  };
  return insights[destiny] || 'divine purpose';
}

function getPredictionInsight(topic: string, context?: GuruContext): string {
  // Safe, probability-based predictions
  const baseInsights: { [key: string]: string } = {
    'love': 'The cosmic energies suggest positive developments in relationships. Focus on self-love first, and the universe will align romantic opportunities. Timing is influenced by planetary transits, so remain patient and open.',
    'money': 'Financial growth is indicated through disciplined efforts and alignment with your cosmic blueprint. Avoid impulsive decisions and trust in gradual, sustainable progress.',
    'career': 'Your professional path shows potential for growth and recognition. Stay aligned with your true purpose, and opportunities will manifest at the right time.',
    'health': 'Wellness is supported by maintaining balance in all aspects of life. Focus on holistic health—physical, mental, and spiritual alignment.',
  };

  let insight = baseInsights[topic] || 'The cosmic energies are aligning in your favor. Trust the divine timing.';

  // Add context-specific information
  if (context?.kundali?.rashi) {
    insight += ` Your ${context.kundali.rashi} energy supports this area.`;
  }

  return insight;
}

