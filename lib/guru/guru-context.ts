/**
 * Guru Context Builder
 * 
 * MEGA BUILD 1 - Phase 7 Core
 * Builds context summaries and derives modes from questions
 */

import type { AstroContext, AstroBirthData } from '@/lib/engines/astro-types'

export type GuruMode = 'general' | 'kundali' | 'numerology' | 'predictions' | 'remedies' | 'business' | 'career' | 'compatibility'

/**
 * Build a short context summary for Guru system prompt
 */
export function buildGuruContext(params: {
  userId: string | null
  astroContext?: AstroContext | null
  birthDataOverride?: AstroBirthData
  userName?: string
  gender?: string
}): string {
  const { astroContext, userName, gender } = params

  let context = ''

  // User profile
  if (userName) {
    context += `User: ${userName}`
    if (gender) {
      context += ` (${gender})`
    }
    context += '\n'
  }

  // Astro context summary
  if (astroContext) {
    const { coreChart, dasha, timeline } = astroContext

    context += `Astrological Profile:\n`
    context += `- Ascendant: ${coreChart.ascendantSign}\n`
    context += `- Moon Sign: ${coreChart.moonSign}\n`
    context += `- Sun Sign: ${coreChart.sunSign}\n`

    // Current dasha
    context += `- Current Dasha: ${dasha.currentMahadasha.planet} Mahadasha, ${dasha.currentAntardasha.planet} Antardasha\n`

    // Upcoming peaks (next 1-2 events)
    if (dasha.next3Events.length > 0) {
      const nextEvent = dasha.next3Events[0]
      context += `- Upcoming: ${nextEvent.planet} period starting ${new Date(nextEvent.from).toLocaleDateString()} - ${nextEvent.theme}\n`
    }

    // Key timeline events
    if (timeline.length > 0) {
      const nextEvent = timeline[0]
      context += `- Next Focus: ${nextEvent.focusArea} (${nextEvent.intensity}/5 intensity) - ${nextEvent.summary.substring(0, 100)}\n`
    }

    // Personality tags
    if (astroContext.personalityTags.length > 0) {
      context += `- Traits: ${astroContext.personalityTags.join(', ')}\n`
    }
  } else {
    context += 'Astrological Profile: Not available (user may not have completed onboarding)\n'
  }

  return context
}

/**
 * Derive Guru mode from user question
 */
export function deriveGuruModeFromQuestion(message: string): GuruMode {
  const lower = message.toLowerCase()

  // Check for specific keywords
  if (lower.match(/\b(kundali|chart|birth chart|horoscope|rashi|nakshatra|planets?|houses?)\b/)) {
    return 'kundali'
  }

  if (lower.match(/\b(numerology|life path|destiny number|expression number|number)\b/)) {
    return 'numerology'
  }

  if (lower.match(/\b(prediction|forecast|future|what will|what's going to|upcoming)\b/)) {
    return 'predictions'
  }

  if (lower.match(/\b(remedy|solution|problem|fix|help with|mantra|gemstone|ritual)\b/)) {
    return 'remedies'
  }

  if (lower.match(/\b(business|startup|venture|entrepreneur|company)\b/)) {
    return 'business'
  }

  if (lower.match(/\b(career|job|work|profession|occupation|salary|promotion)\b/)) {
    return 'career'
  }

  if (lower.match(/\b(compatibility|partner|marriage|relationship|love|match)\b/)) {
    return 'compatibility'
  }

  return 'general'
}

