/**
 * Prediction Engine (AI Layer)
 * Part B - Section 6: Reports Engine
 * Milestone 6 - Step 2
 * 
 * Interprets astrological data and generates predictions using AI
 */

// Phase 31 - F46: Use validated environment variables
import { retrieveRelevantDocuments } from '@/lib/rag/rag-service'
import { envVars } from '@/lib/env/env.mjs'

export interface PredictionReport {
  personality: {
    overview: string
    traits: string[]
    characteristics: string
  }
  strengths: string[]
  weaknesses: string[]
  career: {
    insights: string
    suitableFields: string[]
    recommendations: string[]
  }
  love: {
    insights: string
    compatibility: string
    recommendations: string[]
  }
  wealth: {
    insights: string
    opportunities: string[]
    precautions: string[]
  }
  health: {
    insights: string
    recommendations: string[]
    emotional: string
  }
  remedies: Array<{
    type: string
    description: string
    ritual: string
    timing: string
  }>
  timeline: Array<{
    month: string
    event: string
    significance: string
    recommendation: string
  }>
}

/**
 * Generate prediction report from normalized data
 */
export async function generatePredictions(normalizedData: any): Promise<PredictionReport> {
  // Retrieve relevant RAG documents
  const ragQuery = buildRAGQuery(normalizedData)
  const ragResults = await retrieveRelevantDocuments(ragQuery, 10)
  
  // Build AI prompt
  const prompt = buildPredictionPrompt(normalizedData, ragResults)
  
  // Generate predictions using AI
  const predictions = await generateAIReport(prompt)
  
  return predictions
}

/**
 * Build RAG query from user data
 */
function buildRAGQuery(data: any): string {
  const parts: string[] = []
  
  if (data.kundali) {
    parts.push(`Rashi: ${data.kundali.rashi}, Nakshatra: ${data.kundali.nakshatra}`)
    parts.push(`Current Dasha: ${data.kundali.currentDasha}`)
  }
  
  if (data.numerology) {
    parts.push(`Life Path: ${data.numerology.lifePathNumber}, Destiny: ${data.numerology.destinyNumber}`)
  }
  
  return parts.join('. ')
}

/**
 * Build comprehensive prediction prompt
 */
function buildPredictionPrompt(data: any, ragResults: any): string {
  const systemPrompt = `You are an expert Vedic astrologer and spiritual guide. Generate a comprehensive prediction report based on the user's astrological and numerological profile.

Provide detailed insights in the following structure:
1. Personality Report (overview, traits, characteristics)
2. Strengths and Weaknesses
3. Career Insights (suitable fields, recommendations)
4. Love/Marriage Insights (compatibility, recommendations)
5. Wealth Insights (opportunities, precautions)
6. Health/Emotional Insights
7. Remedies & Rituals (specific practices with timing)
8. 12-Month Timeline (month-by-month forecast)

Be specific, practical, and grounded in Vedic astrology principles.`

  const userPrompt = `User Profile:
- Name: ${data.user.name}
- Rashi: ${data.kundali?.rashi || data.user.rashi}
- Nakshatra: ${data.kundali?.nakshatra || data.user.nakshatra}
- Lagna: ${data.kundali?.lagna || 'Not available'}
- Current Dasha: ${data.kundali?.currentDasha || 'Not available'}
- Current Antar Dasha: ${data.kundali?.currentAntardasha || 'Not available'}
- Life Path Number: ${data.numerology?.lifePathNumber || 'Not available'}
- Destiny Number: ${data.numerology?.destinyNumber || 'Not available'}
${data.palmistry ? `- Palmistry Score: ${data.palmistry.overallScore}/100` : ''}
${data.aura ? `- Aura Color: ${data.aura.primaryColor}, Energy: ${data.aura.energyScore}/100` : ''}

Relevant Knowledge:
${ragResults.documents.map((doc: any) => `- ${doc.title}: ${doc.content}`).join('\n')}

Generate a comprehensive prediction report in JSON format with the following structure:
{
  "personality": {
    "overview": "...",
    "traits": ["...", "..."],
    "characteristics": "..."
  },
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "career": {
    "insights": "...",
    "suitableFields": ["...", "..."],
    "recommendations": ["...", "..."]
  },
  "love": {
    "insights": "...",
    "compatibility": "...",
    "recommendations": ["...", "..."]
  },
  "wealth": {
    "insights": "...",
    "opportunities": ["...", "..."],
    "precautions": ["...", "..."]
  },
  "health": {
    "insights": "...",
    "recommendations": ["...", "..."],
    "emotional": "..."
  },
  "remedies": [
    {
      "type": "...",
      "description": "...",
      "ritual": "...",
      "timing": "..."
    }
  ],
  "timeline": [
    {
      "month": "...",
      "event": "...",
      "significance": "...",
      "recommendation": "..."
    }
  ]
}`

  return `${systemPrompt}\n\n${userPrompt}`
}

