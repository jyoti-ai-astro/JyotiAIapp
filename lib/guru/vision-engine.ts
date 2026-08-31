import { callVisionJson } from '@/lib/ai/vision-client'

export interface VisionResult {
  type: 'palm' | 'aura' | 'emotion' | 'kundali' | 'document'
  data: PalmistryData | AuraData | EmotionData | KundaliData | DocumentData
  confidence: number
}

export interface PalmistryData {
  lines: {
    life?: { length: number; clarity: number; breaks: number }
    heart?: { length: number; clarity: number; branches: number }
    head?: { length: number; clarity: number; forks: number }
    fate?: { present: boolean; clarity: number }
  }
  mounts: {
    [key: string]: { prominence: number; characteristics: string[] }
  }
  overall: {
    handType: 'earth' | 'air' | 'fire' | 'water'
    palmShape: string
    reading: string
  }
}

export interface AuraData {
  dominantColor: string
  colorDistribution: { color: string; percentage: number }[]
  energyLevel: number
  chakraStrengths: { name: string; strength: number }[]
  auraReading: string
}

export interface EmotionData {
  primaryEmotion: string
  emotions: { emotion: string; intensity: number }[]
  energyState: 'high' | 'medium' | 'low'
  spiritualAlignment: number
  reading: string
}

export interface KundaliData {
  extractedText: string
  chartType: 'north' | 'south' | 'east' | 'west'
  planets: { name: string; position: string }[]
  houses: { number: number; significance: string }[]
  reading: string
}

export interface DocumentData {
  extractedText: string
  numerology: {
    lifePath?: number
    destiny?: number
    personality?: number
  }
  keyDates: string[]
  reading: string
}

type ImageType = 'palm' | 'face' | 'kundali' | 'document' | 'unknown'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function stringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function numberValue(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}

function fileToVisionImage(file: File): Promise<{ data: string; mimeType: string }> {
  return file.arrayBuffer().then((buffer) => ({
    data: Buffer.from(buffer).toString('base64'),
    mimeType: file.type || 'image/jpeg',
  }))
}

function detectImageTypeFromFilename(file: File): ImageType {
  const filename = file.name.toLowerCase()

  if (filename.includes('palm') || filename.includes('hand')) return 'palm'
  if (
    filename.includes('face') ||
    filename.includes('photo') ||
    filename.includes('selfie')
  ) {
    return 'face'
  }
  if (
    filename.includes('kundali') ||
    filename.includes('chart') ||
    filename.includes('horoscope')
  ) {
    return 'kundali'
  }
  if (
    filename.includes('document') ||
    filename.includes('pdf') ||
    filename.includes('text')
  ) {
    return 'document'
  }

  return 'unknown'
}

