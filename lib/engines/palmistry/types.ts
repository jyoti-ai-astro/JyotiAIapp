/**
 * Palmistry Types
 * Part B - Section 3: Palmistry Engine
 */

export interface PalmLine {
  type: 'life' | 'heart' | 'head' | 'fate' | 'sun' | 'mercury'
  start: { x: number; y: number }
  end: { x: number; y: number }
  length: number
  depth: number
  breaks: number[]
}

export interface PalmMount {
  type: 'jupiter' | 'saturn' | 'sun' | 'mercury' | 'mars' | 'venus' | 'moon'
  prominence: number
  position: { x: number; y: number }
}

export interface PalmMark {
  type: 'star' | 'cross' | 'triangle' | 'square' | 'island' | 'grille'
  position: { x: number; y: number }
  significance: string
}

export interface PalmData {
  lines: PalmLine[]
  mounts: PalmMount[]
  marks: PalmMark[]
  shape: 'rectangular' | 'square' | 'conical' | 'spatulate' | 'philosophical' | 'mixed'
}

export interface PalmAnalysis {
  leftPalm: PalmData
  rightPalm: PalmData
  overallScore: number
  traits: {
    career: number
    relationships: number
    health: number
    wealth: number
    spirituality: number
  }
  predictions: Array<{
    category: string
    description: string
    timeframe: string
  }>
  createdAt: Date
}
