/**
 * Guru Chat Hook
 * 
 * Hook for GuruChatEngine with session management
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { guruEngine, type GuruMessage, type GuruSession } from '@/lib/engines/guru-engine';
import { useUserStore } from '@/store/user-store';
import { useEngineResultsStore } from '@/store/engine-results-store';

export function useGuruChat(sessionId?: string) {
  const { user } = useUserStore();
  const engineResults = useEngineResultsStore((state) => state.results);
  const [session, setSession] = useState<GuruSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  // Initialize or get session
  useEffect(() => {
    if (!user) return;
    
    const currentSessionId = sessionId || `session-${user.uid}`;
    const existingSession = guruEngine.getSession(currentSessionId);
    
    if (existingSession) {
      setSession(existingSession);
    } else {
      const newSession = guruEngine.createSession(currentSessionId);
      setSession(newSession);
    }
  }, [user, sessionId]);

  // Inject engine results for context
  useEffect(() => {
    if (session) {
      guruEngine.injectEngineResults(session.id, engineResults);
    }
  }, [session, engineResults]);

  const sendMessage = useCallback(async (message: string): Promise<GuruMessage | null> => {
    if (!session || !message.trim()) return null;

    try {
      setLoading(true);
      setIsTyping(true);
      setError(null);

      // Simulate typing delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const response = await guruEngine.sendMessage(session.id, message);
      
      // Update session
      const updatedSession = guruEngine.getSession(session.id);
      if (updatedSession) {
        setSession(updatedSession);
      }

      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to send message');
      setError(error);
      return null;
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  }, [session]);

  const clearSession = useCallback(() => {
    if (session) {
      guruEngine.clearSession(session.id);
      const newSession = guruEngine.createSession(session.id);
      setSession(newSession);
    }
  }, [session]);

  return {
    session,
    messages: session?.messages || [],
    loading,
    error,
    isTyping,
    sendMessage,
    clearSession,
  };
}

