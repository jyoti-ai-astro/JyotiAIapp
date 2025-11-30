/**
 * Prediction Engine V2
 * 
 * Mega Build 2 - Prediction Engine + Timeline Engine
 * 
 * Clean, reusable Prediction Engine that takes AstroContext and returns
 * structured prediction object for the next 12 months
 */

import type { AstroContext } from './astro-types'
import { callLLM, safeJsonParse, type LLMMessage } from '@/lib/ai/llm-client'
import { getGuruRagContext } from '@/lib/rag/index'

/**
 * Prediction Section - One area of life (career, love, etc.)
 */
export interface PredictionSection {
  id: string // e.g. "career", "love", "money", "health", "spiritual"
  title: string
  summary: string
  score?: number // 1–10 intensity
  opportunities: string[]
  cautions: string[]
  recommendedActions: string[]
  timeframe?: string // e.g. "Next 3 months"
}

/**
 * Astro Signal - Planetary influence indicator
 */
export interface AstroSignal {
  label: string // e.g. "Saturn in 10th House"
  category: 'career' | 'love' | 'money' | 'health' | 'spiritual' | 'general'
  strength?: 'low' | 'medium' | 'high'
  description: string
}

/**
 * Prediction Engine Result
 */
export interface PredictionEngineResult {
  status: 'ok' | 'degraded' | 'error'
  overview: string
  sections: PredictionSection[]
  astroSignals: AstroSignal[]
  disclaimers: string[]
  usedRag: boolean
  usedAstroContext: boolean
}

/**
 * Run Prediction Engine
 */
