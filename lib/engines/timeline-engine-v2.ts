/**
 * Timeline Engine V2
 * 
 * Mega Build 2 - Prediction Engine + Timeline Engine
 * 
 * 12-month timeline engine that returns month-by-month events using AstroContext
 */

import type { AstroContext } from './astro-types'
import { callLLM, safeJsonParse, type LLMMessage } from '@/lib/ai/llm-client'
import { getGuruRagContext } from '@/lib/rag/index'
import type { AstroSignal } from './prediction-engine-v2'

/**
 * Timeline Event - One month's prediction
 */
export interface TimelineEvent {
  id: string
  monthIndex: number // 0..11
  monthLabel: string // e.g. "Jan 2026"
  theme: string // e.g. "Career growth", "Relationship focus"
  description: string
  intensity: 'low' | 'medium' | 'high'
  focusAreas: string[] // ["career", "finance"]
  recommendedActions: string[]
  cautions: string[]
  astroSignals: AstroSignal[] // reuse from prediction-engine
}

/**
 * Timeline Engine Result
 */
export interface TimelineEngineResult {
  status: 'ok' | 'degraded' | 'error'
  overview: string
  events: TimelineEvent[]
  disclaimers: string[]
  usedRag: boolean
  usedAstroContext: boolean
}

/**
 * Run Timeline Engine
 */
export async function runTimelineEngine(params: {
  astroContext: AstroContext | null
  startDate?: Date // default: now
  months?: number // default: 12
  ragMode?: 'none' | 'light' | 'full'
  signal?: AbortSignal
}): Promise<TimelineEngineResult> {
  const { astroContext, startDate = new Date(), months = 12, ragMode = 'light', signal } = params

  let status: 'ok' | 'degraded' | 'error' = 'ok'
  let usedAstroContext = false
  let usedRag = false

  // Generate month labels
  const monthLabels: string[] = []
  for (let i = 0; i < months; i++) {
    const monthDate = new Date(startDate)
    monthDate.setMonth(monthDate.getMonth() + i)
    monthLabels.push(
      monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    )
  }

  // If astroContext is missing, return degraded with generic month-by-month themes
  if (!astroContext) {
    const genericEvents: TimelineEvent[] = monthLabels.map((label, index) => ({
      id: `month-${index}`,
      monthIndex: index,
      monthLabel: label,
      theme: ['Growth Period', 'Transformation', 'Stability', 'Expansion'][index % 4],
      description: `This month brings opportunities for personal growth and spiritual development. Focus on maintaining balance in all areas of life.`,
      intensity: index % 3 === 0 ? 'high' : index % 3 === 1 ? 'medium' : 'low',
      focusAreas: ['general', 'spiritual'],
      recommendedActions: ['Practice mindfulness', 'Set clear intentions', 'Stay adaptable'],
      cautions: ['Avoid hasty decisions', 'Maintain balance'],
      astroSignals: [],
    }))

    return {
      status: 'degraded',
      overview:
        'Based on general astrological principles, the next 12 months offer a journey of growth and transformation. Each month presents unique opportunities for spiritual and personal development.',
      events: genericEvents,
      disclaimers: [
        'These timeline predictions are general guidance based on astrological principles.',
        'Individual results may vary. Consult professionals for medical, legal, or financial advice.',
        'These insights are for spiritual guidance only, not absolute certainty.',
      ],
      usedRag: false,
      usedAstroContext: false,
    }
  }

  usedAstroContext = true

  // Build astro context summary
  const astroSummary = buildTimelineAstroSummary(astroContext, monthLabels)

  // Get RAG context if enabled
  let ragContext = ''
  if (ragMode !== 'none') {
    try {
      const ragResult = await getGuruRagContext({
        mode: 'general',
        question: 'What are the key astrological events and themes for the next 12 months?',
        astroContextSummary: astroSummary,
        topK: ragMode === 'full' ? 10 : 5,
        signal,
      })

      if (ragResult.chunks.length > 0) {
        ragContext = ragResult.chunks
          .map((chunk) => {
            const title = chunk.title ? `[${chunk.title}]` : '[Knowledge]'
            return `${title}: ${chunk.snippet}`
          })
          .join('\n\n')
        usedRag = true
      }

      if (ragResult.degraded) {
        status = 'degraded'
      }
    } catch (error) {
      console.error('Error retrieving RAG context (degrading gracefully):', error)
      status = status === 'ok' ? 'degraded' : status
    }
  }

  // Build system prompt
  const systemPrompt = buildTimelineSystemPrompt()

  // Build user prompt
  const userPrompt = buildTimelineUserPrompt(astroSummary, ragContext, monthLabels)

  // Call LLM
  let llmResponse = ''
  try {
    const messages: LLMMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]

    llmResponse = await callLLM(messages, signal, {
      temperature: 0.7,
      maxTokens: 4000,
    })

    if (!llmResponse || llmResponse.trim().length === 0) {
      throw new Error('Empty response from LLM')
    }
  } catch (error: any) {
    console.error('Error calling LLM for timeline:', error)
    return {
      status: 'error',
      overview: 'Unable to generate timeline at this time. Please try again later.',
      events: [],
      disclaimers: ['An error occurred while generating timeline. Please try again.'],
      usedRag,
      usedAstroContext,
    }
  }

  // Parse and normalize LLM response
  try {
    const parsed = parseTimelineResponse(llmResponse, monthLabels, astroContext)
    return {
      status,
      ...parsed,
      usedRag,
      usedAstroContext,
    }
  } catch (error) {
    console.error('Error parsing timeline response:', error)
    // Fallback to structured response
    return {
      status: 'degraded',
      overview: 'Based on your astrological chart, the next 12 months present a journey of growth and transformation.',
      events: generateFallbackEvents(monthLabels, astroContext),
      disclaimers: [
        'These timeline predictions are based on astrological principles and should be treated as guidance, not absolute certainty.',
        'Individual results may vary. Consult professionals for medical, legal, or financial advice.',
      ],
      usedRag,
      usedAstroContext,
    }
  }
}

