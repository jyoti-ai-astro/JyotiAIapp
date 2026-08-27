'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { AlertCircle, Lock, RefreshCw, Send, Sparkles, StopCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useGuruChat, type GuruErrorCode } from '@/lib/hooks/useGuruChat'
import { cn } from '@/lib/utils'
import { useUserStore } from '@/store/user-store'

type TicketSummary = {
  hasSubscription: boolean
  subscriptionPlan?: string
  tickets: {
    aiGuruTickets: number
    kundaliTickets: number
    lifetimePredictions: number
  }
}

const PROMPT_GROUPS = [
  {
    category: 'Today',
    question: 'What should I pay attention to today?',
  },
  {
    category: 'Career',
    question: 'What does my chart suggest about work right now?',
  },
  {
    category: 'Relationships',
    question: 'What patterns should I understand in relationships?',
  },
  {
    category: 'Money',
    question: 'What should I be mindful of financially?',
  },
  {
    category: 'Family',
    question: 'How can I bring more harmony at home?',
  },
  {
    category: 'Current Dasha',
    question: 'What does my current Dasha mean?',
  },
]

function errorCopy(code?: GuruErrorCode, message?: string) {
  switch (code) {
    case 'UNAUTHENTICATED':
      return {
        title: 'Please sign in',
        description: 'Sign in again before asking Jyoti Guru.',
        href: '/login',
        action: 'Sign in',
      }
    case 'NO_TICKETS':
      return {
        title: 'Guru access needed',
        description: 'Add Guru credits or choose a plan to ask another question.',
        href: '/pricing',
        action: 'Get Guru access',
      }
    case 'KUNDALI_REQUIRED':
    case 'ASTRO_CONTEXT_MISSING':
      return {
        title: 'Kundali required',
        description: 'Complete your birth profile and generate your Kundali before asking personalized questions.',
        href: '/kundali',
        action: 'Open Kundali',
      }
    case 'TICKET_CONSUMPTION_FAILED':
      return {
        title: 'Credit confirmation failed',
        description: 'Your answer was not confirmed against a credit. Please retry.',
      }
    case 'GURU_TIMEOUT':
    case 'TIMEOUT':
      return {
        title: 'Guru is taking longer than expected',
        description: 'Please retry in a moment.',
      }
    case 'AI_QUOTA':
    case 'AI_PROVIDER_MISSING':
      return {
        title: 'Guru is temporarily unavailable',
        description: 'The guidance service is not available right now. Please try again later.',
      }
    case 'AI_RATE_LIMIT':
    case 'RATE_LIMITED':
      return {
        title: 'Please wait briefly',
        description: 'Too many requests arrived at once. Try again shortly.',
      }
    case 'MODEL_UNAVAILABLE':
      return {
        title: 'Guru is temporarily unavailable',
        description: 'The selected guidance model is not available right now.',
      }
    case 'MALFORMED_RESPONSE':
      return {
        title: 'Response could not be read',
        description: 'Please retry your question.',
      }
    case 'NETWORK':
      return {
        title: 'Connection lost',
        description: 'Check your connection and retry.',
      }
    default:
      return {
        title: 'Guru could not answer',
        description: message || 'Please retry your question.',
      }
  }
}