function validateVisionResponse(value: unknown): VisionResult[] {
  if (!isRecord(value) || !Array.isArray(value.results)) {
    throw new Error('Invalid Guru Vision response')
  }

  const allowedTypes = new Set([
    'palm',
    'aura',
    'emotion',
    'kundali',
    'document',
  ])

  const results = value.results
    .filter(isRecord)
    .filter((item) => allowedTypes.has(stringValue(item.type)))
    .map((item) => {
      const type = stringValue(item.type) as VisionResult['type']
      const confidence = clamp(numberValue(item.confidence, 0), 0, 1)
      const rawData = isRecord(item.data) ? item.data : {}

      if (type === 'palm') {
        const overall = isRecord(rawData.overall) ? rawData.overall : {}
        const handType = stringValue(overall.handType).toLowerCase()
        const validHandType =
          handType === 'earth' ||
          handType === 'air' ||
          handType === 'fire' ||
          handType === 'water'
            ? handType
            : 'earth'

        const data: PalmistryData = {
          lines: {},
          mounts: {},
          overall: {
            handType: validHandType,
            palmShape: stringValue(overall.palmShape, 'undetermined'),
            reading: stringValue(overall.reading),
          },
        }

        if (!data.overall.reading) {
          throw new Error('Palm analysis is missing a reading')
        }

        return { type, confidence, data } as VisionResult
      }

      if (type === 'aura') {
        const distribution = Array.isArray(rawData.colorDistribution)
          ? rawData.colorDistribution
              .filter(isRecord)
              .map((entry) => ({
                color: stringValue(entry.color),
                percentage: clamp(numberValue(entry.percentage), 0, 100),
              }))
              .filter((entry) => entry.color)
          : []

        const chakras = Array.isArray(rawData.chakraStrengths)
          ? rawData.chakraStrengths
              .filter(isRecord)
              .map((entry) => ({
                name: stringValue(entry.name),
                strength: clamp(numberValue(entry.strength), 0, 10),
              }))
              .filter((entry) => entry.name)
          : []

        const data: AuraData = {
          dominantColor: stringValue(rawData.dominantColor, 'undetermined'),
          colorDistribution: distribution,
          energyLevel: clamp(numberValue(rawData.energyLevel), 0, 10),
          chakraStrengths: chakras,
          auraReading: stringValue(rawData.auraReading),
        }

        if (!data.auraReading) {
          throw new Error('Aura analysis is missing a reading')
        }

        return { type, confidence, data } as VisionResult
      }

      if (type === 'emotion') {
        const emotions = Array.isArray(rawData.emotions)
          ? rawData.emotions
              .filter(isRecord)
              .map((entry) => ({
                emotion: stringValue(entry.emotion),
                intensity: clamp(numberValue(entry.intensity), 0, 1),
              }))
              .filter((entry) => entry.emotion)
          : []

        const rawEnergyState = stringValue(rawData.energyState).toLowerCase()
        const energyState =
          rawEnergyState === 'high' ||
          rawEnergyState === 'medium' ||
          rawEnergyState === 'low'
            ? rawEnergyState
            : 'medium'

        const data: EmotionData = {
          primaryEmotion: stringValue(rawData.primaryEmotion, 'undetermined'),
          emotions,
          energyState,
          spiritualAlignment: clamp(
            numberValue(rawData.spiritualAlignment),
            0,
            10
          ),
          reading: stringValue(rawData.reading),
        }

        if (!data.reading) {
          throw new Error('Image reflection is missing a reading')
        }

        return { type, confidence, data } as VisionResult
      }

      if (type === 'kundali') {
        const planets = Array.isArray(rawData.planets)
          ? rawData.planets
              .filter(isRecord)
              .map((entry) => ({
                name: stringValue(entry.name),
                position: stringValue(entry.position),
              }))
              .filter((entry) => entry.name)
          : []

        const houses = Array.isArray(rawData.houses)
          ? rawData.houses
              .filter(isRecord)
              .map((entry) => ({
                number: Math.round(numberValue(entry.number)),
                significance: stringValue(entry.significance),
              }))
              .filter(
                (entry) =>
                  entry.number >= 1 &&
                  entry.number <= 12 &&
                  entry.significance
              )
          : []

        const chartTypeRaw = stringValue(rawData.chartType).toLowerCase()
        const chartType =
          chartTypeRaw === 'north' ||
          chartTypeRaw === 'south' ||
          chartTypeRaw === 'east' ||
          chartTypeRaw === 'west'
            ? chartTypeRaw
            : 'north'

        const data: KundaliData = {
          extractedText: stringValue(rawData.extractedText),
          chartType,
          planets,
          houses,
          reading: stringValue(rawData.reading),
        }

        if (!data.reading) {
          throw new Error('Kundali image analysis is missing a reading')
        }

        return { type, confidence, data } as VisionResult
      }

      const numerologyRaw = isRecord(rawData.numerology)
        ? rawData.numerology
        : {}

      const data: DocumentData = {
        extractedText: stringValue(rawData.extractedText),
        numerology: {
          ...(typeof numerologyRaw.lifePath === 'number'
            ? { lifePath: numerologyRaw.lifePath }
            : {}),
          ...(typeof numerologyRaw.destiny === 'number'
            ? { destiny: numerologyRaw.destiny }
            : {}),
          ...(typeof numerologyRaw.personality === 'number'
            ? { personality: numerologyRaw.personality }
            : {}),
        },
        keyDates: stringArray(rawData.keyDates),
        reading: stringValue(rawData.reading),
      }

      if (!data.reading) {
        throw new Error('Document analysis is missing a reading')
      }

      return { type, confidence, data } as VisionResult
    })

  if (!results.length) {
    throw new Error('Guru Vision returned no usable results')
  }

  return results
}