/**
 * Generate report using AI
 */
async function generateAIReport(prompt: string): Promise<PredictionReport> {
  const provider = envVars.ai.provider
  const openaiApiKey = envVars.ai.openaiApiKey
  const geminiApiKey = envVars.ai.geminiApiKey
  
  if (provider === 'gemini' && geminiApiKey) {
    return generateGeminiReport(prompt)
  } else if (openaiApiKey) {
    return generateOpenAIReport(prompt)
  } else {
    throw new Error('No AI provider configured')
  }
}

/**
 * Generate report using OpenAI
 */
async function generateOpenAIReport(prompt: string): Promise<PredictionReport> {
  const openaiApiKey = envVars.ai.openaiApiKey
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured')
  }
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are an expert Vedic astrologer. Always respond with valid JSON only.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    }),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(`OpenAI error: ${error.error?.message || 'Unknown error'}`)
  }
  
  const data = await response.json()
  const content = data.choices[0].message.content
  
  try {
    return JSON.parse(content) as PredictionReport
  } catch (e) {
    // Fallback if JSON parsing fails
    return createFallbackReport()
  }
}

/**
 * Generate report using Gemini
 */
async function generateGeminiReport(prompt: string): Promise<PredictionReport> {
  const geminiApiKey = envVars.ai.geminiApiKey
  if (!geminiApiKey) {
    throw new Error('Gemini API key not configured')
  }
  
  // Note: Adjust endpoint based on actual Gemini API
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: 'You are an expert Vedic astrologer. Always respond with valid JSON only.\n\n' + prompt },
            ],
          },
        ],
      }),
    }
  )
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Gemini error: ${error.error?.message || 'Unknown error'}`)
  }
  
  const data = await response.json()
  const content = data.candidates[0].content.parts[0].text
  
  try {
    return JSON.parse(content) as PredictionReport
  } catch (e) {
    return createFallbackReport()
  }
}

/**
 * Create fallback report if AI fails
 */
function createFallbackReport(): PredictionReport {
  return {
    personality: {
      overview: 'Based on your astrological profile, you have a unique spiritual journey ahead.',
      traits: ['Determined', 'Intuitive', 'Creative'],
      characteristics: 'You possess a balanced nature with strong spiritual inclinations.',
    },
    strengths: ['Leadership qualities', 'Intuitive abilities', 'Creative expression'],
    weaknesses: ['May be overly sensitive', 'Tendency to overthink', 'Need for balance'],
    career: {
      insights: 'Your career path shows potential in creative and leadership roles.',
      suitableFields: ['Arts', 'Management', 'Spiritual guidance'],
      recommendations: ['Focus on your strengths', 'Network actively', 'Continue learning'],
    },
    love: {
      insights: 'Your relationships are guided by emotional depth and spiritual connection.',
      compatibility: 'Best compatibility with water and earth signs.',
      recommendations: ['Communicate openly', 'Trust your intuition', 'Maintain balance'],
    },
    wealth: {
      insights: 'Financial growth is indicated through steady efforts and wise investments.',
      opportunities: ['Real estate', 'Creative ventures', 'Spiritual services'],
      precautions: ['Avoid impulsive decisions', 'Save for future', 'Seek professional advice'],
    },
    health: {
      insights: 'Maintain regular exercise and balanced diet for optimal health.',
      recommendations: ['Yoga and meditation', 'Regular health checkups', 'Stress management'],
      emotional: 'Your emotional well-being benefits from spiritual practices and creative expression.',
    },
    remedies: [
      {
        type: 'Mantra',
        description: 'Chanting specific mantras for your Rashi',
        ritual: 'Daily morning chanting for 108 times',
        timing: 'Early morning, during sunrise',
      },
    ],
    timeline: [
      {
        month: 'Next 3 months',
        event: 'Positive changes in career',
        significance: 'Favorable planetary positions',
        recommendation: 'Take calculated risks',
      },
    ],
  }
}

