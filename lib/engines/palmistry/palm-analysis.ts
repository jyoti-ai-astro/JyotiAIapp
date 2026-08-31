/**
 * Palmistry Analysis Engine
 */

import { callVisionJson } from '@/lib/ai/vision-client'
import type { PalmAnalysis } from './types'

export interface PalmAnalysisInput {
  leftPalmUrl: string
  rightPalmUrl: string
}

type RawPalmAnalysis = {
  overallScore?: number
  leftPalm?: {
    lines?: unknown[]
    mounts?: unknown[]
    marks?: unknown[]
    shape?: string
  }
  rightPalm?: {
    lines?: unknown[]
    mounts?: unknown[]
    marks?: unknown[]
    shape?: string
  }
  traits?: {
    career?: number
    relationships?: number
    health?: number
    wealth?: number
    spirituality?: number
  }
  predictions?: unknown[]
  recommendedMantra?: string
}

function bounded(value: unknown): number {
  const number = Number(value)
  if (!Number.isFinite(number)) return 0
  return Math.max(0, Math.min(100, Math.round(number)))
}

function validatePalmPayload(value: unknown): RawPalmAnalysis {
  if (!value || typeof value !== 'object') {
    throw new Error('Invalid palmistry response')
  }

  const data = value as RawPalmAnalysis

  if (!data.leftPalm || !data.rightPalm || !data.traits) {
    throw new Error('Incomplete palmistry response')
  }

  return data
}

export async function analyzePalm(input: PalmAnalysisInput): Promise<PalmAnalysis> {
  const prompt = `
Analyze these two palm images (Left and Right) for a Vedic Palmistry reading.

Identify the Life Line, Heart Line, Head Line, and Fate Line.
Evaluate the mounts (Venus, Jupiter, Saturn, Sun, Mercury).

Return ONLY a valid JSON object with this structure:
{
  "overallScore": number,
  "leftPalm": {
    "lines": ["string"],
    "mounts": ["string"],
    "marks": ["string"],
    "shape": "string"
  },
  "rightPalm": {
    "lines": ["string"],
    "mounts": ["string"],
    "marks": ["string"],
    "shape": "string"
  },
  "traits": {
    "career": number,
    "relationships": number,
    "health": number,
    "wealth": number,
    "spirituality": number
  },
  "predictions": [
    {
      "category": "string",
      "description": "string",
      "timeframe": "string"
    }
  ],
  "recommendedMantra": "string"
}

All scores must be integers from 0 through 100.
Shape must be one of rectangular, square, conical, spatulate, philosophical, mixed.
`

  const result = await callVisionJson(
    prompt,
    [
      { url: input.leftPalmUrl },
      { url: input.rightPalmUrl },
    ],
    validatePalmPayload,
    undefined,
    {
      temperature: 0.3,
      maxTokens: 2000,
    }
  )

  const analysis: PalmAnalysis = {
    leftPalm: {
      lines: Array.isArray(result.leftPalm?.lines)
        ? result.leftPalm.lines.map(() => ({
            type: 'life' as const,
            start: { x: 0, y: 0 },
            end: { x: 0, y: 0 },
            length: 0,
            depth: 0,
            breaks: [],
          }))
        : [],
      mounts: Array.isArray(result.leftPalm?.mounts)
        ? result.leftPalm.mounts.map(() => ({
            type: 'jupiter' as const,
            prominence: 0,
            position: { x: 0, y: 0 },
          }))
        : [],
      marks: Array.isArray(result.leftPalm?.marks)
        ? result.leftPalm.marks.map((mark: any) => ({
            type: 'star' as const,
            position: { x: 0, y: 0 },
            significance: String(mark),
          }))
        : [],
      shape: (result.leftPalm?.shape || 'rectangular') as PalmAnalysis['leftPalm']['shape'],
    },

    rightPalm: {
      lines: Array.isArray(result.rightPalm?.lines)
        ? result.rightPalm.lines.map(() => ({
            type: 'life' as const,
            start: { x: 0, y: 0 },
            end: { x: 0, y: 0 },
            length: 0,
            depth: 0,
            breaks: [],
          }))
        : [],
      mounts: Array.isArray(result.rightPalm?.mounts)
        ? result.rightPalm.mounts.map(() => ({
            type: 'jupiter' as const,
            prominence: 0,
            position: { x: 0, y: 0 },
          }))
        : [],
      marks: Array.isArray(result.rightPalm?.marks)
        ? result.rightPalm.marks.map((mark: any) => ({
            type: 'star' as const,
            position: { x: 0, y: 0 },
            significance: String(mark),
          }))
        : [],
      shape: (result.rightPalm?.shape || 'rectangular') as PalmAnalysis['rightPalm']['shape'],
    },

    overallScore: bounded(result.overallScore),

    traits: {
      career: bounded(result.traits?.career),
      relationships: bounded(result.traits?.relationships),
      health: bounded(result.traits?.health),
      wealth: bounded(result.traits?.wealth),
      spirituality: bounded(result.traits?.spirituality),
    },

    predictions: Array.isArray(result.predictions)
      ? result.predictions.map((prediction: any) => ({
          category: prediction?.category || 'General',
          description:
            prediction?.description ||
            (typeof prediction === 'string' ? prediction : 'No prediction available'),
          timeframe: prediction?.timeframe || 'Near future',
        }))
      : [],

    createdAt: new Date(),
  }

  return analysis
}