export async function runPredictionEngine(params: {
  astroContext: AstroContext | null
  userQuestion?: string | null
  ragMode?: 'none' | 'light' | 'full'
  signal?: AbortSignal
}): Promise<PredictionEngineResult> {
  const { astroContext, userQuestion, ragMode = 'light', signal } = params

  let status: 'ok' | 'degraded' | 'error' = 'ok'
  let usedAstroContext = false
  let usedRag = false

  // If astroContext is missing, return degraded with generic content
  if (!astroContext) {
    return {
      status: 'degraded',
      overview:
        'Based on general astrological principles, the next 12 months offer opportunities for growth and transformation across all areas of life.',
      sections: [
        {
          id: 'career',
          title: 'Career',
          summary: 'Focus on building skills and networking. Opportunities may arise through persistence.',
          score: 6,
          opportunities: ['Skill development', 'Networking events', 'Professional growth'],
          cautions: ['Avoid hasty decisions', 'Maintain work-life balance'],
          recommendedActions: ['Set clear goals', 'Seek mentorship', 'Stay adaptable'],
          timeframe: 'Next 12 months',
        },
        {
          id: 'love',
          title: 'Relationships',
          summary: 'Nurture existing relationships and remain open to new connections.',
          score: 7,
          opportunities: ['Deepen bonds', 'New connections', 'Harmony'],
          cautions: ['Communication is key', 'Avoid assumptions'],
          recommendedActions: ['Express gratitude', 'Spend quality time', 'Practice empathy'],
          timeframe: 'Next 12 months',
        },
        {
          id: 'money',
          title: 'Finance',
          summary: 'Financial stability through careful planning and wise investments.',
          score: 6,
          opportunities: ['Savings growth', 'Investment opportunities'],
          cautions: ['Avoid impulsive spending', 'Plan for emergencies'],
          recommendedActions: ['Create budget', 'Save regularly', 'Seek financial advice'],
          timeframe: 'Next 12 months',
        },
        {
          id: 'health',
          title: 'Health',
          summary: 'Maintain wellness through balanced lifestyle and preventive care.',
          score: 7,
          opportunities: ['Fitness goals', 'Wellness routines'],
          cautions: ['Listen to your body', 'Regular check-ups'],
          recommendedActions: ['Exercise regularly', 'Eat balanced meals', 'Manage stress'],
          timeframe: 'Next 12 months',
        },
        {
          id: 'spiritual',
          title: 'Spiritual Growth',
          summary: 'A period of inner reflection and spiritual awakening.',
          score: 8,
          opportunities: ['Meditation practice', 'Spiritual learning'],
          cautions: ['Avoid overthinking', 'Balance material and spiritual'],
          recommendedActions: ['Daily meditation', 'Read spiritual texts', 'Connect with nature'],
          timeframe: 'Next 12 months',
        },
      ],
      astroSignals: [],
      disclaimers: [
        'These predictions are general guidance based on astrological principles.',
        'Individual results may vary. Consult professionals for medical, legal, or financial advice.',
        'These insights are for spiritual guidance only, not absolute certainty.',
      ],
      usedRag: false,
      usedAstroContext: false,
    }
  }

  usedAstroContext = true

  // Build astro context summary
  const astroSummary = buildAstroSummary(astroContext)

  // Get RAG context if enabled
  let ragContext = ''
  if (ragMode !== 'none') {
    try {
      const ragResult = await getGuruRagContext({
        mode: 'general',
        question: userQuestion || 'What are the key predictions for the next 12 months?',
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
  const systemPrompt = buildPredictionSystemPrompt()

  // Build user prompt
  const userPrompt = buildPredictionUserPrompt(astroSummary, ragContext, userQuestion)

  // Call LLM
  let llmResponse = ''
  try {
    const messages: LLMMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]

    llmResponse = await callLLM(messages, signal, {
      temperature: 0.7,
      maxTokens: 3000,
    })

    if (!llmResponse || llmResponse.trim().length === 0) {
      throw new Error('Empty response from LLM')
    }
  } catch (error: any) {
    console.error('Error calling LLM for predictions:', error)
    return {
      status: 'error',
      overview: 'Unable to generate predictions at this time. Please try again later.',
      sections: [],
      astroSignals: [],
      disclaimers: [
        'An error occurred while generating predictions. Please try again.',
      ],
      usedRag,
      usedAstroContext,
    }
  }

  // Parse and normalize LLM response
  try {
    const parsed = parsePredictionResponse(llmResponse, astroContext)
    return {
      status,
      ...parsed,
      usedRag,
      usedAstroContext,
    }
  } catch (error) {
    console.error('Error parsing prediction response:', error)
    // Fallback to structured response
    return {
      status: 'degraded',
      overview: 'Based on your astrological chart, the next 12 months present opportunities for growth across all areas of life.',
      sections: extractSectionsFromText(llmResponse),
      astroSignals: extractAstroSignals(astroContext),
      disclaimers: [
        'These predictions are based on astrological principles and should be treated as guidance, not absolute certainty.',
        'Individual results may vary. Consult professionals for medical, legal, or financial advice.',
      ],
      usedRag,
      usedAstroContext,
    }
  }
}

/**
 * Build astro context summary for prompt
 */
function buildAstroSummary(astroContext: AstroContext): string {
  const parts: string[] = []

  // Chart basics
  if (astroContext.coreChart) {
    parts.push(
      `Sun Sign: ${astroContext.coreChart.sunSign}, Moon Sign: ${astroContext.coreChart.moonSign}, Ascendant: ${astroContext.coreChart.ascendantSign}`
    )

    // Key houses
    const sunHouse = astroContext.coreChart.planets.find((p) => p.planet === 'Sun')?.house
    const moonHouse = astroContext.coreChart.planets.find((p) => p.planet === 'Moon')?.house
    const jupiterHouse = astroContext.coreChart.planets.find((p) => p.planet === 'Jupiter')?.house
    const venusHouse = astroContext.coreChart.planets.find((p) => p.planet === 'Venus')?.house
    const saturnHouse = astroContext.coreChart.planets.find((p) => p.planet === 'Saturn')?.house

    if (sunHouse) parts.push(`Sun in House ${sunHouse} (career/authority focus)`)
    if (moonHouse) parts.push(`Moon in House ${moonHouse} (emotional/domestic focus)`)
    if (jupiterHouse) parts.push(`Jupiter in House ${jupiterHouse} (growth/expansion)`)
    if (venusHouse) parts.push(`Venus in House ${venusHouse} (love/creativity)`)
    if (saturnHouse) parts.push(`Saturn in House ${saturnHouse} (discipline/karma)`)
  }

  // Dasha
  if (astroContext.dasha?.currentMahadasha) {
    parts.push(
      `Current Mahadasha: ${astroContext.dasha.currentMahadasha.planet} (${new Date(astroContext.dasha.currentMahadasha.startDate).toLocaleDateString()} - ${new Date(astroContext.dasha.currentMahadasha.endDate).toLocaleDateString()})`
    )
  }

  if (astroContext.dasha?.currentAntardasha) {
    parts.push(
      `Current Antardasha: ${astroContext.dasha.currentAntardasha.planet} (${new Date(astroContext.dasha.currentAntardasha.startDate).toLocaleDateString()} - ${new Date(astroContext.dasha.currentAntardasha.endDate).toLocaleDateString()})`
    )
  }

  // Life themes
  if (astroContext.lifeThemes && astroContext.lifeThemes.length > 0) {
    const themes = astroContext.lifeThemes.map((t) => `${t.area} (${t.confidence}% confidence)`).join(', ')
    parts.push(`Life Themes: ${themes}`)
  }

  // Transit events
  if (astroContext.transitEvents && astroContext.transitEvents.length > 0) {
    const transits = astroContext.transitEvents
      .slice(0, 3)
      .map((t) => `${t.planet} in House ${t.house} (${t.intensity}/5 intensity)`)
      .join(', ')
    parts.push(`Upcoming Transits: ${transits}`)
  }

  return parts.join('\n')
}

/**
 * Build prediction system prompt
 */
function buildPredictionSystemPrompt(): string {
  return `You are a wise Vedic astrologer providing 12-month predictions based on astrological charts.

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
2. Generate predictions for 5 key areas: career, love, money, health, spiritual
3. For each area, provide:
   - A summary (2-3 sentences)
   - Opportunities (3-5 bullet points)
   - Cautions (2-3 bullet points)
   - Recommended actions (3-5 bullet points)
   - An intensity score (1-10)
4. Identify key astro signals (planetary positions, transits, dasha influences)
5. Provide an overall overview (2-3 paragraphs)

Format your response as JSON with this structure:
{
  "overview": "string",
  "sections": [
    {
      "id": "career",
      "title": "Career",
      "summary": "string",
      "score": 7,
      "opportunities": ["string"],
      "cautions": ["string"],
      "recommendedActions": ["string"],
      "timeframe": "Next 12 months"
    }
  ],
  "astroSignals": [
    {
      "label": "Saturn in 10th House",
      "category": "career",
      "strength": "high",
      "description": "string"
    }
  ],
  "disclaimers": ["string"]
}

Be specific, actionable, and spiritually uplifting.`
}

/**
 * Build prediction user prompt
 */
function buildPredictionUserPrompt(
  astroSummary: string,
  ragContext: string,
  userQuestion?: string | null
): string {
  let prompt = `Based on the following astrological context, provide 12-month predictions:\n\n${astroSummary}\n\n`

  if (ragContext) {
    prompt += `\nRelevant Knowledge:\n${ragContext}\n\n`
  }

  if (userQuestion) {
    prompt += `User's specific question: ${userQuestion}\n\n`
  }

  prompt +=
    'Please provide structured predictions for the next 12 months covering career, love, money, health, and spiritual growth. Return your response as valid JSON only.'

  return prompt
}

/**
 * Parse prediction response from LLM
 */
function parsePredictionResponse(
  llmResponse: string,
  astroContext: AstroContext
): Omit<PredictionEngineResult, 'status' | 'usedRag' | 'usedAstroContext'> {
  // Try to extract JSON from response
  const jsonMatch = llmResponse.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        overview: parsed.overview || 'Based on your astrological chart, the next 12 months present opportunities for growth.',
        sections: normalizeSections(parsed.sections || []),
        astroSignals: normalizeAstroSignals(parsed.astroSignals || []),
        disclaimers: parsed.disclaimers || getDefaultDisclaimers(),
      }
    } catch (error) {
      console.error('Error parsing JSON from LLM response:', error)
    }
  }

  // Fallback: extract from text
  return {
    overview: extractOverviewFromText(llmResponse),
    sections: extractSectionsFromText(llmResponse),
    astroSignals: extractAstroSignals(astroContext),
    disclaimers: getDefaultDisclaimers(),
  }
}

