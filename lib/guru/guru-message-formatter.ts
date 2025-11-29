/**
 * Guru Message Formatter
 * 
 * MEGA BUILD 1 - Phase 7 Core
 * Formats Guru responses for UI display
 */

import type { GuruResponse } from '@/lib/engines/guru-engine'

export interface FormattedGuruAnswer {
  title?: string
  body: string
  bullets?: string[]
  badges?: Array<{ label: string; type: 'astro' | 'rag' | 'info' }>
}

/**
 * Format Guru response for UI display
 */
export function formatGuruAnswerForUI(response: GuruResponse): FormattedGuruAnswer {
  const badges: Array<{ label: string; type: 'astro' | 'rag' | 'info' }> = []

  if (response.usedAstroContext) {
    badges.push({ label: 'Astro-aligned', type: 'astro' })
  }

  if (response.usedRag) {
    badges.push({ label: 'Based on sacred texts', type: 'rag' })
  }

  // Try to extract title from answer (first sentence or line)
  const lines = response.answer.split('\n').filter((l) => l.trim())
  const firstLine = lines[0] || response.answer
  const title = firstLine.length < 100 && firstLine.endsWith('.') ? firstLine : undefined

  // Extract bullets if answer contains list items
  const bullets = extractKeyAdvicePoints(response.answer)

  // Body is the full answer (or without title if extracted)
  const body = title ? lines.slice(1).join('\n') || response.answer : response.answer

  return {
    title,
    body,
    bullets: bullets.length > 0 ? bullets : undefined,
    badges: badges.length > 0 ? badges : undefined,
  }
}

/**
 * Extract key advice points from answer text
 */
export function extractKeyAdvicePoints(answer: string): string[] {
  const points: string[] = []

  // Look for bullet points (-, *, •, numbered lists)
  const bulletPattern = /^[\s]*[-*•]\s+(.+)$/gm
  const matches = answer.matchAll(bulletPattern)
  for (const match of matches) {
    if (match[1]) {
      points.push(match[1].trim())
    }
  }

  // Look for numbered lists (1., 2., etc.)
  const numberedPattern = /^\d+\.\s+(.+)$/gm
  const numberedMatches = answer.matchAll(numberedPattern)
  for (const match of numberedMatches) {
    if (match[1] && !points.includes(match[1].trim())) {
      points.push(match[1].trim())
    }
  }

  // If no bullets found, try to extract sentences with action verbs
  if (points.length === 0) {
    const sentences = answer.split(/[.!?]+/).filter((s) => s.trim().length > 20)
    const actionVerbs = ['practice', 'chant', 'wear', 'face', 'avoid', 'focus', 'meditate', 'perform']
    for (const sentence of sentences) {
      const lower = sentence.toLowerCase()
      if (actionVerbs.some((verb) => lower.includes(verb))) {
        points.push(sentence.trim())
        if (points.length >= 5) break // Limit to 5 points
      }
    }
  }

  return points.slice(0, 5) // Max 5 points
}

