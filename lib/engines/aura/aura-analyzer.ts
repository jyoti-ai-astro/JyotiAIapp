/**
 * Aura Analysis Engine
 */

import { callVisionJson } from '@/lib/ai/vision-client'
import type { AuraAnalysis } from './types'

export interface AuraAnalysisInput {
  imageUrl: string
}

type RawAuraAnalysis = {
  auraColors?: unknown[]
  primaryColor?: string
  energyScore?: number
  chakraBalance?: {
    root?: number
    sacral?: number
    solar?: number
    heart?: number
    throat?: number
    thirdEye?: number
    crown?: number
  }
  emotionalState?: string
  recommendations?: unknown[]
}

const validPrimaryColors = [
  'blue',
  'green',
  'orange',
  'red',
  'violet',
  'indigo',
  'gold',
] as const

function bounded(value: unknown): number {
  const number = Number(value)
  if (!Number.isFinite(number)) return 0
  return Math.max(0, Math.min(100, Math.round(number)))
}

function validateAuraPayload(value: unknown): RawAuraAnalysis {
  if (!value || typeof value !== 'object') {
    throw new Error('Invalid aura response')
  }

  const data = value as RawAuraAnalysis

  if (
    !Array.isArray(data.auraColors) ||
    typeof data.primaryColor !== 'string' ||
    typeof data.energyScore !== 'number' ||
    !data.chakraBalance ||
    typeof data.emotionalState !== 'string' ||
    !Array.isArray(data.recommendations)
  ) {
    throw new Error('Incomplete aura response')
  }

  if (!validPrimaryColors.includes(data.primaryColor.toLowerCase() as any)) {
    throw new Error('Invalid aura primary color')
  }

  return data
}

export async function analyzeAura(input: AuraAnalysisInput): Promise<AuraAnalysis> {
  const prompt = `
Analyze the aura and energy of the person in this photo based on Vedic color theory and Chakra systems.

Determine the primary aura color, energy levels, and chakra balance.

Return ONLY a valid JSON object:
{
  "auraColors": ["string"],
  "primaryColor": "blue | green | orange | red | violet | indigo | gold",
  "energyScore": number,
  "chakraBalance": {
    "root": number,
    "sacral": number,
    "solar": number,
    "heart": number,
    "throat": number,
    "thirdEye": number,
    "crown": number
  },
  "emotionalState": "string",
  "recommendations": ["string", "string"]
}

All scores must be integers from 0 through 100.
`

  const data = await callVisionJson(
    prompt,
    [{ url: input.imageUrl }],
    validateAuraPayload,
    undefined,
    {
      temperature: 0.3,
      maxTokens: 2000,
    }
  )

  const primaryColor =
    data.primaryColor!.toLowerCase() as AuraAnalysis['primaryColor']

  return {
    auraColors: data.auraColors!.map((color) => String(color)),
    primaryColor,
    energyScore: bounded(data.energyScore),

    chakraBalance: {
      root: bounded(data.chakraBalance?.root),
      sacral: bounded(data.chakraBalance?.sacral),
      solar: bounded(data.chakraBalance?.solar),
      heart: bounded(data.chakraBalance?.heart),
      throat: bounded(data.chakraBalance?.throat),
      thirdEye: bounded(data.chakraBalance?.thirdEye),
      crown: bounded(data.chakraBalance?.crown),
    },

    emotionalState: data.emotionalState!,
    recommendations: data.recommendations!.map((item) => String(item)),
    createdAt: new Date(),
  }
}