/**
 * Normalize sections
 */
function normalizeSections(sections: any[]): PredictionSection[] {
  const requiredIds = ['career', 'love', 'money', 'health', 'spiritual']
  const normalized: PredictionSection[] = []

  for (const id of requiredIds) {
    const section = sections.find((s) => s.id === id) || {
      id,
      title: id.charAt(0).toUpperCase() + id.slice(1),
      summary: `General guidance for ${id} area.`,
      score: 6,
      opportunities: [],
      cautions: [],
      recommendedActions: [],
      timeframe: 'Next 12 months',
    }

    normalized.push({
      id: section.id || id,
      title: section.title || id.charAt(0).toUpperCase() + id.slice(1),
      summary: section.summary || '',
      score: typeof section.score === 'number' ? Math.max(1, Math.min(10, section.score)) : 6,
      opportunities: Array.isArray(section.opportunities) ? section.opportunities : [],
      cautions: Array.isArray(section.cautions) ? section.cautions : [],
      recommendedActions: Array.isArray(section.recommendedActions) ? section.recommendedActions : [],
      timeframe: section.timeframe || 'Next 12 months',
    })
  }

  return normalized
}

/**
 * Normalize astro signals
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
 * Extract sections from text (fallback)
 */
function extractSectionsFromText(text: string): PredictionSection[] {
  const sections: PredictionSection[] = []
  const ids = ['career', 'love', 'money', 'health', 'spiritual']
  const titles = ['Career', 'Relationships', 'Finance', 'Health', 'Spiritual Growth']

  for (let i = 0; i < ids.length; i++) {
    const id = ids[i]
    const title = titles[i]

    // Try to find section in text
    const sectionMatch = text.match(new RegExp(`${title}[\\s\\S]{0,500}`, 'i'))
    const summary = sectionMatch ? sectionMatch[0].substring(0, 200) : `General guidance for ${id} area.`

    sections.push({
      id,
      title,
      summary,
      score: 6,
      opportunities: [],
      cautions: [],
      recommendedActions: [],
      timeframe: 'Next 12 months',
    })
  }

  return sections
}