/**
 * Build timeline astro summary
 */
function buildTimelineAstroSummary(astroContext: AstroContext, monthLabels: string[]): string {
  const parts: string[] = []

  // Chart basics
  if (astroContext.coreChart) {
    parts.push(
      `Sun Sign: ${astroContext.coreChart.sunSign}, Moon Sign: ${astroContext.coreChart.moonSign}, Ascendant: ${astroContext.coreChart.ascendantSign}`
    )

    // Key planetary positions
    const keyPlanets = ['Sun', 'Moon', 'Jupiter', 'Venus', 'Saturn', 'Mars']
    for (const planetName of keyPlanets) {
      const planet = astroContext.coreChart.planets.find((p) => p.planet === planetName)
      if (planet) {
        parts.push(`${planetName} in ${planet.sign} (House ${planet.house})`)
      }
    }
  }

  // Dasha progression
  if (astroContext.dasha) {
    parts.push(
      `Current Mahadasha: ${astroContext.dasha.currentMahadasha.planet} (until ${new Date(astroContext.dasha.currentMahadasha.endDate).toLocaleDateString()})`
    )
    parts.push(
      `Current Antardasha: ${astroContext.dasha.currentAntardasha.planet} (until ${new Date(astroContext.dasha.currentAntardasha.endDate).toLocaleDateString()})`
    )

    // Next events
    if (astroContext.dasha.next3Events && astroContext.dasha.next3Events.length > 0) {
      const nextEvents = astroContext.dasha.next3Events
        .slice(0, 3)
        .map((e) => `${e.planet} period starting ${new Date(e.from).toLocaleDateString()}`)
        .join(', ')
      parts.push(`Upcoming Dasha Changes: ${nextEvents}`)
    }
  }

  // Transit events
  if (astroContext.transitEvents && astroContext.transitEvents.length > 0) {
    const transits = astroContext.transitEvents
      .slice(0, 5)
      .map(
        (t) =>
          `${t.planet} in House ${t.house} (${new Date(t.start).toLocaleDateString()} - ${new Date(t.end).toLocaleDateString()}, intensity ${t.intensity}/5)`
      )
      .join('\n')
    parts.push(`Upcoming Transits:\n${transits}`)
  }

  // Life themes
  if (astroContext.lifeThemes && astroContext.lifeThemes.length > 0) {
    const themes = astroContext.lifeThemes
      .slice(0, 3)
      .map((t) => `${t.area} (${t.confidence}% confidence): ${t.summary}`)
      .join('\n')
    parts.push(`Life Themes:\n${themes}`)
  }

  parts.push(`\nTimeline Period: ${monthLabels[0]} to ${monthLabels[monthLabels.length - 1]}`)

  return parts.join('\n')
}

/**
 * Build timeline system prompt
 */
