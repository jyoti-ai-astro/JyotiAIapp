/**
 * Aura Types
 * Part B - Section 3: Aura Reading Engine
 */

export interface AuraAnalysis {
  auraColors: string[]
  primaryColor: string
  energyScore: number
  chakraBalance: {
    root: number
    sacral: number
    solar: number
    heart: number
    throat: number
    thirdEye: number
    crown: number
  }
  emotionalState: string
  recommendations: string[]
  createdAt: Date
}

export interface AuraAnalysisInput {
  imageUrl: string
}

