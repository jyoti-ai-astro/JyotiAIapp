/**
 * Credits Overview Widget
 * 
 * Pricing & Payments v3 - Phase M
 * 
 * Shows user's ticket counts and quick purchase CTAs
 */

'use client'

import React from 'react'
import { useUserStore } from '@/store/user-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, BookOpen, TrendingUp, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { getUserTickets } from '@/lib/payments/ticket-service'

export function CreditsOverview() {
  const { user } = useUserStore()
  const [loading, setLoading] = React.useState(false)

  if (!user) {
    return (
      <Card className="bg-cosmic-indigo/60 backdrop-blur-xl border-white/10">
        <CardContent className="p-6 text-center text-white/60">
          Login to see your credits
        </CardContent>
      </Card>
    )
  }

  const [ticketInfo, setTicketInfo] = React.useState<{
    tickets: { aiGuruTickets: number; kundaliTickets: number; lifetimePredictions: number }
    hasSubscription: boolean
    subscriptionPlanId: string | null
  } | null>(null)

  React.useEffect(() => {
    if (!user) return

    const fetchTicketInfo = async () => {
      try {
        const response = await fetch('/api/user/tickets', {
          credentials: 'include',
        })
        if (response.ok) {
          const data = await response.json()
          setTicketInfo({
            tickets: data.tickets || { aiGuruTickets: 0, kundaliTickets: 0, lifetimePredictions: 0 },
            hasSubscription: data.hasSubscription || false,
            subscriptionPlanId: data.subscriptionPlan || null,
          })
        }
      } catch (error) {
        console.error('Failed to fetch ticket info:', error)
      }
    }

    fetchTicketInfo()
  }, [user])

  const tickets = ticketInfo?.tickets || {
    aiGuruTickets: user?.aiGuruTickets || 0,
    kundaliTickets: user?.kundaliTickets || 0,
    lifetimePredictions: user?.lifetimePredictions || 0,
  }
  const hasSubscription = ticketInfo?.hasSubscription || false
  const subscriptionPlanId = ticketInfo?.subscriptionPlanId || null

  return (
    <Card className="bg-cosmic-indigo/60 backdrop-blur-xl border-white/10">
      <CardHeader>
        <CardTitle className="text-gold flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Your Credits
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Ticket Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-black/20 rounded-lg border border-white/5">
            <div className="text-2xl font-bold text-gold">{hasSubscription ? '∞' : tickets.aiGuruTickets}</div>
            <div className="text-xs text-white/60 mt-1">AI Guru Credits</div>
          </div>
          <div className="text-center p-3 bg-black/20 rounded-lg border border-white/5">
            <div className="text-2xl font-bold text-gold">{hasSubscription ? '∞' : tickets.kundaliTickets}</div>
            <div className="text-xs text-white/60 mt-1">Kundali Credits</div>
          </div>
          <div className="text-center p-3 bg-black/20 rounded-lg border border-white/5">
            <div className="text-2xl font-bold text-gold">{hasSubscription ? '∞' : tickets.lifetimePredictions}</div>
            <div className="text-xs text-white/60 mt-1">Predictions</div>
          </div>
        </div>

        {/* Quick Purchase CTAs */}
        {!hasSubscription && (
          <div className="pt-4 border-t border-white/10">
            <p className="text-sm text-white/60 mb-3">Need more credits?</p>
            <div className="flex flex-wrap gap-2">
              <Link href="/pay/99">
                <Button size="sm" variant="outline" className="text-xs">
                  Ask 1 Question — ₹99
                </Button>
              </Link>
              <Link href="/pay/199">
                <Button size="sm" variant="outline" className="text-xs">
                  Ask 3 Questions — ₹199
                </Button>
              </Link>
              <Link href="/pay/299">
                <Button size="sm" variant="outline" className="text-xs">
                  Full Session — ₹299
                </Button>
              </Link>
            </div>
          </div>
        )}

        {hasSubscription && subscriptionPlanId && (
          <div className="pt-4 border-t border-white/10">
            <p className="text-sm text-gold/80">
              ✓ Active {subscriptionPlanId.charAt(0).toUpperCase() + subscriptionPlanId.slice(1)} subscription
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