function buildTimelineSystemPrompt(): string {
  return `You are a wise Vedic astrologer providing month-by-month timeline predictions based on astrological charts.

IMPORTANT SAFETY GUIDELINES:
- NEVER provide exact death predictions or specific dates of death
- NEVER provide exact disease diagnoses or medical prescriptions
- NEVER guarantee financial outcomes or investment advice
- ALWAYS emphasize that predictions are guidance, not absolute certainty
- Use phrases like "may suggest", "could indicate", "spiritual guidance suggests"
- When discussing health, always recommend consulting healthcare professionals
- When discussing finances, always recommend consulting financial advisors

Your task:
1. Analyze the astrological context provided
2. Generate month-by-month predictions for the specified months
3. For each month, provide:
   - A theme (e.g. "Career growth", "Relationship focus")
   - A description (2-3 sentences)
   - Intensity level (low, medium, high)
   - Focus areas (e.g. ["career", "finance"])
   - Recommended actions (3-5 bullet points)
   - Cautions (2-3 bullet points)
   - Astro signals (planetary influences for that month)
4. Provide an overall overview (2-3 paragraphs)

Format your response as JSON with this structure:
{
  "overview": "string",
  "events": [
    {
      "monthIndex": 0,
      "monthLabel": "Jan 2026",
      "theme": "Career growth",
      "description": "string",
      "intensity": "high",
      "focusAreas": ["career", "finance"],
      "recommendedActions": ["string"],
      "cautions": ["string"],
      "astroSignals": [
        {
          "label": "Jupiter transit",
          "category": "career",
          "strength": "high",
          "description": "string"
        }
      ]
    }
  ],
  "disclaimers": ["string"]
}

Be specific, actionable, and spiritually uplifting. Consider dasha progression and transit timing.`
}

/**
 * Build timeline user prompt
 */
function buildTimelineUserPrompt(
  astroSummary: string,
  ragContext: string,
  monthLabels: string[]
): string {
  let prompt = `Based on the following astrological context, provide month-by-month timeline predictions for:\n${monthLabels.join(', ')}\n\n${astroSummary}\n\n`

  if (ragContext) {
    prompt += `\nRelevant Knowledge:\n${ragContext}\n\n`
  }

  prompt +=
    'Please provide structured month-by-month predictions. Consider how dasha periods and transits progress over the months. Return your response as valid JSON only.'

  return prompt
}

/**
 * Parse timeline response from LLM
 */
function parseTimelineResponse(
  llmResponse: string,
  monthLabels: string[],
  astroContext: AstroContext
): Omit<TimelineEngineResult, 'status' | 'usedRag' | 'usedAstroContext'> {
  // Try to extract JSON from response
  const jsonMatch = llmResponse.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        overview: parsed.overview || 'Based on your astrological chart, the next 12 months present a journey of growth.',
        events: normalizeTimelineEvents(parsed.events || [], monthLabels, astroContext),
        disclaimers: parsed.disclaimers || getDefaultTimelineDisclaimers(),
      }
    } catch (error) {
      console.error('Error parsing JSON from LLM response:', error)
    }
  }

  // Fallback: generate from text
  return {
    overview: extractOverviewFromText(llmResponse),
    events: generateFallbackEvents(monthLabels, astroContext),
    disclaimers: getDefaultTimelineDisclaimers(),
  }
}

/**
 * Normalize timeline events
 */
function normalizeTimelineEvents(
  events: any[],
  monthLabels: string[],
  astroContext: AstroContext
): TimelineEvent[] {
  const normalized: TimelineEvent[] = []

  for (let i = 0; i < monthLabels.length; i++) {
    const monthLabel = monthLabels[i]
    const event = events.find((e) => e.monthIndex === i || e.monthLabel === monthLabel) || {
      monthIndex: i,
      monthLabel,
      theme: 'Growth Period',
      description: 'This month brings opportunities for personal growth and spiritual development.',
      intensity: 'medium',
      focusAreas: ['general'],
      recommendedActions: [],
      cautions: [],
      astroSignals: [],
    }

    normalized.push({
      id: event.id || `month-${i}`,
      monthIndex: i,
      monthLabel: event.monthLabel || monthLabel,
      theme: event.theme || 'Growth Period',
      description: event.description || '',
      intensity: ['low', 'medium', 'high'].includes(event.intensity) ? event.intensity : 'medium',
      focusAreas: Array.isArray(event.focusAreas) ? event.focusAreas : ['general'],
      recommendedActions: Array.isArray(event.recommendedActions) ? event.recommendedActions : [],
      cautions: Array.isArray(event.cautions) ? event.cautions : [],
      astroSignals: normalizeAstroSignals(event.astroSignals || []),
    })
  }

  return normalized
}

/**
 * Normalize astro signals (reuse from prediction engine)
 */
function normalizeAstroSignals(signals: any[]): AstroSignal[] {
  return signals
    .filter((s) => s.label && s.description)
    .map((s) => ({
      label: s.label,
      category: ['career', 'love', 'money', 'health', 'spiritual', 'general'].includes(s.category)
        ? s.category
        : 'general',
      strength: ['low', 'medium', 'high'].includes(s.strength) ? s.strength : 'medium',
      description: s.description,
    }))
}

