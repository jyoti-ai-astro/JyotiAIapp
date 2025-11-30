'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useUserStore } from '@/store/user-store'

export interface GuruMessage {
  id?: string
  role: 'user' | 'guru'
  content: string
  timestamp?: number
  metadata?: {
    usedAstroContext?: boolean
    usedRag?: boolean
    mode?: string
    ragChunks?: Array<{ title?: string; snippet: string; source?: string }>
    status?: 'ok' | 'degraded' | 'error'
  }
}

export type GuruStatus = 'idle' | 'loading' | 'streaming' | 'error' | 'reconnecting'
export type GuruErrorCode =
  | 'UNAUTHENTICATED'
  | 'GURU_TIMEOUT'
  | 'RAG_UNAVAILABLE'
  | 'INTERNAL_ERROR'
  | 'NETWORK'
  | 'UNKNOWN'

export function useGuruChat(sessionId?: string) {
  const { user } = useUserStore()
  const [messages, setMessages] = useState<GuruMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [status, setStatus] = useState<GuruStatus>('idle') // Super Phase C
  const [errorCode, setErrorCode] = useState<GuruErrorCode | undefined>() // Super Phase C
  const [errorMessage, setErrorMessage] = useState<string | undefined>() // Super Phase C
  const abortControllerRef = useRef<AbortController | null>(null) // Super Phase C

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

      // Cancel any in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Create new AbortController
      const abortController = new AbortController()
      abortControllerRef.current = abortController

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
      setStatus('loading') // Super Phase C
      setError(null)
      setErrorCode(undefined)
      setErrorMessage(undefined)

      try {
        // 2. Call the API (Super Phase C - Use new endpoint)
        const res = await fetch('/api/guru', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          signal: abortController.signal,
          body: JSON.stringify({
            messages: [
              ...messages.map((m) => ({
                role: m.role === 'guru' ? 'assistant' : 'user',
                content: m.content,
              })),
              {
                role: 'user',
                content,
              },
            ],
          }),
        })

        // Check if aborted
        if (abortController.signal.aborted) {
          return false
        }

        const data = await res.json()

        // Handle network errors
        if (!res.ok) {
          if (data.code === 'UNAUTHENTICATED') {
            setStatus('error')
            setErrorCode('UNAUTHENTICATED')
            setErrorMessage('Please log in again')
            throw new Error('UNAUTHENTICATED')
          } else if (data.code === 'GURU_TIMEOUT') {
            setStatus('error')
            setErrorCode('GURU_TIMEOUT')
            setErrorMessage('The Guru is overloaded, please try again.')
            throw new Error('GURU_TIMEOUT')
          } else if (data.code === 'RAG_UNAVAILABLE') {
            // RAG unavailable is not a fatal error, continue with degraded mode
            setStatus('degraded' as any)
          } else {
            setStatus('error')
            setErrorCode(data.code || 'INTERNAL_ERROR')
            setErrorMessage(data.message || 'An error occurred')
            throw new Error(data.message || 'Failed to connect to the cosmos.')
          }
        }

        // 3. Add Guru Response with metadata
        const guruMsg: GuruMessage = {
          id: `msg-${Date.now()}-guru`,
          role: 'guru',
          content: data.answer || data.message || 'I apologize, but I could not generate a response.',
          timestamp: Date.now(),
          metadata: {
            usedAstroContext: data.usedAstroContext,
            usedRag: data.usedRag,
            mode: data.mode,
            ragChunks: data.ragChunks,
            status: data.status || 'ok',
          },
        }

        setMessages((prev) => [...prev, guruMsg])
        setStatus(data.status === 'degraded' ? 'idle' : 'idle') // Reset to idle after success

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
        // Don't set error if request was aborted
        if (abortController.signal.aborted || err.name === 'AbortError') {
          return false
        }

        console.error('Guru Chat Error:', err)
        
        // Handle network errors
        if (err.message === 'Failed to fetch' || err.message.includes('network')) {
          setStatus('error')
          setErrorCode('NETWORK')
          setErrorMessage('Network error. Please check your connection.')
        } else if (err.message === 'UNAUTHENTICATED') {
          // Already set above
        } else if (err.message === 'GURU_TIMEOUT') {
          // Already set above
        } else {
          setStatus('error')
          setErrorCode(err.message?.includes('TIMEOUT') ? 'GURU_TIMEOUT' : 'UNKNOWN')
          setErrorMessage(err.message || 'An error occurred')
        }

        const error = err instanceof Error ? err : new Error('Failed to send message')
        setError(error)
        // Keep user message so they can retry
        return false
      } finally {
        setIsLoading(false)
        setIsTyping(false)
        abortControllerRef.current = null
      }
    },
    [messages, isLoading, sessionId]
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
    setErrorCode(undefined)
    setErrorMessage(undefined)
    setStatus('idle')
  }, [])

  const reconnect = useCallback(() => {
    // Super Phase C - Reset state for reconnection
    setStatus('idle')
    setErrorCode(undefined)
    setErrorMessage(undefined)
    setError(null)
  }, [])

  const clearSession = useCallback(() => {
    setMessages([])
    setError(null)
    setErrorCode(undefined)
    setErrorMessage(undefined)
    setStatus('idle')
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
    reconnect, // Super Phase C
    status, // Super Phase C
    errorCode, // Super Phase C
    errorMessage, // Super Phase C
  }
}