function promptForImageType(imageType: ImageType): string {
  return [
    'You are JyotiAI Guru Vision.',
    'Analyze only what is actually visible in the supplied image.',
    'Never invent text, dates, chart placements, palm markings, colors, emotions, chakra measurements, or personal facts that cannot reasonably be inferred from the image.',
    'Do not provide medical, psychiatric, legal, or financial conclusions.',
    'Treat aura, chakra, palmistry, numerology, and spiritual interpretations as reflective or traditional interpretations, not scientifically established measurements.',
    'If the image is unclear or unsuitable, say so in the reading instead of fabricating details.',
    `Filename-based hint: ${imageType}. This hint may be wrong; use the visible image as the authority.`,
    'Return JSON only with this exact top-level shape: {"results":[...]}',
    'Each result must have "type", "confidence", and "data".',
    'Allowed types are palm, aura, emotion, kundali, document.',
    'For palm data include overall.handType, overall.palmShape, overall.reading. Use lines and mounts only when visibly supportable.',
    'For aura data include dominantColor, colorDistribution, energyLevel, chakraStrengths, auraReading. Frame these as symbolic visual interpretation rather than objective measurement.',
    'For emotion data include primaryEmotion, emotions, energyState, spiritualAlignment, reading. Do not claim certainty about a person’s internal emotional state; describe visible-expression impressions only.',
    'For kundali data include extractedText, chartType, planets, houses, reading. Include only text or placements you can actually read from the image.',
    'For document data include extractedText, numerology, keyDates, reading. Calculate numerology only from clearly readable supplied text or dates.',
    'Use confidence from 0 to 1.',
  ].join('\n')
}

export class VisionEngine {
  async analyzeImage(file: File): Promise<VisionResult[]> {
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image')
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new Error('Image file too large (max 10MB)')
    }

    const imageType = detectImageTypeFromFilename(file)
    const image = await fileToVisionImage(file)

    return callVisionJson(
      promptForImageType(imageType),
      [image],
      validateVisionResponse,
      undefined,
      {
        temperature: 0.2,
        maxTokens: 2200,
        timeoutMs: 45000,
      }
    )
  }

  async palmistryAnalysis(file: File): Promise<VisionResult> {
    const results = await this.analyzeImage(file)
    const result = results.find((item) => item.type === 'palm')
    if (!result) throw new Error('No palm analysis was produced')
    return result
  }

  async auraFromFaceAnalysis(file: File): Promise<VisionResult> {
    const results = await this.analyzeImage(file)
    const result = results.find((item) => item.type === 'aura')
    if (!result) throw new Error('No aura reflection was produced')
    return result
  }

  async emotionFromFaceAnalysis(file: File): Promise<VisionResult> {
    const results = await this.analyzeImage(file)
    const result = results.find((item) => item.type === 'emotion')
    if (!result) throw new Error('No expression reflection was produced')
    return result
  }

  async birthChartTextExtractor(file: File): Promise<VisionResult> {
    const results = await this.analyzeImage(file)
    const result = results.find((item) => item.type === 'kundali')
    if (!result) throw new Error('No Kundali image analysis was produced')
    return result
  }

  async numerologyFromDocument(file: File): Promise<VisionResult> {
    const results = await this.analyzeImage(file)
    const result = results.find((item) => item.type === 'document')
    if (!result) throw new Error('No document analysis was produced')
    return result
  }
}
