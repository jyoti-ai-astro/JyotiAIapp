/**
 * Palmistry Analysis Engine
 * Part B - Section 3: Palmistry Engine
 * Part B - Section 4: Milestone 4 - Step 2
 * 
 * AI Vision integration using OpenAI GPT-4 Vision
 */

import { envVars } from '@/lib/env/env.mjs'
import OpenAI from 'openai'
import type { PalmAnalysis } from './types'

export interface PalmAnalysisInput {
  leftPalmUrl: string
  rightPalmUrl: string
}

/**
 * Analyze palm images using OpenAI Vision
 */
export async function analyzePalm(input: PalmAnalysisInput): Promise<PalmAnalysis> {
  const openaiApiKey = envVars.ai.openaiApiKey
  
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY in your environment variables.')
  }

  const openai = new OpenAI({
    apiKey: openaiApiKey,
  })

  const prompt = `
    Analyze these two palm images (Left and Right) for a Vedic Palmistry reading.
    Identify the Life Line, Heart Line, Head Line, and Fate Line.
    Evaluate the mounts (Venus, Jupiter, Saturn, Sun, Mercury).

    Return a strictly valid JSON object with this specific structure:
    {
      "overallScore": number (0-100),
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
        "career": number (0-100),
        "relationships": number (0-100),
        "health": number (0-100),
        "wealth": number (0-100),
        "spirituality": number (0-100)
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

    Ensure all numbers are valid integers between 0-100.
    Shape should be one of: "rectangular", "square", "conical", "spatulate", "philosophical", "mixed"
  `

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // Using gpt-4o for better vision capabilities
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: input.leftPalmUrl } },
            { type: 'image_url', image_url: { url: input.rightPalmUrl } },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 2000,
      temperature: 0.3, // Lower temperature for more consistent analysis
    })

    const content = response.choices[0].message.content
    if (!content) {
      throw new Error('Failed to generate analysis: Empty response from AI')
    }

    const result = JSON.parse(content)

    // Validate and transform the response to match our type structure
    const analysis: PalmAnalysis = {
      leftPalm: {
        lines: Array.isArray(result.leftPalm?.lines) 
          ? result.leftPalm.lines.map((line: string) => ({
              type: 'life' as const,
              start: { x: 0, y: 0 },
              end: { x: 0, y: 0 },
              length: 0,
              depth: 0,
              breaks: [],
            }))
          : [],
        mounts: Array.isArray(result.leftPalm?.mounts)
          ? result.leftPalm.mounts.map((mount: string) => ({
              type: 'jupiter' as const,
              prominence: 0,
              position: { x: 0, y: 0 },
            }))
          : [],
        marks: Array.isArray(result.leftPalm?.marks)
          ? result.leftPalm.marks.map((mark: string) => ({
              type: 'star' as const,
              position: { x: 0, y: 0 },
              significance: mark,
            }))
          : [],
        shape: (result.leftPalm?.shape || 'rectangular') as PalmAnalysis['leftPalm']['shape'],
      },
      rightPalm: {
        lines: Array.isArray(result.rightPalm?.lines)
          ? result.rightPalm.lines.map((line: string) => ({
              type: 'life' as const,
              start: { x: 0, y: 0 },
              end: { x: 0, y: 0 },
              length: 0,
              depth: 0,
              breaks: [],
            }))
          : [],
        mounts: Array.isArray(result.rightPalm?.mounts)
          ? result.rightPalm.mounts.map((mount: string) => ({
              type: 'jupiter' as const,
              prominence: 0,
              position: { x: 0, y: 0 },
            }))
          : [],
        marks: Array.isArray(result.rightPalm?.marks)
          ? result.rightPalm.marks.map((mark: string) => ({
              type: 'star' as const,
              position: { x: 0, y: 0 },
              significance: mark,
            }))
          : [],
        shape: (result.rightPalm?.shape || 'rectangular') as PalmAnalysis['rightPalm']['shape'],
      },
      overallScore: Math.max(0, Math.min(100, result.overallScore || 0)),
      traits: {
        career: Math.max(0, Math.min(100, result.traits?.career || 0)),
        relationships: Math.max(0, Math.min(100, result.traits?.relationships || 0)),
        health: Math.max(0, Math.min(100, result.traits?.health || 0)),
        wealth: Math.max(0, Math.min(100, result.traits?.wealth || 0)),
        spirituality: Math.max(0, Math.min(100, result.traits?.spirituality || 0)),
      },
      predictions: Array.isArray(result.predictions)
        ? result.predictions.map((pred: any) => ({
            category: pred.category || 'General',
            description: pred.description || pred || 'No prediction available',
            timeframe: pred.timeframe || 'Near future',
          }))
        : [],
      createdAt: new Date(),
    }

    return analysis
  } catch (error: any) {
    console.error('AI Vision Analysis Failed:', error)
    
    // Provide a more user-friendly error message
    if (error.message?.includes('API key')) {
      throw new Error('AI service configuration error. Please contact support.')
    } else if (error.message?.includes('rate limit')) {
      throw new Error('Service temporarily unavailable. Please try again in a moment.')
    } else if (error.message?.includes('invalid image')) {
      throw new Error('Could not analyze palm images. Please ensure images are clear and properly formatted.')
    } else {
      throw new Error('Could not analyze palm images. Please ensure images are clear and try again.')
    }
  }
}
