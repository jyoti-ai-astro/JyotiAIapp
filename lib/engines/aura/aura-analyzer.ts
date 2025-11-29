/**
 * Aura Analysis Engine
 * Part B - Section 3: Aura Reading Engine
 * Part B - Section 4: Milestone 4 - Step 3
 * 
 * AI Vision integration using Google Gemini Vision
 */

import { envVars } from '@/lib/env/env.mjs'
import { GoogleGenerativeAI } from '@google/generative-ai'
import type { AuraAnalysis } from './types'

export interface AuraAnalysisInput {
  imageUrl: string
}

/**
 * Analyze aura from selfie image using Gemini Vision
 */
export async function analyzeAura(input: AuraAnalysisInput): Promise<AuraAnalysis> {
  const geminiApiKey = envVars.ai.geminiApiKey

  if (!geminiApiKey) {
    throw new Error('Gemini API key not configured. Please set GEMINI_API_KEY in your environment variables.')
  }

  try {
    const genAI = new GoogleGenerativeAI(geminiApiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    // Handle base64 or URL input
    let base64Data: string
    let mimeType = 'image/jpeg'

    if (input.imageUrl.startsWith('data:')) {
      // Base64 data URL
      const parts = input.imageUrl.split(',')
      base64Data = parts[1]
      const mimeMatch = parts[0].match(/data:([^;]+)/)
      if (mimeMatch) {
        mimeType = mimeMatch[1]
      }
    } else if (input.imageUrl.startsWith('http://') || input.imageUrl.startsWith('https://')) {
      // URL - fetch and convert to base64
      const response = await fetch(input.imageUrl)
      const arrayBuffer = await response.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      base64Data = buffer.toString('base64')
      const contentType = response.headers.get('content-type')
      if (contentType) {
        mimeType = contentType
      }
    } else {
      // Assume it's already base64
      base64Data = input.imageUrl
    }

    const prompt = `
      Analyze the aura and energy of the person in this photo based on Vedic color theory and Chakra systems.
      Determine the primary aura color, energy levels, and chakra balance.

      Return ONLY a valid JSON object (no markdown, no code blocks):
      {
        "auraColors": ["string"],
        "primaryColor": "string (must be one of: blue, green, orange, red, violet, indigo, gold)",
        "energyScore": number (0-100),
        "chakraBalance": {
          "root": number (0-100),
          "sacral": number (0-100),
          "solar": number (0-100),
          "heart": number (0-100),
          "throat": number (0-100),
          "thirdEye": number (0-100),
          "crown": number (0-100)
        },
        "emotionalState": "string",
        "recommendations": ["string", "string"]
      }

      Ensure all numbers are valid integers between 0-100.
      Primary color must be one of the specified values.
    `

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType,
        },
      },
    ])

    const response = await result.response
    let text = response.text()

    // Clean markdown code blocks if present
    text = text.replace(/```json|```/g, '').trim()

    // Try to extract JSON if wrapped in other text
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      text = jsonMatch[0]
    }

    const data = JSON.parse(text)

    // Validate and transform the response
    const validPrimaryColors = ['blue', 'green', 'orange', 'red', 'violet', 'indigo', 'gold']
    const primaryColor = validPrimaryColors.includes(data.primaryColor?.toLowerCase())
      ? data.primaryColor.toLowerCase()
      : 'indigo' // Default fallback

    const analysis: AuraAnalysis = {
      auraColors: Array.isArray(data.auraColors) ? data.auraColors : ['indigo', 'violet'],
      primaryColor,
      energyScore: Math.max(0, Math.min(100, data.energyScore || 75)),
      chakraBalance: {
        root: Math.max(0, Math.min(100, data.chakraBalance?.root || 0)),
        sacral: Math.max(0, Math.min(100, data.chakraBalance?.sacral || 0)),
        solar: Math.max(0, Math.min(100, data.chakraBalance?.solar || 0)),
        heart: Math.max(0, Math.min(100, data.chakraBalance?.heart || 0)),
        throat: Math.max(0, Math.min(100, data.chakraBalance?.throat || 0)),
        thirdEye: Math.max(0, Math.min(100, data.chakraBalance?.thirdEye || 0)),
        crown: Math.max(0, Math.min(100, data.chakraBalance?.crown || 0)),
      },
      emotionalState: data.emotionalState || 'balanced',
      recommendations: Array.isArray(data.recommendations)
        ? data.recommendations
        : [
            'Practice daily meditation',
            'Spend time in nature',
            'Maintain regular sleep schedule',
          ],
      createdAt: new Date(),
    }

    return analysis
  } catch (error: any) {
    console.error('Aura Scan Error:', error)

    // Provide user-friendly error messages
    if (error.message?.includes('API key')) {
      throw new Error('AI service configuration error. Please contact support.')
    } else if (error.message?.includes('rate limit') || error.message?.includes('quota')) {
      throw new Error('Service temporarily unavailable. Please try again in a moment.')
    } else if (error.message?.includes('invalid image') || error.message?.includes('parse')) {
      throw new Error('Unable to read aura energy from this image. Please ensure the image is clear and try again.')
    } else {
      throw new Error('Unable to read aura energy from this image. Please try again with a clearer photo.')
    }
  }
}