/**
 * Generate fallback events
 */
function generateFallbackEvents(monthLabels: string[], astroContext: AstroContext): TimelineEvent[] {
  const events: TimelineEvent[] = []
  const themes = [
    'New Beginnings',
    'Growth & Expansion',
    'Stability & Consolidation',
    'Transformation',
    'Harmony & Balance',
    'Opportunity & Progress',
    'Reflection & Planning',
    'Action & Movement',
    'Integration & Completion',
    'Renewal & Awakening',
    'Wisdom & Understanding',
    'Manifestation & Fulfillment',
  ]

  for (let i = 0; i < monthLabels.length; i++) {
    const intensity = i % 3 === 0 ? 'high' : i % 3 === 1 ? 'medium' : 'low'
    const focusAreas =
      i % 4 === 0
        ? ['career', 'finance']
        : i % 4 === 1
        ? ['love', 'relationships']
        : i % 4 === 2
        ? ['health', 'spiritual']
        : ['general', 'spiritual']

    events.push({
      id: `month-${i}`,
      monthIndex: i,
      monthLabel: monthLabels[i],
      theme: themes[i % themes.length],
      description: `This month brings opportunities for ${focusAreas.join(' and ')}. Focus on maintaining balance and alignment with your spiritual path.`,
      intensity,
      focusAreas,
      recommendedActions: ['Practice mindfulness', 'Set clear intentions', 'Stay adaptable'],
      cautions: ['Avoid hasty decisions', 'Maintain balance'],
      astroSignals: extractMonthAstroSignals(astroContext, i),
    })
  }

  return events
}

/**
 * Extract astro signals for a specific month
 */
function extractMonthAstroSignals(astroContext: AstroContext, monthIndex: number): AstroSignal[] {
  const signals: AstroSignal[] = []

  // Check if any transit events fall in this month
  if (astroContext.transitEvents) {
    const monthStart = new Date()
    monthStart.setMonth(monthStart.getMonth() + monthIndex)
    const monthEnd = new Date(monthStart)
    monthEnd.setMonth(monthEnd.getMonth() + 1)

    for (const transit of astroContext.transitEvents) {
      const transitStart = new Date(transit.start)
      if (transitStart >= monthStart && transitStart < monthEnd) {
        signals.push({
          label: `${transit.planet} in House ${transit.house}`,
          category: mapHouseToCategory(transit.house),
          strength: transit.intensity >= 4 ? 'high' : transit.intensity >= 3 ? 'medium' : 'low',
          description: transit.theme,
        })
      }
    }
  }

  // Check dasha changes
  if (astroContext.dasha?.next3Events) {
    const monthStart = new Date()
    monthStart.setMonth(monthStart.getMonth() + monthIndex)
    const monthEnd = new Date(monthStart)
    monthEnd.setMonth(monthEnd.getMonth() + 1)

    for (const event of astroContext.dasha.next3Events) {
      const eventStart = new Date(event.from)
      if (eventStart >= monthStart && eventStart < monthEnd) {
        signals.push({
          label: `${event.planet} Period Begins`,
          category: 'general',
          strength: 'high',
          description: event.theme,
        })
      }
    }
  }

  return signals
}

/**
 * Map house number to category
 */
function mapHouseToCategory(house: number): 'career' | 'love' | 'money' | 'health' | 'spiritual' | 'general' {
  const houseMap: Record<number, 'career' | 'love' | 'money' | 'health' | 'spiritual' | 'general'> = {
    1: 'general',
    2: 'money',
    3: 'general',
    4: 'general',
    5: 'spiritual',
    6: 'health',
    7: 'love',
    8: 'health',
    9: 'spiritual',
    10: 'career',
    11: 'money',
    12: 'spiritual',
  }
  return houseMap[house] || 'general'
}

/**
 * Extract overview from text
 */
function extractOverviewFromText(text: string): string {
  const paragraphs = text.split('\n\n').filter((p) => p.trim().length > 50)
  return paragraphs[0] || 'Based on your astrological chart, the next 12 months present a journey of growth and transformation.'
}

/**
 * Get default timeline disclaimers
 */
function getDefaultTimelineDisclaimers(): string[] {
  return [
    'These timeline predictions are based on astrological principles and should be treated as guidance, not absolute certainty.',
    'Individual results may vary. Consult professionals for medical, legal, or financial advice.',
    'These insights are for spiritual guidance only, not absolute fate.',
  ]
}

