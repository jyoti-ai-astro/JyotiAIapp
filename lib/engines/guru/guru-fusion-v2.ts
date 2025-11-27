/**
 * Guru Deep Fusion V2
 * Part B - Section 5: AI Guru
 * Milestone 8 - Step 11
 * 
 * Enhanced Guru engine that merges all available data sources
 */

import { generateGuruResponse, type GuruContext } from './guru-engine'
import { consolidatePredictions } from '@/lib/engines/prediction/consolidation-layer'
import { generateGuruResponse, type GuruContext } from './guru-engine'
import type { PredictionReport } from '@/lib/engines/reports/prediction-engine'

export interface EnhancedGuruResponse {
  answer: string
  sources: Array<{
    id: string
    title: string
    category: string
  }>
  contextUsed: {
    kundali: boolean
    numerology: boolean
    palmistry: boolean
    aura: boolean
    rag: boolean
    consolidated: boolean
  }
  confidence: number
  relatedInsights: {
    personality?: string
    career?: string
    love?: string
    health?: string
  }
}

/**
 * Generate enhanced Guru response with full fusion
 */
export async function generateEnhancedGuruResponse(
  question: string,
  fullContext: {
    kundali?: any
    numerology?: any
    palmistry?: any
    aura?: any
    predictions?: PredictionReport
  },
  contextType: 'general' | 'kundali' | 'numerology' | 'palmistry' | 'aura' = 'general'
): Promise<EnhancedGuruResponse> {
  // Build enhanced context
  const enhancedContext: GuruContext = {
    kundali: fullContext.kundali
      ? {
          rashi: fullContext.kundali.grahas?.moon?.sign || '',
          nakshatra: fullContext.kundali.grahas?.moon?.nakshatra || '',
          lagna: fullContext.kundali.lagna?.sign || '',
          currentDasha: fullContext.kundali.dasha?.currentMahadasha?.planet || '',
        }
      : undefined,
    numerology: fullContext.numerology
      ? {
          lifePathNumber: fullContext.numerology.lifePathNumber || 0,
          destinyNumber: fullContext.numerology.destinyNumber || 0,
        }
      : undefined,
    palmistry: fullContext.palmistry
      ? {
          overallScore: fullContext.palmistry.overallScore || 0,
        }
      : undefined,
    aura: fullContext.aura
      ? {
          primaryColor: fullContext.aura.primaryColor || '',
          energyScore: fullContext.aura.energyScore || 0,
        }
      : undefined,
  }

  // Consolidate predictions if available
  let consolidatedPredictions = null
  if (fullContext.predictions) {
    consolidatedPredictions = consolidatePredictions(
      fullContext.predictions,
      fullContext.numerology,
      fullContext.aura,
      fullContext.palmistry
    )
  }

  // Generate base Guru response
  const baseResponse = await generateGuruResponse(question, enhancedContext, contextType)

  // Enhance with consolidated predictions
  const enhancedAnswer = enhanceAnswerWithPredictions(
    baseResponse.answer,
    question,
    consolidatedPredictions,
    fullContext
  )

  // Extract related insights
  const relatedInsights = extractRelatedInsights(question, consolidatedPredictions)

  // Calculate confidence
  const confidence = calculateResponseConfidence(
    baseResponse.contextUsed,
    consolidatedPredictions !== null
  )

  return {
    answer: enhancedAnswer,
    sources: baseResponse.sources,
    contextUsed: {
      ...baseResponse.contextUsed,
      consolidated: consolidatedPredictions !== null,
    },
    confidence,
    relatedInsights,
  }
}

/**
 * Enhance answer with consolidated predictions
 */
function enhanceAnswerWithPredictions(
  baseAnswer: string,
  question: string,
  consolidated: any,
  fullContext: any
): string {
  if (!consolidated) {
    return baseAnswer
  }

  // Add relevant consolidated insights based on question
  const questionLower = question.toLowerCase()
  let enhanced = baseAnswer

  if (questionLower.includes('career') || questionLower.includes('business') || questionLower.includes('work')) {
    if (consolidated.career) {
      enhanced += `\n\nBased on consolidated analysis: ${consolidated.career.merged}`
    }
  }

  if (questionLower.includes('love') || questionLower.includes('relationship') || questionLower.includes('marriage')) {
    if (consolidated.love) {
      enhanced += `\n\nConsolidated relationship insights: ${consolidated.love.merged}`
    }
  }

  if (questionLower.includes('health') || questionLower.includes('wellness')) {
    if (consolidated.health) {
      enhanced += `\n\nCombined health analysis: ${consolidated.health.merged}`
    }
  }

  if (questionLower.includes('money') || questionLower.includes('wealth') || questionLower.includes('finance')) {
    if (consolidated.wealth) {
      enhanced += `\n\nFinancial insights from all sources: ${consolidated.wealth.merged}`
    }
  }

  return enhanced
}

/**
 * Extract related insights
 */
function extractRelatedInsights(question: string, consolidated: any): {
  personality?: string
  career?: string
  love?: string
  health?: string
} {
  if (!consolidated) {
    return {}
  }

  const questionLower = question.toLowerCase()
  const insights: any = {}

  if (questionLower.includes('personality') || questionLower.includes('character')) {
    insights.personality = consolidated.personality?.merged
  }

  if (questionLower.includes('career') || questionLower.includes('business')) {
    insights.career = consolidated.career?.merged
  }

  if (questionLower.includes('love') || questionLower.includes('relationship')) {
    insights.love = consolidated.love?.merged
  }

  if (questionLower.includes('health')) {
    insights.health = consolidated.health?.merged
  }

  return insights
}

/**
 * Calculate response confidence
 */
function calculateResponseConfidence(
  contextUsed: any,
  hasConsolidated: boolean
): number {
  let confidence = 50

  if (contextUsed.kundali) confidence += 20
  if (contextUsed.numerology) confidence += 10
  if (contextUsed.palmistry) confidence += 10
  if (contextUsed.aura) confidence += 10
  if (contextUsed.rag) confidence += 10
  if (hasConsolidated) confidence += 10

  return Math.min(confidence, 100)
}