/**
 * Extract overview from text
 */
function extractOverviewFromText(text: string): string {
  // Try to find first paragraph
  const paragraphs = text.split('\n\n').filter((p) => p.trim().length > 50)
  return paragraphs[0] || 'Based on your astrological chart, the next 12 months present opportunities for growth.'
}

/**
 * Extract astro signals from context
 */
function extractAstroSignals(astroContext: AstroContext): AstroSignal[] {
  const signals: AstroSignal[] = []

  if (astroContext.coreChart) {
    const sunHouse = astroContext.coreChart.planets.find((p) => p.planet === 'Sun')?.house
    if (sunHouse === 10) {
      signals.push({
        label: 'Sun in 10th House',
        category: 'career',
        strength: 'high',
        description: 'Strong career focus and leadership potential indicated.',
      })
    }

    const venusHouse = astroContext.coreChart.planets.find((p) => p.planet === 'Venus')?.house
    if (venusHouse === 7) {
      signals.push({
        label: 'Venus in 7th House',
        category: 'love',
        strength: 'high',
        description: 'Harmonious relationships and partnership focus.',
      })
    }
  }

  if (astroContext.dasha?.currentMahadasha) {
    signals.push({
      label: `${astroContext.dasha.currentMahadasha.planet} Mahadasha`,
      category: 'general',
      strength: 'high',
      description: `Major life period influenced by ${astroContext.dasha.currentMahadasha.planet}.`,
    })
  }

  return signals
}

/**
 * Get default disclaimers
 */
function getDefaultDisclaimers(): string[] {
  return [
    'These predictions are based on astrological principles and should be treated as guidance, not absolute certainty.',
    'Individual results may vary. Consult professionals for medical, legal, or financial advice.',
    'These insights are for spiritual guidance only, not absolute fate.',
  ]
}

