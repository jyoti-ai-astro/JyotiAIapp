export interface GuruMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  context?: {
    kundali?: boolean
    palm?: boolean
    face?: boolean
    aura?: boolean
  }
}

export interface GuruResponse {
  message: string
  recommendedRemedies?: string[]
  recommendedFollowUps?: string[]
  timelineEvents?: TimelineEvent[]
  confidence: number
}

export interface TimelineEvent {
  type: 'prediction' | 'remedy' | 'business' | 'career' | 'relationship'
  title: string
  date: Date
  description: string
}

export interface GuruContext {
  userId: string
  kundali?: any
  palm?: any
  face?: any
  aura?: any
  numerology?: any
  preferences?: string[]
  chatHistory?: GuruMessage[]
}

