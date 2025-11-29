'use client'

import { useState, useCallback, useEffect } from 'react'
import { useUserStore } from '@/store/user-store'

export interface GuruMessage {
  id?: string
  role: 'user' | 'guru'
  content: string
  timestamp?: number
}

export function useGuruChat(sessionId?: string) {
  const { user } = useUserStore()
  const [messages, setMessages] = useState<GuruMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [isTyping, setIsTyping] = useState(false)

  // Load history on mount (from localStorage for now)
  useEffect(() => {
    async function loadHistory() {
      if (!sessionId) return

      try {
        const stored = localStorage.getItem(`guru-history-${sessionId}`)
        if (stored) {
          try {
            const history = JSON.parse(stored)
            const chatMessages: GuruMessage[] = history.map((msg: any, idx: number) => ({
              id: `msg-${idx}-${msg.role}`,
              role: msg.role === 'assistant' ? 'guru' : 'user',
              content: msg.content,
              timestamp: msg.timestamp || Date.now(),
            }))
            setMessages(chatMessages)
          } catch {
            // Ignore parse errors
          }
        }
      } catch (err) {
        console.error('Error loading history:', err)
      }
    }

    loadHistory()
  }, [sessionId])

  const sendMessage = useCallback(
    async (content: string): Promise<boolean> => {
      if (!content.trim() || isLoading) return false

      // 1. Optimistic Update
      const userMsg: GuruMessage = {
        id: `msg-${Date.now()}-user`,
        role: 'user',
        content,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, userMsg])
      setIsLoading(true)
      setIsTyping(true)
      setError(null)

      try {
        // 2. Call the API (Server-Side Logic happens here)
        const res = await fetch('/api/guru/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            message: content,
            contextType: 'general', // Optional context hint
          }),
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Failed to connect to the cosmos.')
        }

        // 3. Add Guru Response
        const guruMsg: GuruMessage = {
          id: `msg-${Date.now()}-guru`,
          role: 'guru',
          content: data.response || data.answer || data.message || 'I apologize, but I could not generate a response.',
          timestamp: Date.now(),
        }

        setMessages((prev) => [...prev, guruMsg])

        // Save to localStorage for persistence
        if (sessionId) {
          try {
            const history = [
              ...messages.map((m) => ({
                role: m.role === 'guru' ? 'assistant' : 'user',
                content: m.content,
                timestamp: m.timestamp || Date.now(),
              })),
              {
                role: 'user',
                content,
                timestamp: Date.now(),
              },
              {
                role: 'assistant',
                content: guruMsg.content,
                timestamp: Date.now(),
              },
            ]
            localStorage.setItem(`guru-history-${sessionId}`, JSON.stringify(history.slice(-20)))
          } catch {
            // Ignore localStorage errors
          }
        }

        return true
      } catch (err: any) {
        console.error('Guru Chat Error:', err)
        const error = err instanceof Error ? err : new Error('Failed to send message')
        setError(error)
        // Keep user message so they can retry
        return false
      } finally {
        setIsLoading(false)
        setIsTyping(false)
      }
    },
    [messages, isLoading, sessionId]
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const clearSession = useCallback(() => {
    setMessages([])
    setError(null)
    if (sessionId) {
      localStorage.removeItem(`guru-history-${sessionId}`)
    }
  }, [sessionId])

  return {
    messages,
    sendMessage,
    isLoading,
    loading: isLoading, // Alias for backward compatibility
    error,
    isTyping,
    clearError,
    clearSession,
  }
}