export function CosmicGuruChat({
  initialPrompt = '',
  source,
}: {
  initialPrompt?: string
  source?: string
}) {
  const { user } = useUserStore()
  const [input, setInput] = useState('')
  const [failedPrompt, setFailedPrompt] = useState<string | null>(null)
  const [tickets, setTickets] = useState<TicketSummary | null>(null)
  const [ticketsLoading, setTicketsLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const {
    messages,
    sendMessage,
    loading,
    isTyping,
    status,
    errorCode,
    errorMessage,
    reconnect,
    stopGeneration,
  } = useGuruChat()

  const loadTickets = useCallback(async () => {
    if (!user) {
      setTickets(null)
      setTicketsLoading(false)
      return
    }

    try {
      setTicketsLoading(true)
      const response = await fetch('/api/user/tickets', { credentials: 'include' })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || data.message || 'Unable to load Guru access')
      setTickets(data)
    } catch {
      setTickets(null)
    } finally {
      setTicketsLoading(false)
    }
  }, [user])

  useEffect(() => {
    void loadTickets()
  }, [loadTickets])

  useEffect(() => {
    if (initialPrompt && !input && messages.length === 0) {
      setInput(initialPrompt)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [initialPrompt, input, messages.length])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping, status])

  const entitlementLabel = useMemo(() => {
    if (ticketsLoading) return 'Checking access'
    if (!tickets) return 'Access will be checked when you send'
    if (tickets.hasSubscription) return 'Included in your plan'
    const count = tickets.tickets.aiGuruTickets || 0
    return count === 1 ? '1 Guru credit available' : `${count} Guru credits available`
  }, [tickets, ticketsLoading])

  const canAsk =
    Boolean(user) &&
    !ticketsLoading &&
    (tickets?.hasSubscription || (tickets?.tickets.aiGuruTickets || 0) > 0)
  const showPaywall = Boolean(user) && !ticketsLoading && !canAsk
  const errorState = status === 'error' ? errorCopy(errorCode, errorMessage) : null

  const submitPrompt = async (prompt: string) => {
    const trimmed = prompt.trim()
    if (!trimmed || loading) return

    if (!canAsk) {
      setFailedPrompt(trimmed)
      return
    }

    setInput('')
    setFailedPrompt(null)
    const success = await sendMessage(trimmed)
    if (!success) {
      setFailedPrompt(trimmed)
      return
    }
    await loadTickets()
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    await submitPrompt(input)
  }

  const handleRetry = async () => {
    if (!failedPrompt) return
    reconnect()
    await submitPrompt(failedPrompt)
  }

  return (
    <Card className="flex min-h-[70vh] flex-1 flex-col overflow-hidden">
      <CardContent className="flex min-h-[70vh] flex-1 flex-col p-0">
        <div className="border-b border-border bg-surface-raised px-4 py-3 md:px-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div data-guru-status-strip="true" className="flex flex-wrap items-center gap-2">
              <Badge variant="guru">Personal guidance</Badge>
              <Badge variant={tickets?.hasSubscription ? 'success' : 'secondary'}>{entitlementLabel}</Badge>
              {source && initialPrompt && <Badge variant="outline">Prompt prefilled</Badge>}
            </div>
            <p className="text-xs text-muted-foreground">
              The server builds context from your saved Kundali.
            </p>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 space-y-5 overflow-y-auto px-4 py-5 md:px-6"
          aria-live="polite"
        >
          {messages.length === 0 && (
            <FirstRunPrompts onSelect={setInput} />
          )}

          {messages.map((message, index) => {
            const isUser = message.role === 'user'
            return (
              <div
                key={message.id || `${message.role}-${index}`}
                className={cn('flex w-full', isUser ? 'justify-end' : 'justify-start')}
              >
                <article
                  className={cn(
                    'max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-7 md:max-w-[74%] md:text-base',
                    isUser
                      ? 'rounded-br-md bg-primary text-primary-foreground'
                      : 'rounded-bl-md border border-border bg-card text-primary'
                  )}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  {!isUser && message.metadata && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.metadata.usedAstroContext && <Badge variant="premium">Kundali used</Badge>}
                      {message.metadata.usedRag && <Badge variant="outline">Knowledge used</Badge>}
                    </div>
                  )}
                </article>
              </div>
            )
          })}

          {(loading || isTyping) && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-md border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
                Guru is reflecting...
              </div>
            </div>
          )}

          {errorState && (
            <div className="flex justify-center">
              <div className="w-full max-w-xl rounded-xl border border-danger/25 bg-danger/10 p-4">
                <div className="flex gap-3">
                  <AlertCircle className="mt-1 h-5 w-5 shrink-0 text-danger" aria-hidden="true" />
                  <div>
                    <p className="font-medium text-primary">{errorState.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{errorState.description}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {errorState.href && (
                    <Link href={errorState.href}>
                      <Button size="sm">{errorState.action}</Button>
                    </Link>
                  )}
                  {failedPrompt && (
                    <Button size="sm" variant="outline" onClick={handleRetry}>
                      Retry
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {showPaywall && (
          <div className="border-t border-border bg-warning/10 px-4 py-4 md:px-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex gap-3">
                <Lock className="mt-1 h-5 w-5 shrink-0 text-warning" aria-hidden="true" />
                <div>
                  <p className="font-medium text-primary">Guru access needed</p>
                  <p className="text-sm text-muted-foreground">Previous answers stay available. Add credits to ask more.</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Link href="/pay/99">
                  <Button variant="outline" fullWidth>Ask 1 question</Button>
                </Link>
                <Link href="/pay/199">
                  <Button fullWidth>Ask 3 questions</Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="sticky bottom-0 border-t border-border bg-card px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:px-5"
        >
          {!user ? (
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-muted-foreground">Sign in to ask Jyoti Guru with your saved Kundali context.</p>
              <Link href="/login">
                <Button>Sign in</Button>
              </Link>
            </div>
          ) : (
            <>
              <label htmlFor="guru-question" className="sr-only">
                Ask Jyoti Guru
              </label>
              <div className="flex gap-2">
                <Input
                  id="guru-question"
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder={canAsk ? 'Ask about today, career, relationships, money...' : 'Add Guru access to ask a question'}
                  disabled={loading || isTyping || showPaywall}
                  className="min-h-11 flex-1"
                />
                {loading || isTyping ? (
                  <Button type="button" variant="outline" onClick={stopGeneration} iconLeft={<StopCircle className="h-4 w-4" />}>
                    Stop
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={!input.trim() || showPaywall || ticketsLoading}
                    iconLeft={<Send className="h-4 w-4" />}
                  >
                    Send
                  </Button>
                )}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Guidance is reflective and should not replace professional advice.
              </p>
            </>
          )}
        </form>
      </CardContent>
    </Card>
  )
}

function FirstRunPrompts({ onSelect }: { onSelect: (prompt: string) => void }) {
  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center py-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-jyoti-gold/35 bg-jyoti-gold/10 text-primary">
        <Sparkles className="h-5 w-5" aria-hidden="true" />
      </div>
      <h2 className="mt-4 font-heading text-2xl font-semibold text-primary">Ask from where you need clarity.</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
        These prompts fill the composer only. Jyoti Guru will answer after you press Send.
      </p>
      <div className="mt-6 grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PROMPT_GROUPS.map((prompt) => (
          <button data-guru-prompt-card="true"
            key={prompt.category}
            type="button"
            onClick={() => onSelect(prompt.question)}
            className="min-h-24 rounded-xl border border-border bg-surface-raised p-4 text-left transition-colors hover:border-saffron focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Badge variant="outline">{prompt.category}</Badge>
            <p className="mt-3 text-sm font-medium leading-6 text-primary">{prompt.question}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
